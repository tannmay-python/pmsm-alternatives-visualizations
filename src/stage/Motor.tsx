import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import {
  MOTOR,
  boltCircle,
  endCapShape,
  explodeZ,
  housingShape,
  laminationGeometry,
} from "./geometry";
import { PALETTE, makeMaterials } from "./materials";
import { Stator } from "./Stator";
import { SalientStator } from "./SalientStator";
import { Rotor } from "./rotors/Rotors";
import { ROTORS, type RotorId } from "./rotors/registry";

export type MotorProps = {
  rotor: RotorId;
  /** 0 = assembled, 1 = fully exploded. One scalar drives every part. */
  explode: number;
  spinning: boolean;
  /** Electrical angle in radians, drives the stator field and rotor position. */
  angle: number;
  /** Slip fraction. Non-zero only for the cage: the rotor runs behind the field. */
  slip?: number;
  activePhase?: number | null;
  phaseStrengths?: readonly number[];
  isolate?: "none" | "stator" | "rotor" | "housing" | "shaft" | "air-gap";
  /** Thermal or excitation intensity, 0–1. */
  intensity?: number;
  fieldLive?: boolean;
  showWindings?: boolean;
  /** Shaft load, 0–1. Opens the angle by which the rotor trails the field. */
  load?: number;
  /** False freezes a single stationary phase pole while its coil stays energised. */
  fieldSpinning?: boolean;
  /** Teaching overlay drawn in the front-plane air gap. */
  fieldLesson?: "none" | "fixed" | "sweep" | "lock";
  /**
   * Drops the housing, end caps and bearings. Anything taught about the field
   * or the torque happens across the air gap, and the casing is in the way.
   */
  cutaway?: boolean;
  /**
   * Fades the stator back so the fitted rotor is visible. The stator stays on
   * screen because the whole point of the rotor assembly is that it does not change.
   */
  dimStator?: boolean;
  /** How field power reaches a wound rotor: brushes, or a rotating transformer. */
  excitation?: "brushed" | "contactless";
};

function Housing({ z }: { z: number }) {
  const geometry = useMemo(
    () => laminationGeometry(housingShape(), MOTOR.housingLength, 0.01),
    [],
  );
  const materials = useMemo(makeMaterials, []);
  return (
    <mesh
      geometry={geometry}
      material={materials.housing}
      position={[0, 0, z]}
      castShadow
      receiveShadow
    />
  );
}

function EndCap({ z, flip }: { z: number; flip: boolean }) {
  const materials = useMemo(makeMaterials, []);
  const bolts = useMemo(() => boltCircle(10, MOTOR.housingOuter - 0.09), []);
  const web = useMemo(() => laminationGeometry(endCapShape(6), MOTOR.endCapLength, 0.008), []);
  const t = MOTOR.endCapLength;

  return (
    <group position={[0, 0, z]} rotation={[0, flip ? Math.PI : 0, 0]}>
      <mesh geometry={web} material={materials.endCap} castShadow receiveShadow />
      {/* Bearing boss the shaft passes through. */}
      <mesh material={materials.endCap} position={[0, 0, t * 0.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[MOTOR.shaftRadius + 0.12, MOTOR.shaftRadius + 0.15, t * 1.5, 32]} />
      </mesh>
      <mesh position={[0, 0, t * 0.72]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[MOTOR.shaftRadius + 0.075, 0.018, 8, 36]} />
        <meshStandardMaterial color="#6d7775" roughness={0.4} metalness={0.8} />
      </mesh>
      {bolts.map(({ angle, position }) => (
        <mesh key={angle} position={[position[0], position[1], t * 0.58]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.028, 0.028, 0.038, 6]} />
          <meshStandardMaterial color="#c2cac8" roughness={0.34} metalness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Bearing({ z }: { z: number }) {
  const materials = useMemo(makeMaterials, []);
  return (
    <group position={[0, 0, z]}>
      <mesh material={materials.bearing} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[MOTOR.shaftRadius + 0.06, 0.032, 10, 40]} />
      </mesh>
      <mesh material={materials.bearing} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[MOTOR.shaftRadius + 0.005, 0.02, 8, 36]} />
      </mesh>
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(a) * (MOTOR.shaftRadius + 0.035),
              Math.sin(a) * (MOTOR.shaftRadius + 0.035),
              0,
            ]}
          >
            <sphereGeometry args={[0.021, 10, 10]} />
            <meshStandardMaterial color="#cfd6d4" roughness={0.16} metalness={0.95} />
          </mesh>
        );
      })}
    </group>
  );
}

