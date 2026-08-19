import { useMemo } from "react";
import { MOTOR, SRM, laminationGeometry, salientStatorShape } from "./geometry";
import { PALETTE, type MotorMaterials } from "./materials";

/**
 * The switched-reluctance stator.
 *
 * Every other machine in this tour shares one distributed three-phase winding,
 * which is why they can be shown as rotor swaps into a single housing. Switched
 * reluctance cannot: it needs a small number of chunky salient poles, each with
 * its own concentrated coil wrapped around it, energised in sequence. Showing it
 * with the 48-slot stator would be showing a different motor.
 *
 * Advanced Electric Machines also winds theirs in compressed aluminium rather
 * than copper, so the coils here take the aluminium material by default.
 */
export function SalientStator({
  materials,
  activePair,
  winding = "aluminium",
  dimmed = false,
}: {
  materials: MotorMaterials;
  /** Which opposite pole pair is currently energised, or null for none. */
  activePair: number | null;
  winding?: "copper" | "aluminium";
  dimmed?: boolean;
}) {
  const core = useMemo(
    () => laminationGeometry(salientStatorShape(SRM.statorPoles), MOTOR.stackLength, 0),
    [],
  );

  const poles = useMemo(() => {
    const pitch = (Math.PI * 2) / SRM.statorPoles;
    const radius = (SRM.statorPoleTip + MOTOR.statorOuter - 0.16) / 2;
    return Array.from({ length: SRM.statorPoles }, (_, pole) => {
      const angle = pole * pitch;
      return {
        pole,
        angle,
        position: [Math.cos(angle) * radius, Math.sin(angle) * radius, 0] as [
          number,
          number,
          number,
        ],
      };
    });
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

  const coilColour = winding === "aluminium" ? PALETTE.aluminium : PALETTE.copper;

  return (
    <group>
      <mesh geometry={core} material={coreMaterial} castShadow receiveShadow />

      {poles.map(({ pole, angle, position }) => {
        // Opposite poles are energised together, which is what pulls a rotor
        // lump into line with them.
        const lit =
          activePair !== null && pole % (SRM.statorPoles / 2) === activePair;

        return (
          <group key={pole} position={position} rotation={[0, 0, angle]}>
            {[-0.26, -0.13, 0, 0.13, 0.26].map((offset) => (
              <mesh key={offset} position={[0, 0, offset]} rotation={[0, Math.PI / 2, 0]}>
                <torusGeometry args={[0.115, 0.028, 8, 20]} />
                <meshStandardMaterial
                  color={lit ? PALETTE.accent : coilColour}
                  emissive={lit ? PALETTE.accent : "#000000"}
                  emissiveIntensity={lit ? 0.45 : 0}
                  roughness={winding === "aluminium" ? 0.4 : 0.36}
                  metalness={0.8}
                  transparent={dimmed}
                  opacity={dimmed ? 0.2 : 1}
                />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}
