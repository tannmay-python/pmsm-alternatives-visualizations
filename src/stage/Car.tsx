import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { PALETTE } from "./materials";

/**
 * The car exists to answer one question: where is the motor, and how little of
 * the car is it. The body is a single extruded profile held at low opacity so
 * the skateboard, the drive units and the wheels are what the eye lands on.
 */

export type CarProps = {
  /** Which object takes the accent. */
  focus?: "none" | "drive-unit" | "battery" | "magnet";
  /** Energy pulses running battery → inverter → motor → wheel. */
  flowing?: boolean;
  /** 0–1, pulls the rear drive unit out of the car. */
  extract?: number;
  spinning?: boolean;
};

const BODY_PROFILE: [number, number][] = [
  [-3.3, 0.52],
  [-3.24, 1.02],
  [-2.72, 1.24],
  [-1.62, 1.4],
  [-0.86, 2.02],
  [1.02, 2.06],
  [1.88, 1.44],
  [2.74, 1.3],
  [3.2, 1.0],
  [3.28, 0.56],
  [2.9, 0.38],
  [-2.96, 0.38],
];

function Body() {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(...BODY_PROFILE[0]);
    BODY_PROFILE.slice(1).forEach(([x, y]) => shape.lineTo(x, y));
    shape.closePath();

    for (const cx of [-2.12, 2.06]) {
      const arch = new THREE.Path();
      arch.absellipse(cx, 0.52, 0.63, 0.63, 0, Math.PI * 2, true);
      shape.holes.push(arch);
    }

    return new THREE.ExtrudeGeometry(shape, {
      depth: 1.42,
      bevelEnabled: true,
      bevelSize: 0.03,
      bevelThickness: 0.03,
      bevelSegments: 2,
      curveSegments: 24,
    });
  }, []);

  return (
    <mesh geometry={geometry} position={[0, 0, -0.71]}>
      <meshPhysicalMaterial
        color="#0f1413"
        transparent
        opacity={0.17}
        roughness={0.14}
        metalness={0.2}
        clearcoat={0.8}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function Wheel({ x, z, spinning }: { x: number; z: number; spinning: boolean }) {
  const hub = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (spinning && hub.current) hub.current.rotation.z += delta * 2.6;
  });
  return (
    <group position={[x, 0.52, z]}>
      <mesh>
        <torusGeometry args={[0.52, 0.15, 14, 40]} />
        <meshStandardMaterial color="#141817" roughness={0.86} metalness={0.05} />
      </mesh>
      <group ref={hub}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.12, 32]} />
          <meshStandardMaterial color="#7b8482" roughness={0.3} metalness={0.9} />
        </mesh>
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.2, Math.sin(a) * 0.2, 0.07]}
              rotation={[0, 0, a]}
            >
              <boxGeometry args={[0.3, 0.05, 0.03]} />
              <meshStandardMaterial color="#59615f" roughness={0.34} metalness={0.88} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

function Skateboard({ focus }: { focus: CarProps["focus"] }) {
  const lit = focus === "battery";
  return (
    <group position={[-0.2, 0.6, 0]}>
      <mesh>
        <boxGeometry args={[4.5, 0.24, 1.66]} />
        <meshStandardMaterial
          color={lit ? PALETTE.accentDim : "#2b3231"}
          roughness={0.62}
          metalness={0.45}
          emissive={lit ? PALETTE.accent : "#000000"}
          emissiveIntensity={lit ? 0.16 : 0}
        />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[-1.98 + i * 0.5, 0.14, 0]}>
          <boxGeometry args={[0.4, 0.06, 1.42]} />
          <meshStandardMaterial color="#39413f" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

/** A compact drive unit: inverter box, motor barrel, gear housing. */
function DriveUnit({
  x,
  lit,
  offset = 0,
  spinning,
}: {
  x: number;
  lit: boolean;
  offset?: number;
  spinning: boolean;
}) {
  const barrel = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (spinning && barrel.current) barrel.current.rotation.x += delta * 3.4;
  });
  const shell = lit ? PALETTE.accent : "#6f7a78";
  return (
    <group position={[x, 0.66, offset]}>
      <mesh position={[-0.42, 0.16, 0]}>
        <boxGeometry args={[0.5, 0.4, 0.78]} />
        <meshStandardMaterial color={lit ? PALETTE.accentDim : "#525b59"} roughness={0.6} metalness={0.5} />
      </mesh>
      <group ref={barrel}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.4, 0.4, 0.82, 28]} />
          <meshStandardMaterial
            color={shell}
            roughness={0.44}
            metalness={0.62}
            emissive={lit ? PALETTE.accentDim : "#000000"}
            emissiveIntensity={lit ? 0.18 : 0}
          />
        </mesh>
        {Array.from({ length: 20 }, (_, i) => {
          const a = (i / 20) * Math.PI * 2;
          return (
            <mesh key={i} position={[0, Math.cos(a) * 0.41, Math.sin(a) * 0.41]} rotation={[a, 0, 0]}>
              <boxGeometry args={[0.8, 0.035, 0.05]} />
              <meshStandardMaterial color={lit ? PALETTE.accentDim : "#5c6664"} roughness={0.55} metalness={0.6} />
            </mesh>
          );
        })}
      </group>
      <mesh position={[0.46, -0.06, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.34, 24]} />
        <meshStandardMaterial color="#59615f" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0.1, -0.08, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 2.0, 12]} />
        <meshStandardMaterial color="#9aa3a1" roughness={0.24} metalness={0.92} />
      </mesh>
    </group>
  );
}

function Pulse({ curve, offset, flowing }: { curve: THREE.CatmullRomCurve3; offset: number; flowing: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const t = useRef(offset);
  useFrame((_, delta) => {
    if (flowing) t.current = (t.current + delta * 0.42) % 1;
    ref.current?.position.copy(curve.getPointAt(t.current));
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.055, 12, 12]} />
      <meshBasicMaterial color={PALETTE.accent} />
    </mesh>
  );
}

export function Car({ focus = "none", flowing = false, extract = 0, spinning = false }: CarProps) {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.2, 0.76, 0.5),
        new THREE.Vector3(0.9, 0.82, 0.5),
        new THREE.Vector3(1.6, 0.8, 0.42),
        new THREE.Vector3(2.0, 0.72, 0.2),
      ]),
    [],
  );

  return (
    <group rotation={[0, 0.5, 0]} position={[0, -0.9, 0]}>
      <Body />
      <Skateboard focus={focus} />
      <DriveUnit x={2.05} lit={focus === "drive-unit" || focus === "magnet"} offset={extract * 2.4} spinning={spinning} />
      <Wheel x={-2.12} z={0.78} spinning={spinning} />
      <Wheel x={2.06} z={0.78} spinning={spinning} />
      <Wheel x={-2.12} z={-0.78} spinning={spinning} />
      <Wheel x={2.06} z={-0.78} spinning={spinning} />
      <mesh>
        <tubeGeometry args={[curve, 20, 0.022, 6, false]} />
        <meshBasicMaterial color={PALETTE.accentDim} transparent opacity={0.5} />
      </mesh>
      <Pulse curve={curve} offset={0} flowing={flowing} />
      <Pulse curve={curve} offset={0.4} flowing={flowing} />
      <Pulse curve={curve} offset={0.75} flowing={flowing} />
    </group>
  );
}
