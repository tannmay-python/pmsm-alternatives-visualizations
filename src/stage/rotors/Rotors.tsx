import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import {
  CAGE,
  MOTOR,
  SRM,
  WOUND,
  cageBarPositions,
  cageLaminationShape,
  ipmMagnetPlacements,
  laminationGeometry,
  reluctanceLaminationShape,
  rotorLaminationShape,
  salientRotorShape,
  woundRotorShape,
} from "../geometry";
import { PALETTE, type MotorMaterials } from "../materials";
import type { RotorId } from "./registry";

export type RotorProps = {
  materials: MotorMaterials;
  /** How the field power reaches a wound rotor. Ignored by every other rotor. */
  excitation?: "brushed" | "contactless";
  /** 0–1. Drives magnet stress colour, cage current, or excitation glow. */
  intensity?: number;
  /** Rotor field currently live. False shows a de-excited or coasting rotor. */
  fieldLive?: boolean;
  dimmed?: boolean;
  explode?: number;
  /**
   * Where the stator field currently points, measured in the rotor's own
   * frame and updated every frame by the motor. The cage reads it to light
   * the bars the field is sweeping past.
   */
  fieldAngleRef?: React.RefObject<number>;
};

const POLES = 8;
/** How far the magnets slide out of the +z face per unit of explode. */
export const MAGNET_SLIDE = 0.3;

