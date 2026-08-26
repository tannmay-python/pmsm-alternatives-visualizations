import { useMemo } from "react";
import * as THREE from "three";
import {
  MOTOR,
  hairpinCurve,
  laminationGeometry,
  slotPhase,
  statorLaminationShape,
} from "./geometry";
import { PALETTE, type MotorMaterials } from "./materials";

/**
 * All three groups are the same copper, because they are. What distinguishes
 * them is which one is carrying current right now, so that is what gets the
 * accent — colour-coding the metal itself would imply three materials.
 */
const COPPER_IDLE = "#a8703f";

type StatorProps = {
  materials: MotorMaterials;
  /** Which phase group is currently energised, or null for none. */
  activePhase: number | null;
  /** 0–1 strength per phase, for the rotating-field scrubber. */
  phaseStrengths?: readonly number[];
  dimmed?: boolean;
  showWindings?: boolean;
  explode?: number;
};

export function Stator({
  materials,
  activePhase,
  phaseStrengths,
  dimmed = false,
  showWindings = true,
  explode = 0,
}: StatorProps) {
  const core = useMemo(
    () => laminationGeometry(statorLaminationShape(), MOTOR.stackLength, 0),
    [],
  );

  // One hairpin per slot, spanning a pole pitch. Built once and reused.
  const hairpins = useMemo(() => {
    const span = Math.round(MOTOR.slotCount / 8);
    return Array.from({ length: MOTOR.slotCount }, (_, slot) => ({
      slot,
      phase: slotPhase(slot),
      geometry: new THREE.TubeGeometry(hairpinCurve(slot, span), 30, 0.027, 7, false),
    }));
  }, []);

  const coreMaterial = useMemo(() => {
    const material = materials.laminate.clone();
    if (dimmed) {
      material.transparent = true;
      material.opacity = 0.16;
      material.depthWrite = false;
    }
    return material;
  }, [materials.laminate, dimmed]);

  return (
    <group>
      <mesh geometry={core} material={coreMaterial} castShadow receiveShadow />

      {/* The lamination stack reads as stacked sheet, not solid billet. */}
      {Array.from({ length: 7 }, (_, i) => {
        const z = -MOTOR.stackLength / 2 + (MOTOR.stackLength * (i + 1)) / 8;
        return (
          <mesh key={i} position={[0, 0, z]} renderOrder={1}>
            <torusGeometry args={[MOTOR.statorOuter - 0.001, 0.0035, 4, 96]} />
            <meshStandardMaterial color="#2a302e" roughness={0.9} metalness={0.4} />
          </mesh>
        );
      })}

      {showWindings && (
        <group position={[0, 0, explode * 0.8]}>
          {hairpins.map(({ slot, phase, geometry }) => {
          const strength = phaseStrengths?.[phase];
          // While scrubbing the electrical angle, "lit" tracks the group that is
          // actually carrying the most current at this instant.
          const lit =
            activePhase === phase ||
            (activePhase === null && strength !== undefined && Math.abs(strength) > 0.62);
          const intensity =
            strength !== undefined ? Math.abs(strength) : lit ? 1 : 0;

          // When one group is deliberately energised, the other two drop back to
          // bare steel. Copper everywhere reads as one winding, not three.
          const suppressed = activePhase !== null && !lit;

          return (
            <mesh key={slot} geometry={geometry} castShadow={!dimmed} renderOrder={dimmed ? 2 : 0}>
              <meshStandardMaterial
                color={lit ? PALETTE.accent : suppressed ? "#9aa3a0" : COPPER_IDLE}
                emissive={lit ? PALETTE.accent : "#000000"}
                emissiveIntensity={lit ? 0.25 + intensity * 0.5 : 0}
                roughness={lit ? 0.34 : 0.42}
                metalness={0.7}
                transparent={dimmed}
                opacity={dimmed ? 0.2 : 1}
                depthWrite={!dimmed}
              />
            </mesh>
          );
        })}
        </group>
      )}
    </group>
  );
}
