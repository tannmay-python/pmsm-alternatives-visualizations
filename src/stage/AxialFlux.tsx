import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { AXIAL, axialCoilPositions, axialMagnetPositions } from "./geometry";
import { PALETTE } from "./materials";

/**
 * Axial flux, shown beside the radial machine it replaces.
 *
 * This is the one alternative that cannot be expressed as a rotor swap. The
 * field runs along the shaft instead of across a radial air gap, so the machine
 * becomes a stack of discs: rotor, stator, rotor. Torque comes from a large
 * mean radius rather than a long stack, which is why it produces more torque in
 * a much shorter package — and why it is the usual way to make a weak ferrite
 * magnet do useful work.
 */
export function AxialFlux({
  spinning,
  exploded,
  chemistry = "ferrite",
}: {
  spinning: boolean;
  /** 0–1, separates the two rotor discs from the stator between them. */
  exploded: number;
  chemistry?: "ferrite" | "ndfeb";
}) {
  const magnets = useMemo(() => axialMagnetPositions(), []);
  const coils = useMemo(() => axialCoilPositions(), []);
  const rotors = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (spinning && rotors.current) rotors.current.rotation.z += delta * 1.4;
  });

  const gap = AXIAL.gap + exploded * 0.55;
  const magnetColour = chemistry === "ferrite" ? PALETTE.ferrite : PALETTE.magnet;
  // Ferrite carries about a third of NdFeB's remanence, so an axial design
  // built around it uses visibly deeper magnets to recover the working flux.
  const magnetDepth = chemistry === "ferrite" ? 0.055 : 0.032;

  const disc = (side: 1 | -1) => (
    <group position={[0, 0, side * (AXIAL.discThickness + gap)]}>
      {/* Back-iron disc: the return path for the axial field. */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[AXIAL.outerRadius, AXIAL.outerRadius, AXIAL.discThickness, 64]}
        />
        <meshStandardMaterial color={PALETTE.castAluminium} roughness={0.55} metalness={0.7} />
      </mesh>
      {magnets.map(({ angle, position, polarity }) => (
        <mesh
          key={angle}
          position={[position[0], position[1], -side * (AXIAL.discThickness / 2 + magnetDepth / 2)]}
          rotation={[0, 0, angle]}
          castShadow
        >
          <boxGeometry args={[0.3, 0.2, magnetDepth]} />
          <meshStandardMaterial
            // Alternating polarity around the disc is what makes the field
            // reverse under each successive coil, so the two poles are drawn
            // as two tones rather than one slab of magnet.
            color={polarity > 0 ? magnetColour : PALETTE.steelMid}
            roughness={chemistry === "ferrite" ? 0.8 : 0.42}
            metalness={chemistry === "ferrite" ? 0.1 : 0.35}
          />
        </mesh>
      ))}
    </group>
  );

  return (
    <group rotation={[0, 0, 0]}>
      <group ref={rotors}>
        {disc(1)}
        {disc(-1)}
      </group>

      {/* Stator ring, sandwiched between the two rotors and carrying the coils. */}
      <group>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[(AXIAL.outerRadius + AXIAL.innerRadius) / 2, 0.016, 8, 72]} />
          <meshStandardMaterial color={PALETTE.steelMid} roughness={0.5} metalness={0.7} />
        </mesh>
        {coils.map(({ angle, position, phase }) => (
          <group key={angle} position={[position[0], position[1], 0]} rotation={[0, 0, angle]}>
            {[0.062, 0.084, 0.106].map((radius) => (
              <mesh key={radius} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[radius, 0.014, 6, 22]} />
                <meshStandardMaterial
                  color={PALETTE.copper}
                  emissive={PALETTE.accent}
                  emissiveIntensity={phase === 0 ? 0.28 : 0}
                  roughness={0.38}
                  metalness={0.72}
                />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.13, 1.7, 24]} />
        <meshStandardMaterial color={PALETTE.steelLight} roughness={0.2} metalness={0.94} />
      </mesh>
    </group>
  );
}
