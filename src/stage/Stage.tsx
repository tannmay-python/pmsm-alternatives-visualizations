import { Canvas, useFrame, useThree } from "@react-three/fiber";
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
import { AXIAL, MOTOR, ROTOR_SHAFT_LENGTH, SHAFT_LENGTH, explodeZ, ipmMagnetPlacements } from "./geometry";
import { getBalancedPhaseStrengths } from "../models/pmsmTurn";
import { ROTORS, type RotorId } from "./rotors/registry";
import { MAGNET_SLIDE, SLIP_RING } from "./rotors/Rotors";
import type { Stop, StopState } from "../route/route";
import { type StageControls } from "./controls";
import { axialBounds, boreBounds, cameraFor, carBounds, motorBounds, rotorBounds } from "./framing";
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

/** Reports the first rendered frame, so the text stand-in can leave. */
function FirstFrame({ onReady }: { onReady: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    onReady();
  });
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

/**
 * The alternative-rotor beats show the rotor with nothing around it. The card
 * carries the fact that the stator did not change; the stage carries what the
 * new rotor does, and a ghosted stator only ever got in the way of that.
 */
const statorOff = (stop: Stop, state: StopState, rotor: RotorId) =>
  stop.id === "swap-the-rotor" && state.id !== "family-tree" && !ROTORS[rotor].needsOwnStator;

const isAirGap = (state: StopState, isolate: StageControls["isolate"]) =>
  isolate === "air-gap" || state.id === "air-gap";

/** The one magnet a label is pinned to in the rotor frame: upper right of the end face. */
const LABELLED_MAGNET = ipmMagnetPlacements(8, 0.05).find((m) => m.pole === 1 && m.side === -1)!;

