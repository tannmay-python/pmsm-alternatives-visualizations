import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";

/** One field of view for the whole tour; framing.ts solves distance from it. */
const FOV = 32;
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { Car } from "./Car";
import { Motor } from "./Motor";
import { AxialFlux } from "./AxialFlux";
import { Callout } from "./Callout";
import { AXIAL, MOTOR, explodeZ } from "./geometry";
import { getBalancedPhaseStrengths } from "../models/pmsmTurn";
import { ROTORS, type RotorId } from "./rotors/registry";
import type { Stop, StopState } from "../route/route";
import { type StageControls } from "./controls";
import { axialBounds, cameraFor, carBounds, motorBounds, type ShotName } from "./framing";
import { stageForState } from "../route/route";
import "./Stage.css";

/**
 * One canvas for the whole tour. Stops move the camera rather than remounting
 * the scene, so the machine stays the same object the reader has been looking
 * at from the moment it was first opened.
 */

/**
 * Applies the solved camera to the live controls. Framing itself is computed
 * in framing.ts from the machine's own constants, so this only has to move the
 * camera there and let OrbitControls take over.
 */
function ApplyCamera({
  position,
  target,
  controlsRef,
  animate,
}: {
  position: readonly [number, number, number];
  target: readonly [number, number, number];
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  animate: boolean;
}) {
  const camera = useThree((s) => s.camera);
  const key = `${position.join()}|${target.join()}`;

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return undefined;

    const to = new THREE.Vector3(...position);
    const toTarget = new THREE.Vector3(...target);

    if (!animate) {
      camera.position.copy(to);
      controls.target.copy(toTarget);
      controls.update();
      return undefined;
    }

    // Eased outside the R3F loop so the move does not depend on anything else
    // in the scene subscribing to a frame.
    let frame = 0;
    const from = camera.position.clone();
    const fromTarget = controls.target.clone();
    const start = performance.now();
    const duration = 620;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      camera.position.lerpVectors(from, to, eased);
      controls.target.lerpVectors(fromTarget, toTarget, eased);
      controls.update();
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // `key` collapses the position and target arrays into one stable dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, animate, camera, controlsRef]);

  return null;
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={1.15} />
      {/* Key from high front-left. */}
      <directionalLight
        position={[-5, 6, 6]}
        intensity={1.9}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />
      {/* Fill from the right, keeping shadow sides light enough to read. */}
      <directionalLight position={[5, 2, -4]} intensity={0.9} color="#e8efe9" />
      {/* Bounce off the pale ground, which is what a light studio actually does. */}
      <hemisphereLight args={["#ffffff", "#c8cec9", 0.8]} />

      {/*
        A procedural studio environment. Machined steel only reads as machined
        when it has something to reflect, and building the softboxes here rather
        than loading an HDR keeps the page self-contained and offline-safe.
      */}
      <Environment resolution={256} frames={1} environmentIntensity={0.75}>
        <color attach="background" args={["#eef0ec"]} />
        <Lightformer form="rect" intensity={4} position={[-4, 4, 4]} scale={[8, 5, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={2.6} position={[5, 2, 2]} scale={[5, 6, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={2.4} position={[0, 3, -6]} scale={[10, 3, 1]} target={[0, 0, 0]} />
        <Lightformer form="ring" intensity={1.8} position={[0, -4, 2]} scale={6} target={[0, 0, 0]} />
      </Environment>
    </>
  );
}

/**
 * States whose subject is the air gap: what the stator field does, and how the
 * rotor answers it. The housing and end caps hide exactly that, so they come off.
 */
const CUTAWAY_STATES = new Set([
  "one-phase",
  "three-phases",
  "no-part-moves",
  "rotor-locks",
  "why-buried",
  "lopsided",
  "reluctance",
  "load-angle",
  "already-both",
  "cage",
  "slip",
  "cage-tradeoff",
  "mixed-axle",
  "wound",
  "wound-wins",
  "wound-costs",
  "brushes-ship",
  "contactless",
  "synrm",
  "power-factor",
  "pm-assisted",
  "srm",
  "srm-aluminium",
  "ferrite",
]);

/** Which camera shot a given stop and state wants. */
function shotFor(stop: Stop, state: StopState, explode: number): ShotName {
  const stage = stageForState(stop, state);
  if (stage.kind !== "three") return "motor";
  if (stage.scene === "axial") return "axial";
  if (stage.scene === "car") {
    return state.id === "the-magnet-inside" || state.id === "drive-unit"
      ? "car-close"
      : "car";
  }
  if (explode > 0.15) return "motor-exploded";
  // Anything about the rotating field is read down the bore, not side-on.
  if (["one-phase", "three-phases", "no-part-moves", "rotor-locks", "lopsided", "reluctance"].includes(state.id)) {
    return "motor-face";
  }
  if (CUTAWAY_STATES.has(state.id)) return "rotor";
  if (stop.id === "swap-the-rotor") return "rotor";
  return "motor";
}

function SceneContents({
  stop,
  state,
  controls,
  rotor,
  paused,
}: {
  stop: Stop;
  state: StopState;
  controls: StageControls;
  rotor: RotorId;
  paused: boolean;
}) {
  const stage = stageForState(stop, state);
  const phaseStrengths = useMemo(
    () => getBalancedPhaseStrengths((controls.angle * 180) / Math.PI),
    [controls.angle],
  );

  if (stage.kind !== "three") return null;

  if (stage.scene === "axial") {
    return (
      <group>
        <AxialFlux spinning={!paused} exploded={controls.explode} chemistry={stage.chemistry} />
        <Callout position={[0, AXIAL.outerRadius + 0.16, 0]} accent>
          stator coils · field runs along the shaft
        </Callout>
        <Callout position={[0, -AXIAL.outerRadius - 0.16, 0.5]} side="left">
          rotor disc · magnets face the coils
        </Callout>
      </group>
    );
  }

  if (stage.scene === "car") {
    const focus =
      state.id === "the-motor-in-the-car" || state.id === "drive-unit"
        ? "drive-unit"
        : state.id === "the-magnet-inside"
          ? "magnet"
          : state.id === "power-path"
            ? "battery"
            : "none";
    return (
      <group>
        <Car focus={focus} flowing={!paused && state.id === "power-path"} extract={controls.extract} spinning={!paused} />
        {focus === "drive-unit" && (
          <Callout position={[1.6, 0.5, 0.9]} accent>
            drive unit
          </Callout>
        )}
        {focus === "battery" && (
          <Callout position={[-1.6, -0.5, 0.9]} accent>
            battery pack
          </Callout>
        )}
      </group>
    );
  }

  const slip = rotor === "squirrel-cage" ? 0.02 + controls.load * 0.02 : 0;
  // The casing is only in the way once the lesson moves to the air gap.
  const cutaway = CUTAWAY_STATES.has(state.id);

  return (
    <group>
      <Motor
        excitation={stage.excitation ?? "brushed"}
        cutaway={cutaway}
        dimStator={
          stop.id === "swap-the-rotor" &&
          state.id !== "family-tree" &&
          !ROTORS[rotor].needsOwnStator
        }
        rotor={rotor}
        explode={controls.explode}
        spinning={!paused}
        angle={controls.angle}
        slip={slip}
        activePhase={controls.activePhase}
        phaseStrengths={state.id === "three-phases" || state.id === "no-part-moves" ? phaseStrengths : undefined}
        isolate={controls.isolate}
        intensity={controls.heat}
        fieldLive={controls.fieldLive}
      />
      {controls.explode > 0.3 && (
        <>
          <Callout position={[0, MOTOR.housingOuter + 0.3, explodeZ("housing", controls.explode)]}>
            housing
          </Callout>
          <Callout position={[0, MOTOR.statorOuter + 0.42, explodeZ("statorCore", controls.explode)]} accent>
            stator · copper in 48 slots
          </Callout>
          <Callout position={[0, MOTOR.rotorOuter + 0.3, explodeZ("rotor", controls.explode)]} accent>
            rotor · magnets buried inside
          </Callout>
          <Callout position={[0, MOTOR.shaftRadius + 0.34, explodeZ("shaft", controls.explode)]}>
            shaft
          </Callout>
          <Callout
            position={[0, -MOTOR.housingOuter - 0.24, -MOTOR.housingLength / 2 + explodeZ("frontCap", controls.explode)]}
            side="left"
          >
            end cap
          </Callout>
          <Callout
            position={[0, -MOTOR.shaftRadius - 0.5, MOTOR.housingLength / 2 + explodeZ("rearBearing", controls.explode)]}
          >
            bearing
          </Callout>
        </>
      )}
    </group>
  );
}

export function Stage({
  stop,
  state,
  controls,
  rotor,
  paused,
  reducedMotion,
  hidden = false,
}: {
  stop: Stop;
  state: StopState;
  controls: StageControls;
  rotor: RotorId;
  paused: boolean;
  reducedMotion: boolean;
  /** True while an SVG stop is on screen: the canvas stays mounted but idle. */
  hidden?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [aspect, setAspect] = useState(1.5);
  const shell = useRef<HTMLDivElement>(null);

  // Framing depends on the viewport shape, so a resize has to re-solve it.
  useEffect(() => {
    const node = shell.current;
    if (!node) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setAspect(width / height);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const shot = shotFor(stop, state, controls.explode);
  const view = useMemo(() => {
    const bounds =
      shot === "car" || shot === "car-close"
        ? carBounds(controls.extract)
        : shot === "axial"
          ? axialBounds(controls.explode)
          : motorBounds(controls.explode);
    return cameraFor(shot, bounds, aspect, FOV);
  }, [shot, controls.extract, controls.explode, aspect]);

  if (failed) {
    return (
      <div className="stage">
        <div className="stage-fallback">
          <strong>{state.label}</strong>
          <p>{state.line}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stage" ref={shell} aria-hidden={hidden} data-hidden={hidden || undefined}>
      <Canvas
        shadows
        dpr={[1, 1.8]}
        camera={{ position: view.position as [number, number, number], fov: FOV }}
        frameloop="always"
        gl={{ antialias: true }}
        onCreated={({ gl, size }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
          setAspect(size.width / Math.max(1, size.height));
        }}
        resize={{ scroll: false }}
        fallback={
          <div className="stage-fallback">
            <strong>{state.label}</strong>
            <p>{state.line}</p>
          </div>
        }
        onError={() => setFailed(true)}
      >
        <Suspense fallback={null}>
          <ApplyCamera
            position={view.position}
            target={view.target}
            controlsRef={controlsRef}
            animate={!reducedMotion}
          />
          <Lighting />
          <SceneContents
            stop={stop}
            state={state}
            controls={controls}
            rotor={rotor}
            paused={paused || reducedMotion}
          />
          <ContactShadows position={[0, -1.4, 0]} opacity={0.32} scale={12} blur={2.8} far={4} color="#2a3230" />
          <OrbitControls
            ref={controlsRef}
            makeDefault
            enablePan={false}
            minDistance={1.5}
            maxDistance={60}
            enableDamping
            dampingFactor={0.06}
            rotateSpeed={0.42}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.9}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
