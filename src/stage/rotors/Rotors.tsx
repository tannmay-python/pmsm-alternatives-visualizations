import { useMemo } from "react";
import * as THREE from "three";
import {
  MOTOR,
  cageBarPositions,
  cageLaminationShape,
  laminationGeometry,
  reluctanceLaminationShape,
  rotorLaminationShape,
} from "../geometry";
import { PALETTE, type MotorMaterials } from "../materials";
import type { RotorId } from "./registry";

export type RotorProps = {
  materials: MotorMaterials;
  /** 0–1. Drives magnet stress colour, cage current, or excitation glow. */
  intensity?: number;
  /** Rotor field currently live. False shows a de-excited or coasting rotor. */
  fieldLive?: boolean;
  dimmed?: boolean;
};

const POLES = 8;

/** Buried magnets in V pockets — the mainstream traction rotor. */
function IpmRotor({ materials, intensity = 0, fieldLive = true, ferrite = false }: RotorProps & { ferrite?: boolean }) {
  const core = useMemo(
    () =>
      laminationGeometry(
        rotorLaminationShape(POLES, { pocketWidth: ferrite ? 0.62 : 0.3 }),
        MOTOR.stackLength,
        0,
      ),
    [ferrite],
  );

  const magnets = useMemo(() => {
    const pitch = (Math.PI * 2) / POLES;
    const items: { key: string; position: [number, number, number]; rotation: number }[] = [];
    for (let pole = 0; pole < POLES; pole += 1) {
      const centre = pole * pitch;
      for (const side of [-1, 1] as const) {
        const angle = centre + side * pitch * 0.19 * 0.95;
        const radius = MOTOR.rotorOuter * 0.66;
        items.push({
          key: `${pole}-${side}`,
          position: [Math.cos(angle) * radius, Math.sin(angle) * radius, 0],
          rotation: angle + (side * Math.PI) / 2.4,
        });
      }
    }
    return items;
  }, []);

  const magnetMaterial = ferrite ? materials.ferrite : materials.magnet;

  return (
    <group>
      <mesh geometry={core} material={materials.rotorLaminate} castShadow receiveShadow />
      {magnets.map(({ key, position, rotation }) => (
        <mesh key={key} position={position} rotation={[0, 0, rotation]} castShadow>
          <boxGeometry args={[ferrite ? 0.13 : 0.075, 0.26, MOTOR.stackLength * 0.99]} />
          <meshStandardMaterial
            color={intensity > 0.05 ? PALETTE.warn : magnetMaterial.color}
            roughness={magnetMaterial.roughness}
            metalness={magnetMaterial.metalness}
            emissive={intensity > 0.05 ? PALETTE.warn : "#000000"}
            emissiveIntensity={fieldLive ? intensity * 0.5 : 0}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Bare steel with shorted bars. The rotor makes its own field, on demand. */
function CageRotor({ materials, intensity = 0, fieldLive = true }: RotorProps) {
  const core = useMemo(
    () => laminationGeometry(cageLaminationShape(34), MOTOR.stackLength, 0),
    [],
  );
  const bars = useMemo(() => cageBarPositions(34), []);
  const barGeometry = useMemo(
    () => new THREE.CylinderGeometry(0.031, 0.031, MOTOR.stackLength * 1.16, 10),
    [],
  );

  return (
    <group>
      <mesh geometry={core} material={materials.rotorLaminate} castShadow receiveShadow />
      {bars.map(({ angle, position }) => (
        <mesh
          key={angle}
          geometry={barGeometry}
          position={[position[0], position[1], 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial
            color={PALETTE.aluminium}
            roughness={0.34}
            metalness={0.88}
            emissive={PALETTE.accent}
            emissiveIntensity={fieldLive ? intensity * 0.85 : 0}
          />
        </mesh>
      ))}
      {/* The end rings that short every bar — without them there is no current. */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[0, 0, (side * MOTOR.stackLength) / 2 + side * 0.06]}>
          <torusGeometry args={[MOTOR.rotorOuter - 0.075, 0.036, 8, 48]} />
          <meshStandardMaterial
            color={PALETTE.aluminium}
            roughness={0.36}
            metalness={0.86}
            emissive={PALETTE.accent}
            emissiveIntensity={fieldLive ? intensity * 0.6 : 0}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Copper on the rotor, fed deliberately. A magnet you can switch off. */
function WoundRotor({ materials, intensity = 0.7, fieldLive = true }: RotorProps) {
  const poles = 4;
  const core = useMemo(
    () => laminationGeometry(reluctanceLaminationShape(poles, 1), MOTOR.stackLength, 0),
    [],
  );

  const coils = useMemo(() => {
    const pitch = (Math.PI * 2) / poles;
    return Array.from({ length: poles }, (_, pole) => {
      const angle = pole * pitch;
      return {
        angle,
        position: [
          Math.cos(angle) * MOTOR.rotorOuter * 0.62,
          Math.sin(angle) * MOTOR.rotorOuter * 0.62,
          0,
        ] as [number, number, number],
      };
    });
  }, []);

  return (
    <group>
      <mesh geometry={core} material={materials.rotorLaminate} castShadow receiveShadow />
      {coils.map(({ angle, position }) => (
        <group key={angle} position={position} rotation={[0, 0, angle]}>
          {/* A bundle of turns, not a single torus. */}
          {[-0.09, -0.03, 0.03, 0.09].map((offset) =>
            [-1, 1].map((side) => (
              <mesh
                key={`${offset}-${side}`}
                position={[offset, 0, (side * MOTOR.stackLength) / 2 + side * 0.03]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <torusGeometry args={[0.13, 0.016, 6, 18, Math.PI]} />
                <meshStandardMaterial
                  color={PALETTE.copper}
                  roughness={0.38}
                  metalness={0.72}
                  emissive={PALETTE.accent}
                  emissiveIntensity={fieldLive ? intensity * 0.7 : 0}
                />
              </mesh>
            )),
          )}
          {[-0.09, -0.03, 0.03, 0.09].map((offset) => (
            <mesh key={offset} position={[offset, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.016, 0.016, MOTOR.stackLength, 6]} />
              <meshStandardMaterial
                color={PALETTE.copper}
                roughness={0.38}
                metalness={0.72}
                emissive={PALETTE.accent}
                emissiveIntensity={fieldLive ? intensity * 0.7 : 0}
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
    case "ferrite-ipm":
      return <IpmRotor {...props} ferrite />;
    case "ipm-ndfeb":
    default:
      return <IpmRotor {...props} />;
  }
}
