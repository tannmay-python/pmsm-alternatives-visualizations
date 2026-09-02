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
 * Applies the solved camera to the live controls. Framing itself is computed
 * in framing.ts from the machine's own constants, so this only has to move the
 * camera there and let OrbitControls take over.
 */
function ApplyCamera({
  position,
  target,
  controlsRef,
  animate,
  resetKey,
}: {
  position: readonly [number, number, number];
  target: readonly [number, number, number];
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  animate: boolean;
  resetKey: string;
}) {
  const camera = useThree((s) => s.camera);
  const key = `${resetKey}|${position.join()}|${target.join()}`;

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

    let frame = 0;
    const from = camera.position.clone();
    const fromTarget = controls.target.clone();
    const start = performance.now();
    const duration = 420;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, animate, camera, controlsRef]);

  return null;
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={1.15} />
      <directionalLight
        position={[-5, 6, 6]}
        intensity={1.9}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[5, 2, -4]} intensity={0.9} color="#e8efe9" />
      <hemisphereLight args={["#ffffff", "#c8cec9", 0.8]} />

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
    const discZ = AXIAL.discThickness + AXIAL.gap + controls.explode * 0.55;
    const isFerrite = stage.chemistry === "ferrite";
    return (
      <group>
        <AxialFlux spinning={!paused} exploded={controls.explode} chemistry={stage.chemistry} />
        <Callout position={[-AXIAL.outerRadius * 0.7, AXIAL.outerRadius * 0.7, 0]} direction="top-left" accent>
          central stator disc · 3-phase coils (field runs along shaft)
        </Callout>
        <Callout position={[AXIAL.outerRadius * 0.7, AXIAL.outerRadius * 0.65, discZ]} direction="top-right" accent>
          {isFerrite
            ? "ferrite rotor disc · thicker magnets recover working flux"
            : "NdFeB rotor disc · peak power density in slim pancake"}
        </Callout>
        <Callout position={[0, -AXIAL.outerRadius * 0.75, -discZ]} direction="bottom-left">
          back-iron rotor disc · magnetic return path
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
        <Car focus={focus} flowing={!paused && state.id === "power-path"} spinning={!paused && state.id !== "one-phase"} />
      </group>
    );
  }

  const effectiveRotor = stage.rotor ?? rotor;
  const slip = effectiveRotor === "squirrel-cage" ? 0.02 + controls.load * 0.02 : 0;
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
          !ROTORS[effectiveRotor].needsOwnStator
        }
        rotor={effectiveRotor}
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


      {stop.id === "open-the-machine" && controls.isolate === "none" && controls.explode > 0.15 && (
        <>
          <Callout position={[0, MOTOR.housingOuter, explodeZ("housing", controls.explode)]} direction="top-left">
            housing · cooling jacket
          </Callout>
          <Callout position={[0, MOTOR.statorOuter, explodeZ("statorCore", controls.explode)]} direction="top-right" accent>
            stator · copper coils
          </Callout>
          <Callout position={[0, MOTOR.rotorOuter, explodeZ("rotor", controls.explode)]} direction="top-left" accent>
            rotor · buried NdFeB magnets
          </Callout>
          <Callout position={[0, -MOTOR.shaftRadius, explodeZ("shaft", controls.explode) + 0.6]} direction="bottom-left">
            shaft · torque output
          </Callout>
        </>
      )}

      {controls.isolate === "none" && controls.explode <= 0.15 && stop.id === "open-the-machine" && (
        <>
          <Callout position={[0, MOTOR.housingOuter, 0]} direction="top">
            sealed housing · aluminum cooling jacket
          </Callout>
          <Callout position={[0, -MOTOR.shaftRadius, MOTOR.stackLength * 0.7]} direction="bottom-right">
            drive shaft · connects to reduction gear
          </Callout>
        </>
      )}

      {controls.isolate === "stator" && (
        <>
          <Callout position={[0, MOTOR.statorOuter, 0]} direction="top" accent>
            laminated core · thin silicon steel sheets prevent eddy currents
          </Callout>
          <Callout
            position={[0, MOTOR.statorBore + 0.14, MOTOR.stackLength / 2 + controls.explode * 0.8 + 0.08]}
            direction="top-right"
            accent
          >
            copper windings · 3-phase coils (Phase A, B, C)
          </Callout>
          <Callout position={[0, 0, MOTOR.stackLength / 2]} direction="bottom-right">
            stator bore · central tunnel where rotor spins
          </Callout>
        </>
      )}

      {controls.isolate === "rotor" && (
        <>
          <Callout position={[0, MOTOR.rotorOuter, 0]} direction="top" accent>
            laminated rotor · high-strength electrical steel core
          </Callout>
          <Callout
            position={[0.3, 0.3, MOTOR.stackLength / 2 + controls.explode * 0.75 + 0.05]}
            direction="top-right"
            accent
          >
            buried NdFeB magnets · permanent magnetic poles
          </Callout>
          <Callout
            position={[0, -MOTOR.shaftRadius, MOTOR.stackLength * 0.7 + controls.explode * 0.85]}
            direction="bottom-right"
          >
            drive shaft · keyed to rotor to transfer output torque
          </Callout>
        </>
      )}

      {controls.isolate === "housing" && (
        <>
          <Callout position={[0, MOTOR.housingOuter, 0]} direction="top" accent>
            aluminum housing · liquid cooling jacket
          </Callout>
          <Callout
            position={[0, -MOTOR.housingOuter + 0.1, -MOTOR.housingLength / 2 - controls.explode * 0.6]}
            direction="bottom-left"
          >
            end cap · structural clamp &amp; seal
          </Callout>
          <Callout
            position={[0, -MOTOR.shaftRadius - 0.05, MOTOR.housingLength / 2 + controls.explode * 0.65]}
            direction="bottom-right"
          >
            bearing · low-friction rotary support
          </Callout>
        </>
      )}

      {controls.isolate === "shaft" && (
        <>
          <Callout position={[0, MOTOR.shaftRadius, 0]} direction="top" accent>
            drive shaft · forged alloy steel
          </Callout>
          <Callout
            position={[0, -MOTOR.shaftRadius - 0.05, MOTOR.housingLength / 2 + controls.explode * 0.65]}
            direction="bottom-right"
          >
            bearing · low-friction shaft support
          </Callout>
        </>
      )}

      {(controls.isolate === "air-gap" || state.id === "air-gap") && (
        <>
          <Callout position={[0, MOTOR.statorBore + 0.2, 0]} direction="top" accent>
            stator teeth · stationary electromagnets
          </Callout>
          <Callout position={[MOTOR.statorBore * 0.72, MOTOR.statorBore * 0.72, 0]} direction="top-right" accent>
            &lt; 1 mm air gap · torque crosses here magnetically
          </Callout>
          <Callout position={[0, -MOTOR.rotorOuter - 0.05, 0]} direction="bottom">
            rotor pole · pulled by rotating stator field
          </Callout>
        </>
      )}

      {state.id === "one-phase" && (
        <Callout
          direction="top-right"
          accent
          position={[MOTOR.statorOuter + 0.08, 0, MOTOR.stackLength / 2]}
        >
          group A · active electromagnet pole
        </Callout>
      )}

      {state.id === "three-phases" && (
        <>
          {[
            { label: "phase A (0°)", angle: 0, dir: "top-right" as const },
            { label: "phase B (120°)", angle: (Math.PI * 2) / 3, dir: "top-left" as const },
            { label: "phase C (240°)", angle: (Math.PI * 4) / 3, dir: "bottom-left" as const },
          ].map((phase) => (
            <Callout
              key={phase.label}
              direction={phase.dir}
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

      {(stop.id === "swap-the-rotor" || stop.id === "change-the-magnet") && (
        <>
          {effectiveRotor === "squirrel-cage" && (
            <>
              <Callout position={[-MOTOR.statorOuter * 0.65, MOTOR.statorOuter * 0.7, explodeZ("statorCore", controls.explode)]} direction="top-left">
                stator field induces current
              </Callout>
              <Callout position={[MOTOR.rotorOuter * 0.7, MOTOR.rotorOuter * 0.65, explodeZ("rotor", controls.explode)]} direction="top-right" accent>
                shorted rotor cage · no magnets
              </Callout>
              <Callout position={[0, -MOTOR.rotorOuter * 0.75, explodeZ("rotor", controls.explode) + MOTOR.stackLength / 2 + 0.1]} direction="bottom-right">
                end rings close the circuit
              </Callout>
            </>
          )}

          {effectiveRotor === "wound" && (
            <>
              <Callout position={[-MOTOR.rotorOuter * 0.65, MOTOR.rotorOuter * 0.7, explodeZ("rotor", controls.explode)]} direction="top-left">
                field can be switched down
              </Callout>
              <Callout position={[MOTOR.rotorOuter * 0.7, MOTOR.rotorOuter * 0.65, explodeZ("rotor", controls.explode)]} direction="top-right" accent>
                powered rotor coils · no permanent magnets
              </Callout>
              <Callout position={[0, -MOTOR.shaftRadius, explodeZ("shaft", controls.explode) + 0.6]} direction="bottom-right">
                rotor power feed
              </Callout>
            </>
          )}

          {(effectiveRotor === "synrm" || effectiveRotor === "pm-assisted-synrm") && (
            <>
              <Callout position={[-MOTOR.rotorOuter * 0.65, MOTOR.rotorOuter * 0.7, explodeZ("rotor", controls.explode)]} direction="top-left">
                {effectiveRotor === "pm-assisted-synrm"
                  ? "small magnet inserts assist the steel rotor"
                  : "shaped steel rotor"}
              </Callout>
              <Callout position={[MOTOR.rotorOuter * 0.7, MOTOR.rotorOuter * 0.65, explodeZ("rotor", controls.explode)]} direction="top-right" accent>
                air barriers steer magnetic flux
              </Callout>
              <Callout position={[0, -MOTOR.shaftRadius, explodeZ("shaft", controls.explode) + 0.6]} direction="bottom-right">
                no magnets or rotor windings
              </Callout>
            </>
          )}

          {effectiveRotor === "srm" && (
            <>
              <Callout position={[-MOTOR.rotorOuter * 0.65, MOTOR.rotorOuter * 0.7, explodeZ("rotor", controls.explode)]} direction="top-left" accent>
                toothed steel rotor
              </Callout>
              <Callout position={[MOTOR.statorOuter * 0.7, MOTOR.statorOuter * 0.65, explodeZ("statorCore", controls.explode)]} direction="top-right">
                switched stator poles
              </Callout>
              <Callout position={[0, -MOTOR.rotorOuter * 0.75, explodeZ("rotor", controls.explode)]} direction="bottom-right">
                simple magnet-free rotor
              </Callout>
            </>
          )}

          {(effectiveRotor === "ipm-ndfeb" || effectiveRotor === "ferrite-ipm") && (
            <>
              <Callout position={[MOTOR.rotorOuter * 0.7, MOTOR.rotorOuter * 0.65, explodeZ("rotor", controls.explode)]} direction="top-right" accent>
                {effectiveRotor === "ferrite-ipm" ? "ferrite magnets · no rare earths" : "NdFeB magnets · high torque density"}
              </Callout>
              <Callout position={[0, -MOTOR.shaftRadius, explodeZ("shaft", controls.explode) + 0.6]} direction="bottom-right">
                laminated steel rotor core
              </Callout>
            </>
          )}
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
  side = "left",
  hidden = false,
}: {
  stop: Stop;
  state: StopState;
  controls: StageControls;
  rotor: RotorId;
  paused: boolean;
  reducedMotion: boolean;
  side?: "left" | "right";
  hidden?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [autoRotate, setAutoRotate] = useState(!reducedMotion);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [size, setSize] = useState({ width: 1440, height: 900 });
  const shell = useRef<HTMLDivElement>(null);

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

  const frame = useMemo(() => {
    const { width, height } = size;
    const padX = width <= 560 ? 18 : width <= 960 ? 24 : 40;
    const chromeY = 116;

    if (width <= 1080) {
      const usableHeight = Math.max(1, height - chromeY - height * 0.52);
      return {
        fit: [1, usableHeight / height] as const,
        shiftX: 0,
        shiftY: (chromeY + usableHeight / 2 - height / 2) / height,
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
  }, [size, side]);

  const shot = shotFor(stop, state, controls.explode, controls.isolate);
  const view = useMemo(() => {
    const bounds =
      shot === "car" || shot === "car-close"
        ? carBounds(0)
        : shot === "axial"
          ? axialBounds(controls.explode)
          : motorBounds(controls.explode);
    return cameraFor(shot, bounds, size.width / Math.max(1, size.height), FOV, frame.fit);
  }, [shot, controls.explode, size, frame.fit]);

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

  useEffect(() => {
    setAutoRotate(!paused && !reducedMotion);
  }, [stop.id, state.id, paused, reducedMotion]);

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
      >
        <Suspense fallback={null}>
          <Lighting />
          <ApplyCamera
            position={view.position}
            target={view.target}
            controlsRef={controlsRef}
            animate={!reducedMotion}
            resetKey={`${stop.id}/${state.id}`}
          />
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
            enabled={true}
            enablePan={false}
            minDistance={1.5}
            maxDistance={60}
            enableDamping
            dampingFactor={0.06}
            rotateSpeed={0.42}
            autoRotate={autoRotate}
            autoRotateSpeed={0.35}
            onStart={() => setAutoRotate(false)}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 1.8}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
