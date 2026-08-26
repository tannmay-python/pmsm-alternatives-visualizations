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
import { axialBounds, cameraFor, carBounds, motorBounds } from "./framing";
import { stageForState } from "../route/route";
import { CUTAWAY_STATES, fieldLessonFor, shotFor } from "./shots";
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

function SceneContents({
  stop,
  state,
  controls,
  rotor,
  paused,
  cardSide,
}: {
  stop: Stop;
  state: StopState;
  controls: StageControls;
  rotor: RotorId;
  paused: boolean;
  /** Passed to every callout so none of them extends under the reading card. */
  cardSide: "left" | "right";
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
        <Callout cardSide={cardSide} position={[0, AXIAL.outerRadius + 0.16, 0]} accent>
          stator coils · field runs along the shaft
        </Callout>
        <Callout cardSide={cardSide} position={[0, -AXIAL.outerRadius - 0.16, 0.5]} side="left">
          rotor disc · magnets face the coils
        </Callout>
      </group>
    );
  }

  if (stage.scene === "car") {
    const focus =
      state.id === "one-part" || state.id === "drive-unit"
        ? "drive-unit"
        : state.id === "power-path"
          ? "battery"
          : "none";
    return (
      <group>
        {/*
          Car.tsx already labels the battery, the inverter, the motor, the gear
          and the wheel from their own geometry. Repeating "battery pack" and
          "drive unit" here put two callouts on the same part, a few pixels
          apart — the collision was self-inflicted rather than a placement
          problem.
        */}
        <Car cardSide={cardSide} focus={focus} flowing={!paused && state.id === "power-path"} extract={controls.extract} spinning={!paused && state.id !== "one-phase"} />
      </group>
    );
  }

  const slip = rotor === "squirrel-cage" ? 0.02 + controls.load * 0.02 : 0;
  // The casing is only in the way once the lesson moves to the air gap.
  const cutaway = CUTAWAY_STATES.has(state.id);
  const fieldLesson = fieldLessonFor(stop, state);

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
        spinning={!paused && state.id !== "one-phase"}
        angle={controls.angle}
        slip={slip}
        activePhase={controls.activePhase}
        phaseStrengths={state.id === "three-phases" || state.id === "no-part-moves" ? phaseStrengths : undefined}
        isolate={controls.isolate}
        intensity={controls.heat}
        fieldLive={controls.fieldLive}
        load={controls.load}
        fieldSpinning={state.id !== "one-phase"}
        fieldLesson={fieldLesson}
      />
      {controls.explode > 0.3 && controls.isolate === "none" && (
        <>
          <Callout cardSide={cardSide} position={[0, MOTOR.housingOuter + 0.3, explodeZ("housing", controls.explode)]}>
            housing
          </Callout>
          <Callout cardSide={cardSide} position={[0, MOTOR.statorOuter + 0.42, explodeZ("statorCore", controls.explode)]} accent>
            stator · copper in 48 slots
          </Callout>
          <Callout cardSide={cardSide} position={[0, MOTOR.rotorOuter + 0.3, explodeZ("rotor", controls.explode)]} accent>
            rotor · magnets buried inside
          </Callout>
          <Callout cardSide={cardSide} position={[0, MOTOR.shaftRadius + 0.34, explodeZ("shaft", controls.explode)]}>
            shaft
          </Callout>
          <Callout cardSide={cardSide}
            position={[0, -MOTOR.housingOuter - 0.24, -MOTOR.housingLength / 2 + explodeZ("frontCap", controls.explode)]}
            side="left"
          >
            end cap
          </Callout>
          <Callout cardSide={cardSide}
            position={[0, -MOTOR.shaftRadius - 0.5, MOTOR.housingLength / 2 + explodeZ("rearBearing", controls.explode)]}
          >
            bearing
          </Callout>
        </>
      )}

      {(state.id === "one-phase" || state.id === "three-phases") && (
        <>
          {[
            { label: "group A", angle: 0 },
            { label: "group B", angle: (Math.PI * 2) / 3 },
            { label: "group C", angle: (Math.PI * 4) / 3 },
          ].map((phase) => (
            <Callout cardSide={cardSide}
              key={phase.label}
              position={[
                Math.cos(phase.angle) * (MOTOR.statorOuter + 0.08),
                Math.sin(phase.angle) * (MOTOR.statorOuter + 0.08),
                MOTOR.stackLength / 2,
              ]}
            >
              {phase.label}
            </Callout>
          ))}
        </>
      )}

      {controls.isolate === "stator" && (
        <>
          <Callout cardSide={cardSide} position={[0, MOTOR.statorOuter + 0.22, 0]} accent>
            stator core · stationary laminated ring
          </Callout>
          <Callout cardSide={cardSide} position={[-MOTOR.statorOuter - 0.12, 0.1, 0.2]} side="left">
            copper windings · three phase groups
          </Callout>
          <Callout cardSide={cardSide} position={[0, -MOTOR.statorBore - 0.08, -MOTOR.stackLength / 2]}>
            bore · the air gap is just inside
          </Callout>
        </>
      )}

      {controls.isolate === "rotor" && (
        <>
          <Callout cardSide={cardSide} position={[0, MOTOR.rotorOuter + 0.18, 0]} accent>
            rotor laminations · spinning steel core
          </Callout>
          <Callout cardSide={cardSide} position={[MOTOR.rotorOuter * 0.68, MOTOR.rotorOuter * 0.55, 0]}>
            magnets buried in V-shaped pockets
          </Callout>
          <Callout cardSide={cardSide} position={[0, -MOTOR.shaftRadius - 0.14, MOTOR.stackLength * 0.35]}>
            shaft · carries torque to the gear
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
  explore = false,
  side = "left",
  hidden = false,
}: {
  stop: Stop;
  state: StopState;
  controls: StageControls;
  rotor: RotorId;
  paused: boolean;
  reducedMotion: boolean;
  /**
   * Free orbit, off by default.
   *
   * Every label in this scene is placed against a known camera angle. Leaving
   * the camera free is what made them "go awry" the moment the motor exploded,
   * and fixing that by hand meant checking "every single arrow from a lot of
   * different angles". The camera rides scripted stations instead, and this is
   * the deliberate way out of them.
   */
  explore?: boolean;
  /** Which side the reading card is on; the scene shifts the other way. */
  side?: "left" | "right";
  /** True while an SVG beat is on screen: the canvas stays mounted but idle. */
  hidden?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [size, setSize] = useState({ width: 1440, height: 900 });
  const shell = useRef<HTMLDivElement>(null);

  // Framing depends on the viewport shape, so a resize has to re-solve it.
  useEffect(() => {
    const node = shell.current;
    if (!node) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setSize({ width, height });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /*
   * The machine is framed into the half of the page the reading card is not
   * using, and then translated into it. Both numbers come from the same
   * measurement — solving the shot against the full viewport and *then*
   * shifting is what pushed the shaft of the exploded motor off the edge.
   */
  const frame = useMemo(() => {
    const { width, height } = size;
    const padX = width <= 560 ? 18 : width <= 960 ? 24 : 40;
    const chromeY = 116; // masthead plus progress strip

    // Below this the card is a bottom sheet, so the scene gives up height
    // rather than width and stays centred horizontally.
    if (width <= 1080 || explore) {
      const usableHeight = explore ? height : Math.max(1, height - chromeY - height * 0.52);
      return {
        fit: [1, usableHeight / height] as const,
        shiftX: 0,
        shiftY: explore ? 0 : (chromeY + usableHeight / 2 - height / 2) / height,
      };
    }

    const cardWidth = Math.min(410, width * 0.34);
    const usableWidth = Math.max(1, width - cardWidth - padX * 2);
    const usableHeight = Math.max(1, height - chromeY);
    const usableCentreX =
      side === "left" ? padX + cardWidth + usableWidth / 2 : padX + usableWidth / 2;

    return {
      fit: [usableWidth / width, usableHeight / height] as const,
      shiftX: (usableCentreX - width / 2) / width,
      shiftY: (chromeY + usableHeight / 2 - height / 2) / height,
    };
  }, [size, side, explore]);

  const shot = shotFor(stop, state, controls.explode);
  const view = useMemo(() => {
    const bounds =
      shot === "car" || shot === "car-close"
        ? carBounds(controls.extract)
        : shot === "axial"
          ? axialBounds(controls.explode)
          : motorBounds(controls.explode);
    return cameraFor(shot, bounds, size.width / Math.max(1, size.height), FOV, frame.fit);
  }, [shot, controls.extract, controls.explode, size, frame.fit]);

  /*
   * A lost WebGL context is usually temporary — a GPU reset, a backgrounded
   * tab, or too many live contexts — and the browser hands it back. Without
   * this the fallback was permanent for the rest of the session.
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const onLost = (event: Event) => {
      event.preventDefault();
      setFailed(true);
    };
    const onRestored = () => setFailed(false);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    return () => {
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
    };
  }, [failed]);

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
    <div
      className="stage"
      ref={shell}
      aria-hidden={hidden}
      data-hidden={hidden || undefined}
      data-explore={explore || undefined}
      /*
       * Off-centre framing without moving the camera: the canvas element is
       * translated into the space the card is not using. Far cheaper than
       * re-solving the shot, and it leaves every label offset intact.
       */
      style={
        {
          "--scene-shift-x": `${(frame.shiftX * 100).toFixed(3)}%`,
          "--scene-shift-y": `${(frame.shiftY * 100).toFixed(3)}%`,
        } as React.CSSProperties
      }
    >
      <Canvas
        shadows
        dpr={[1, 1.8]}
        camera={{ position: view.position as [number, number, number], fov: FOV }}
        frameloop="always"
        gl={{ antialias: true }}
        onCreated={({ gl, size: canvasSize }) => {
          canvasRef.current = gl.domElement;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
          setSize({ width: canvasSize.width, height: Math.max(1, canvasSize.height) });
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
          {/*
            No pointer parallax. The old build swayed the camera a few
            hundredths of a unit to keep a rail-mounted camera from feeling
            like a slideshow, and porting that here moved the camera using its
            own position as the base for the next move — so each frame re-added
            the previous offset and the camera accelerated out of the shot.
            Rewriting it to offset the scene instead stopped the drift but
            produced no measurable movement, so it earns nothing and is gone.
            The scripted stations are what the labels actually depend on.
          */}
          <SceneContents
            stop={stop}
            state={state}
            controls={controls}
            rotor={rotor}
            paused={paused || reducedMotion}
            cardSide={side}
          />
          <ContactShadows position={[0, -1.4, 0]} opacity={0.32} scale={12} blur={2.8} far={4} color="#2a3230" />
          {/*
            OrbitControls stays mounted because ApplyCamera drives the camera
            through it, but it accepts input only in explore mode. A camera
            that cannot be spun is what lets a label keep a placed offset.
          */}
          <OrbitControls
            ref={controlsRef}
            makeDefault
            enabled={explore}
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