function SceneContents({
  stop,
  state,
  controls,
  rotor,
  paused,
  reducedMotion,
}: {
  stop: Stop;
  state: StopState;
  controls: StageControls;
  rotor: RotorId;
  paused: boolean;
  reducedMotion: boolean;
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
          coil disc in the middle · stays still
        </Callout>
        <Callout position={[AXIAL.outerRadius * 0.7, AXIAL.outerRadius * 0.65, discZ]} direction="top-right" accent>
          {isFerrite ? "ferrite magnet disc · thicker, cheaper" : "NdFeB magnet disc · thin and strong"}
        </Callout>
        <Callout position={[0, -AXIAL.outerRadius * 0.75, -discZ]} direction="bottom-left">
          steel back disc · closes the magnetic loop
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
        <Car
          focus={focus}
          flowing={!reducedMotion && state.id === "power-path"}
          spinning={!paused && state.id !== "one-phase"}
        />
      </group>
    );
  }

  const effectiveRotor = stage.rotor ?? rotor;
  const slip = effectiveRotor === "squirrel-cage" ? 0.02 + controls.load * 0.02 : 0;
  const cutaway = CUTAWAY_STATES.has(state.id);
  const fieldLesson = fieldLessonFor(stop, state);
  const dimStator = statorOff(stop, state, effectiveRotor);
  const airGap = isAirGap(state, controls.isolate);
  const rotorAlone = controls.isolate === "rotor";
  // The isolated rotor holds still so the label pinned to one magnet stays
  // put; the wound rotor turns slowly so its arrow and coils can be watched.
  const rate = rotorAlone ? 0 : effectiveRotor === "wound" && fieldLesson === "sweep" ? 0.2 : 1;

  return (
    <group>
      <Motor
        excitation={stage.excitation ?? "brushed"}
        cutaway={cutaway}
        dimStator={dimStator}
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
        // The copper end turns sit right over the gap when it is looked at
        // down the bore, so they come off for that one frame.
        showWindings={!airGap}
        shaftLength={airGap ? ROTOR_SHAFT_LENGTH : undefined}
        rate={rate}
        rotorChildren={
          rotorAlone && (effectiveRotor === "ipm-ndfeb" || effectiveRotor === "ferrite-ipm") ? (
            <Callout
              position={[
                LABELLED_MAGNET.centre[0],
                LABELLED_MAGNET.centre[1],
                MOTOR.stackLength / 2 + controls.explode * MAGNET_SLIDE,
              ]}
              direction="top"
              accent
            >
              NdFeB strips in V-shaped pockets
            </Callout>
          ) : undefined
        }
      />

      {stop.id === "open-the-machine" && controls.isolate === "none" && controls.explode > 0.15 && (
        <>
          <Callout position={[0, MOTOR.housingOuter, explodeZ("housing", controls.explode)]} direction="top">
            housing · cooling jacket
          </Callout>
          <Callout
            position={[0, -MOTOR.statorOuter, explodeZ("statorCore", controls.explode)]}
            direction="bottom-left"
            accent
          >
            stator · windings, stationary
          </Callout>
          <Callout position={[0, MOTOR.rotorOuter, explodeZ("rotor", controls.explode)]} direction="top-right" accent>
            rotor · magnets embedded
          </Callout>
          <Callout
            position={[0, -MOTOR.shaftRadius, explodeZ("shaft", controls.explode) + 0.35]}
            direction="bottom"
          >
            output shaft
          </Callout>
        </>
      )}

      {controls.isolate === "none" && controls.explode <= 0.15 && stop.id === "open-the-machine" && (
        <>
          <Callout position={[0, MOTOR.housingOuter, 0]} direction="top">
            housing · cooling jacket
          </Callout>
          <Callout position={[0, -MOTOR.shaftRadius, MOTOR.stackLength * 0.7]} direction="bottom-right">
            output shaft
          </Callout>
        </>
      )}

      {controls.isolate === "stator" && (
        <>
          <Callout position={[0, MOTOR.statorOuter, 0]} direction="top" accent>
            stator · windings, stationary
          </Callout>
          <Callout
            position={[0, MOTOR.statorBore + 0.14, MOTOR.stackLength / 2 + controls.explode * 0.8 + 0.08]}
            direction="top-right"
            accent
          >
            copper coils in three groups
          </Callout>
          <Callout position={[0, 0, MOTOR.stackLength / 2]} direction="bottom-right">
            bore · the rotor turns here
          </Callout>
        </>
      )}

      {controls.isolate === "rotor" && (
        <>
          <Callout position={[0, MOTOR.rotorOuter, 0]} direction="top" accent>
            rotor · turns with the shaft
          </Callout>
          <Callout
            position={[0, -MOTOR.shaftRadius, ROTOR_SHAFT_LENGTH / 2 + controls.explode * 0.85 - 0.12]}
            direction="bottom"
          >
            output shaft
          </Callout>
        </>
      )}

      {controls.isolate === "housing" && (
        <>
          <Callout position={[0, MOTOR.housingOuter, 0]} direction="top" accent>
            housing · cooling jacket
          </Callout>
          <Callout
            position={[0, -MOTOR.housingOuter + 0.1, -MOTOR.housingLength / 2 - controls.explode * 0.6]}
            direction="bottom-left"
          >
            end cap · seals it shut
          </Callout>
          <Callout
            position={[0, -MOTOR.shaftRadius - 0.05, MOTOR.housingLength / 2 + controls.explode * 0.65]}
            direction="bottom-right"
          >
            bearing · lets the shaft spin
          </Callout>
        </>
      )}

      {controls.isolate === "shaft" && (
        <>
          <Callout position={[0, MOTOR.shaftRadius, 0]} direction="top" accent>
            output shaft
          </Callout>
          <Callout
            position={[0, -MOTOR.shaftRadius - 0.05, MOTOR.housingLength / 2 + controls.explode * 0.65]}
            direction="bottom-right"
          >
            bearing · lets the shaft spin
          </Callout>
        </>
      )}

      {airGap && (
        <>
          <Callout position={[0, MOTOR.statorBore + 0.1, MOTOR.stackLength / 2]} direction="top">
            stator teeth · stationary
          </Callout>
          <Callout
            position={[
              Math.cos(Math.PI / 4) * (MOTOR.statorBore + MOTOR.rotorOuter * 0.94) * 0.5,
              Math.sin(Math.PI / 4) * (MOTOR.statorBore + MOTOR.rotorOuter * 0.94) * 0.5,
              MOTOR.stackLength / 2,
            ]}
            direction="top"
            accent
          >
            air gap · they never touch
          </Callout>
          <Callout position={[0, -MOTOR.rotorOuter * 0.5, MOTOR.stackLength / 2]} direction="bottom">
            rotor · rotates inside
          </Callout>
        </>
      )}

      {state.id === "one-phase" && (
        <Callout
          direction="top-right"
          accent
          position={[MOTOR.statorOuter + 0.08, 0, MOTOR.stackLength / 2]}
        >
          group A · the coils switched on
        </Callout>
      )}

      {state.id === "three-phases" && (
        <>
          {[
            { label: "group A", angle: 0, dir: "top-right" as const },
            { label: "group B", angle: (Math.PI * 2) / 3, dir: "top-left" as const },
            { label: "group C", angle: (Math.PI * 4) / 3, dir: "bottom-left" as const },
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
              <Callout
                position={[-MOTOR.rotorOuter * 0.6, MOTOR.rotorOuter * 0.82, explodeZ("rotor", controls.explode) - 0.1]}
                direction="top"
                accent
              >
                cage bars · no magnets
              </Callout>
              <Callout
                position={[0, -MOTOR.rotorOuter + 0.07, explodeZ("rotor", controls.explode) + MOTOR.stackLength / 2 + 0.06]}
                direction="bottom"
              >
                end ring · shorts the bars
              </Callout>
            </>
          )}

          {effectiveRotor === "wound" && (
            <>
              <Callout
                position={[-MOTOR.rotorOuter * 0.62, MOTOR.rotorOuter * 0.8, explodeZ("rotor", controls.explode) - 0.15]}
                direction="top"
                accent
              >
                rotor windings · fed with current
              </Callout>
              <Callout
                position={[0.06, SLIP_RING.radius + 0.2, explodeZ("rotor", controls.explode) + SLIP_RING.z[1] + 0.06]}
                direction="bottom"
              >
                slip rings and brushes · rotor supply
              </Callout>
            </>
          )}

          {(effectiveRotor === "synrm" || effectiveRotor === "pm-assisted-synrm") && (
            <>
              <Callout position={[-MOTOR.rotorOuter * 0.65, MOTOR.rotorOuter * 0.7, explodeZ("rotor", controls.explode)]} direction="top-left">
                {effectiveRotor === "pm-assisted-synrm"
                  ? "small magnets help the steel"
                  : "shaped steel · no magnets"}
              </Callout>
              <Callout position={[MOTOR.rotorOuter * 0.7, MOTOR.rotorOuter * 0.65, explodeZ("rotor", controls.explode)]} direction="top-right" accent>
                air slots steer the magnetism
              </Callout>
            </>
          )}

          {effectiveRotor === "srm" && (
            <>
              <Callout position={[-MOTOR.rotorOuter * 0.65, MOTOR.rotorOuter * 0.7, explodeZ("rotor", controls.explode)]} direction="top-left" accent>
                toothed steel rotor · no magnets
              </Callout>
              <Callout position={[MOTOR.statorOuter * 0.7, MOTOR.statorOuter * 0.65, explodeZ("statorCore", controls.explode)]} direction="top-right">
                coils switched on in turn
              </Callout>
            </>
          )}

          {(effectiveRotor === "ipm-ndfeb" || effectiveRotor === "ferrite-ipm") && (
            <>
              <Callout position={[MOTOR.rotorOuter * 0.7, MOTOR.rotorOuter * 0.65, explodeZ("rotor", controls.explode)]} direction="top-right" accent>
                {effectiveRotor === "ferrite-ipm" ? "ferrite magnets · no rare earths" : "NdFeB magnets · the strongest"}
              </Callout>
              <Callout position={[0, -MOTOR.shaftRadius, explodeZ("shaft", controls.explode) + 0.6]} direction="bottom-right">
                steel rotor
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
  const [ready, setReady] = useState(false);
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
    const padX = width <= 560 ? 14 : width <= 960 ? 24 : 40;
    // The masthead wraps to two rows on narrow screens.
    const chromeY = width <= 1080 ? 128 : 116;

    if (width <= 1080) {
      // The card sits across the bottom half; the picture gets what is above it.
      const usableHeight = Math.max(1, height - chromeY - height * 0.5 - 8);
      const usableWidth = Math.max(1, width - padX * 2);
      return {
        fit: [usableWidth / width, usableHeight / height] as const,
        shiftX: 0,
        shiftY: (chromeY + usableHeight / 2 - height / 2) / height,
      };
    }

    const cardWidth = Math.min(430, width * 0.38);
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
  const stage = stageForState(stop, state);
  const rotorOnly =
    stage.kind === "three" &&
    stage.scene === "motor" &&
    (controls.isolate === "rotor" || statorOff(stop, state, stage.rotor ?? rotor));

  const view = useMemo(() => {
    const bounds =
      shot === "car" || shot === "car-close"
        ? carBounds(0)
        : shot === "axial"
          ? axialBounds(controls.explode)
          : isAirGap(state, controls.isolate)
            ? boreBounds(ROTOR_SHAFT_LENGTH)
            : rotorOnly
              ? rotorBounds(
                  controls.isolate === "rotor" ? controls.explode : 0,
                  ROTOR_SHAFT_LENGTH,
                  // Brush gear hangs above and behind the wound rotor.
                  stage.rotor === "wound" ? 0.22 : 0,
                )
              : controls.isolate === "shaft"
                ? rotorBounds(0, SHAFT_LENGTH)
                : motorBounds(controls.explode);
    return cameraFor(shot, bounds, size.width / Math.max(1, size.height), FOV, frame.fit);
  }, [shot, state, stage, controls.explode, controls.isolate, rotorOnly, size, frame.fit]);

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
            reducedMotion={reducedMotion}
          />
          <ContactShadows position={[0, -1.4, 0]} opacity={0.32} scale={12} blur={2.8} far={4} color="#2a3230" />
          <OrbitControls
            ref={controlsRef}
            makeDefault
            enabled={true}
            enablePan={false}
            enableZoom={false}
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
          <FirstFrame onReady={() => setReady(true)} />
        </Suspense>
      </Canvas>
      {!ready && (
        <div className="stage-fallback stage-fallback--loading" aria-live="polite">
          <strong>{state.label}</strong>
        </div>
      )}
    </div>
  );
}