/** Buried magnets in V pockets — the mainstream traction rotor. */
function IpmRotor({ materials, intensity = 0, ferrite = false, explode = 0 }: RotorProps & { ferrite?: boolean }) {
  const thickness = ferrite ? 0.1 : 0.05;
  const core = useMemo(
    () => laminationGeometry(rotorLaminationShape(POLES, { magnetThickness: thickness }), MOTOR.stackLength, 0),
    [thickness],
  );
  const magnets = useMemo(() => ipmMagnetPlacements(POLES, thickness), [thickness]);

  return (
    <group>
      <mesh geometry={core} material={materials.rotorLaminate} castShadow receiveShadow />
      <group position={[0, 0, explode * MAGNET_SLIDE]}>
        {magnets.map(({ key, centre, rotation, length, isNorth }) => {
          const isHot = intensity > 0.65;
          const poleColor = isNorth ? materials.magnet.color : materials.magnetSouth.color;
          return (
            <mesh key={key} position={[centre[0], centre[1], 0]} rotation={[0, 0, rotation]} castShadow>
              <boxGeometry args={[length * 0.92, thickness, MOTOR.stackLength * 0.99]} />
              <meshStandardMaterial
                color={isHot ? PALETTE.warn : ferrite ? materials.ferrite.color : poleColor}
                roughness={ferrite ? materials.ferrite.roughness : 0.3}
                metalness={ferrite ? materials.ferrite.metalness : 0.6}
                emissive={isHot ? PALETTE.warn : "#000000"}
                emissiveIntensity={isHot ? (intensity - 0.65) * 1.5 : 0}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

/**
 * Bare steel with shorted aluminium bars. The rotor makes its own field, on
 * demand: each bar lights as the stator field sweeps past it, which is the
 * whole of induction in one picture.
 */
function CageRotor({ materials, intensity = 0, fieldLive = true, fieldAngleRef }: RotorProps) {
  const core = useMemo(
    () => laminationGeometry(cageLaminationShape(), MOTOR.stackLength, 0),
    [],
  );
  const bars = useMemo(() => cageBarPositions(), []);
  const barGeometry = useMemo(
    () => new THREE.CylinderGeometry(CAGE.barRadius, CAGE.barRadius, MOTOR.stackLength * 1.16, 12),
    [],
  );
  const barMaterials = useMemo(
    () =>
      bars.map(
        () =>
          new THREE.MeshStandardMaterial({
            color: PALETTE.aluminium,
            roughness: 0.3,
            metalness: 0.9,
            emissive: new THREE.Color(PALETTE.accent),
            emissiveIntensity: 0,
          }),
      ),
    [bars],
  );
  const ringMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: PALETTE.aluminium,
        roughness: 0.32,
        metalness: 0.88,
        emissive: new THREE.Color(PALETTE.accent),
        emissiveIntensity: 0,
      }),
    [],
  );

  const silver = useMemo(() => new THREE.Color(PALETTE.aluminium), []);
  const hot = useMemo(() => new THREE.Color(PALETTE.accent), []);

  useFrame(() => {
    const base = fieldLive ? intensity * 0.5 : 0;
    const field = fieldAngleRef?.current;
    bars.forEach(({ angle }, i) => {
      let lit = base;
      if (fieldLive && field !== undefined) {
        // Current in a cage under a two-pole field is a sine wave around the
        // rotor, peaking under the field axis. The near side is the one the
        // arrow is pointing at, so it gets the full glow.
        const c = Math.cos(angle - field);
        lit = c > 0 ? Math.pow(c, 2) : Math.pow(-c, 2) * 0.3;
      }
      // Pale silver plus a strong emissive tone-maps to white, not orange, so
      // the bar's own colour warms toward copper as the current rises.
      barMaterials[i].color.copy(silver).lerp(hot, Math.min(1, lit));
      barMaterials[i].emissiveIntensity = lit * 0.35;
    });
    ringMaterial.emissiveIntensity = fieldLive ? (field !== undefined ? 0.2 : intensity * 0.3) : 0;
  });

  return (
    <group>
      <mesh geometry={core} material={materials.rotorLaminate} castShadow receiveShadow />
      {bars.map(({ angle, position }, i) => (
        <mesh
          key={angle}
          geometry={barGeometry}
          material={barMaterials[i]}
          position={[position[0], position[1], 0]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      ))}
      {/* The end rings that short every bar — without them there is no current. */}
      {[-1, 1].map((side) => (
        <mesh key={side} material={ringMaterial} position={[0, 0, (side * MOTOR.stackLength) / 2 + side * 0.06]}>
          <torusGeometry args={[CAGE.barCentre, 0.042, 8, 48]} />
        </mesh>
      ))}
    </group>
  );
}

/** Where the slip rings sit along the shaft, past the rotor's +z face. */
export const SLIP_RING = {
  z: [MOTOR.stackLength / 2 + 0.2, MOTOR.stackLength / 2 + 0.36] as const,
  radius: MOTOR.shaftRadius + 0.08,
  width: 0.09,
} as const;

/**
 * Slip rings: two copper bands on the shaft, turning with it. The brushes
 * that press on them do not turn, so they live in Brushes below and are
 * mounted outside the rotor group.
 */
function SlipRings({ live }: { live: boolean }) {
  return (
    <group>
      {SLIP_RING.z.map((z) => (
        <mesh key={z} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[SLIP_RING.radius, SLIP_RING.radius, SLIP_RING.width, 36]} />
          <meshStandardMaterial
            color={PALETTE.copper}
            roughness={0.28}
            metalness={0.85}
            emissive={live ? PALETTE.accent : "#000000"}
            emissiveIntensity={live ? 0.35 : 0}
          />
        </mesh>
      ))}
      {/* A dark spacer between the two bands, so they read as two. */}
      <mesh position={[0, 0, (SLIP_RING.z[0] + SLIP_RING.z[1]) / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[SLIP_RING.radius - 0.02, SLIP_RING.radius - 0.02, SLIP_RING.z[1] - SLIP_RING.z[0], 36]} />
        <meshStandardMaterial color={PALETTE.seal} roughness={0.9} metalness={0.1} />
      </mesh>
    </group>
  );
}

/**
 * The stationary half of the brushed connection: two carbon brushes pressed
 * onto the rings from above, with the feed lead that brings the current in.
 */
export function Brushes({ live }: { live: boolean }) {
  const leads = useMemo(() => {
    const top = SLIP_RING.radius + 0.2;
    return SLIP_RING.z.map(
      (z) =>
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, top - 0.02, z),
            new THREE.Vector3(0, top + 0.12, z + 0.02),
            new THREE.Vector3(0, top + 0.3, z + 0.14),
            new THREE.Vector3(0, top + 0.42, z + 0.34),
          ]),
          24,
          0.018,
          8,
          false,
        ),
    );
  }, []);

  return (
    <group>
      {SLIP_RING.z.map((z) => (
        <group key={z} position={[0, SLIP_RING.radius, z]}>
          {/* Carbon block riding on the ring. */}
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[0.1, 0.13, 0.08]} />
            <meshStandardMaterial color="#2f3335" roughness={0.92} metalness={0.05} />
          </mesh>
          {/* Holder that presses it down. */}
          <mesh position={[0, 0.17, 0]}>
            <boxGeometry args={[0.14, 0.06, 0.12]} />
            <meshStandardMaterial color={PALETTE.steelMid} roughness={0.5} metalness={0.7} />
          </mesh>
        </group>
      ))}
      {leads.map((geometry, i) => (
        <mesh key={i} geometry={geometry}>
          <meshStandardMaterial
            color={PALETTE.copper}
            roughness={0.4}
            metalness={0.7}
            emissive={live ? PALETTE.accent : "#000000"}
            emissiveIntensity={live ? 0.3 : 0}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * A rotating transformer: the contactless alternative. Field power crosses an
 * air gap inductively, so there is nothing to wear — this is what ZF's I2SM,
 * Mahle's MCT and Valeo's iBEE are, and what the "virtual magnet" machines are.
 */
function RotatingTransformer({ live }: { live: boolean }) {
  return (
    <group position={[0, 0, MOTOR.stackLength / 2 + 0.24]}>
      {/* Rotating half, keyed to the shaft. */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[MOTOR.shaftRadius + 0.11, 0.055, 10, 40]} />
        <meshStandardMaterial
          color={PALETTE.copper}
          roughness={0.34}
          metalness={0.82}
          emissive={live ? PALETTE.accent : "#000000"}
          emissiveIntensity={live ? 0.45 : 0}
        />
      </mesh>
      {/* Stationary half, separated by the air gap that replaces the brushes. */}
      <mesh position={[0, 0, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[MOTOR.shaftRadius + 0.11, 0.06, 10, 40]} />
        <meshStandardMaterial color={PALETTE.steelMid} roughness={0.45} metalness={0.7} />
      </mesh>
    </group>
  );
}

/** A closed loop of wire with rounded corners, lying in the y–z plane at x = 0. */
function coilLoop(halfWidth: number, halfLength: number, corner: number): THREE.CatmullRomCurve3 {
  const points: THREE.Vector3[] = [];
  const arc = (cy: number, cz: number, from: number) => {
    for (let i = 0; i <= 4; i += 1) {
      const a = from + (i / 4) * (Math.PI / 2);
      points.push(new THREE.Vector3(0, cy + Math.cos(a) * corner, cz + Math.sin(a) * corner));
    }
  };
  const w = halfWidth - corner;
  const l = halfLength - corner;
  arc(w, l, 0);
  arc(-w, l, Math.PI / 2);
  arc(-w, -l, Math.PI);
  arc(w, -l, Math.PI * 1.5);
  return new THREE.CatmullRomCurve3(points, true, "catmullrom", 0.4);
}

/** Copper on the rotor, fed deliberately. A magnet you can switch off. */
function WoundRotor({
  materials,
  intensity = 0.7,
  fieldLive = true,
  excitation = "brushed",
}: RotorProps) {
  const core = useMemo(
    () => laminationGeometry(woundRotorShape(WOUND.poles), MOTOR.stackLength, 0),
    [],
  );

  // One bobbin per pole: two layers of three turns each, wound around the
  // pole body between the core and the underside of the shoe.
  const turns = useMemo(() => {
    const wire = 0.028;
    const xs = [0.375, 0.415, 0.455];
    const layers = [WOUND.bodyHalf + wire + 0.012, WOUND.bodyHalf + wire * 3 + 0.02];
    return layers.flatMap((halfWidth, layer) =>
      xs.map((x) => ({
        key: `${layer}-${x}`,
        x,
        geometry: new THREE.TubeGeometry(
          coilLoop(halfWidth, MOTOR.stackLength / 2 + 0.05 + layer * 0.02, 0.06),
          72,
          wire,
          8,
          true,
        ),
      })),
    );
  }, []);

  const glow = fieldLive ? 0.3 + intensity * 0.6 : 0;
  const poles = useMemo(
    () => Array.from({ length: WOUND.poles }, (_, pole) => (pole * Math.PI * 2) / WOUND.poles),
    [],
  );

  return (
    <group>
      <mesh geometry={core} material={materials.rotorLaminate} castShadow receiveShadow />
      {excitation === "brushed" ? <SlipRings live={fieldLive} /> : <RotatingTransformer live={fieldLive} />}
      {poles.map((angle) => (
        <group key={angle} rotation={[0, 0, angle]}>
          {turns.map(({ key, x, geometry }) => (
            <mesh key={key} geometry={geometry} position={[x, 0, 0]} castShadow>
              <meshStandardMaterial
                color={PALETTE.copper}
                roughness={0.36}
                metalness={0.72}
                emissive={PALETTE.accent}
                emissiveIntensity={glow}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/** Shaped steel and air. Nothing to excite and nothing to switch off. */
function ReluctanceRotor({
  materials,
  withMagnets = false,
  intensity = 0,
}: RotorProps & { withMagnets?: boolean }) {
  const core = useMemo(
    () => laminationGeometry(reluctanceLaminationShape(4, 3), MOTOR.stackLength, 0),
    [],
  );

  const inserts = useMemo(() => {
    if (!withMagnets) return [];
    const pitch = (Math.PI * 2) / 4;
    return Array.from({ length: 4 }, (_, pole) => {
      const angle = pole * pitch;
      const radius = MOTOR.shaftRadius + (MOTOR.rotorOuter - MOTOR.shaftRadius) * 0.5;
      return {
        angle,
        position: [Math.cos(angle) * radius, Math.sin(angle) * radius, 0] as [
          number,
          number,
          number,
        ],
      };
    });
  }, [withMagnets]);

  return (
    <group>
      <mesh geometry={core} material={materials.rotorLaminate} castShadow receiveShadow />
      {inserts.map(({ angle, position }) => (
        <mesh key={angle} position={position} rotation={[0, 0, angle]} castShadow>
          <boxGeometry args={[0.045, 0.34, MOTOR.stackLength * 0.94]} />
          <meshStandardMaterial
            color={PALETTE.magnet}
            roughness={0.46}
            metalness={0.3}
            emissive={PALETTE.warn}
            emissiveIntensity={intensity * 0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Switched reluctance: salient steel lumps and nothing else. It pairs with a
 * salient stator, so unlike every other rotor here it cannot simply drop into
 * the distributed-wound machine.
 */
function SrmRotor({ materials }: RotorProps) {
  const core = useMemo(
    () => laminationGeometry(salientRotorShape(SRM.rotorPoles), MOTOR.stackLength, 0),
    [],
  );
  return <mesh geometry={core} material={materials.rotorLaminate} castShadow receiveShadow />;
}

export function Rotor({ id, ...props }: RotorProps & { id: RotorId }) {
  switch (id) {
    case "squirrel-cage":
      return <CageRotor {...props} />;
    case "wound":
      return <WoundRotor {...props} />;
    case "synrm":
      return <ReluctanceRotor {...props} />;
    case "pm-assisted-synrm":
      return <ReluctanceRotor {...props} withMagnets />;
    case "srm":
      return <SrmRotor {...props} />;
    case "ferrite-ipm":
      return <IpmRotor {...props} ferrite />;
    case "ipm-ndfeb":
    default:
      return <IpmRotor {...props} />;
  }
}