function FieldPointer({
  color,
  length,
}: {
  color: string;
  length: number;
}) {
  return (
    <group>
      <mesh
        position={[length * 0.5, 0, MOTOR.stackLength / 2 + 0.025]}
        rotation={[0, 0, -Math.PI / 2]}
      >
        <cylinderGeometry args={[0.012, 0.012, length, 10]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh
        position={[length + 0.035, 0, MOTOR.stackLength / 2 + 0.025]}
        rotation={[0, 0, -Math.PI / 2]}
      >
        <coneGeometry args={[0.038, 0.09, 14]} />
        <meshBasicMaterial color={color} />
      </mesh>

      <mesh position={[0, 0, MOTOR.stackLength / 2 + 0.025]}>
        <circleGeometry args={[0.055, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

/**
 * The green pointer is the resultant stator-field axis. The orange pointer is
 * the rotor-magnet axis. Keeping both in one rotating group makes their fixed
 * angular separation visible without asking the reader to infer it.
 */
function FieldLesson({ mode, trail = 0 }: { mode: "fixed" | "sweep" | "lock"; trail?: number }) {
  const showTrail = mode === "lock" && trail > 0.04;

  return (
    <group>
      <FieldPointer color={PALETTE.accent} length={MOTOR.rotorOuter * 0.78} />

      {showTrail && (
        <group rotation={[0, 0, -trail]}>
          <mesh position={[0, 0, MOTOR.stackLength / 2 + 0.024]}>
            <torusGeometry args={[MOTOR.rotorOuter * 0.52, 0.008, 8, 32, trail]} />
            <meshBasicMaterial color={PALETTE.warn} />
          </mesh>
          <group>
            <FieldPointer color={PALETTE.warn} length={MOTOR.rotorOuter * 0.58} />
          </group>
        </group>
      )}
    </group>
  );
}

export function Motor({
  rotor,
  explode,
  spinning,
  angle,
  slip = 0,
  activePhase = null,
  phaseStrengths,
  isolate = "none",
  intensity = 0,
  fieldLive = true,
  showWindings = true,
  load = 0.35,
  fieldSpinning = true,
  fieldLesson = "none",
  cutaway = false,
  dimStator = false,
  excitation = "brushed",
}: MotorProps) {
  const materials = useMemo(makeMaterials, []);
  const rotorRef = useRef<THREE.Group>(null);
  const fieldRef = useRef<THREE.Group>(null);
  const spun = useRef(0);
  const fieldSpun = useRef(0);
  const isCage = rotor === "squirrel-cage";
  const loadAngle = slip * (isCage ? 1 : 0.25) + load * (isCage ? 0.34 : 0.26);

  useFrame((_, delta) => {
    if (spinning) spun.current += delta * 1.1;
    if (fieldSpinning) fieldSpun.current += delta * 1.1;
    const effectiveFieldAngle = angle + (fieldSpinning ? fieldSpun.current : 0);
    if (fieldRef.current) fieldRef.current.rotation.z = effectiveFieldAngle;
    // The cage always trails the field; a synchronous rotor sits at a fixed
    // load angle behind it but turns at exactly field speed.
    if (rotorRef.current) rotorRef.current.rotation.z = effectiveFieldAngle - loadAngle;
  });

  const isIsolated = isolate !== "none";
  const statorHidden = isIsolated ? isolate !== "stator" && isolate !== "air-gap" : false;
  const rotorHidden = isIsolated ? isolate !== "rotor" && isolate !== "air-gap" : false;
  const showCasing = isIsolated ? isolate === "housing" : !cutaway;
  const showShaft = isIsolated ? isolate === "shaft" || isolate === "rotor" || isolate === "air-gap" : true;
  const showBearings = isIsolated ? isolate === "housing" || isolate === "shaft" : showCasing;

  return (
    <group>
      {showCasing && (
        <>
          <Housing z={isolate === "housing" ? 0 : explodeZ("housing", explode)} />
          <EndCap
            z={
              isolate === "housing"
                ? -MOTOR.housingLength / 2 - explode * 0.6
                : -MOTOR.housingLength / 2 + explodeZ("frontCap", explode)
            }
            flip={false}
          />
          <EndCap
            z={
              isolate === "housing"
                ? MOTOR.housingLength / 2 + explode * 0.6
                : MOTOR.housingLength / 2 + explodeZ("rearCap", explode)
            }
            flip
          />
        </>
      )}

      {!statorHidden && (
        <>
          <group position={[0, 0, isolate === "stator" ? 0 : explodeZ("statorCore", explode)]}>
            {ROTORS[rotor].needsOwnStator ? (
              <SalientStator
                materials={materials}
                activePair={activePhase}
                winding={ROTORS[rotor].windingMaterial ?? "copper"}
                dimmed={dimStator}
              />
            ) : (
              <Stator
                materials={materials}
                activePhase={activePhase}
                phaseStrengths={phaseStrengths}
                showWindings={showWindings}
                dimmed={dimStator}
                explode={isolate === "stator" ? explode : 0}
              />
            )}
          </group>
        </>
      )}

      {showBearings && (
        <>
          <Bearing
            z={
              isolate === "housing" || isolate === "shaft"
                ? -MOTOR.housingLength / 2 - explode * 0.65
                : -MOTOR.housingLength / 2 + explodeZ("frontBearing", explode)
            }
          />
          <Bearing
            z={
              isolate === "housing" || isolate === "shaft"
                ? MOTOR.housingLength / 2 + explode * 0.65
                : MOTOR.housingLength / 2 + explodeZ("rearBearing", explode)
            }
          />
        </>
      )}

      {!rotorHidden && (
        <group
          ref={rotorRef}
          position={[0, 0, isolate === "rotor" ? 0 : explodeZ("rotor", explode)]}
        >
          <Rotor
            id={rotor}
            materials={materials}
            intensity={intensity}
            fieldLive={fieldLive}
            excitation={excitation}
            explode={isolate === "rotor" ? explode : 0}
          />
        </group>
      )}

      {showShaft && (
        <mesh
          material={materials.shaft}
          position={[
            0,
            0,
            isolate === "rotor"
              ? explode * 0.85
              : isolate === "shaft"
                ? 0
                : explodeZ("shaft", explode),
          ]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <cylinderGeometry
            args={[MOTOR.shaftRadius, MOTOR.shaftRadius, MOTOR.housingLength * 1.85, 28]}
          />
        </mesh>
      )}

      <group ref={fieldRef}>
        {fieldLesson !== "none" && (
          <FieldLesson mode={fieldLesson === "lock" ? "lock" : fieldLesson} trail={loadAngle} />
        )}
      </group>
    </group>
  );
}
