import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Edges, Html, OrbitControls, RoundedBox } from "@react-three/drei";
import { ArrowClockwise, ArrowLeft, ArrowRight, MagnifyingGlassMinus, MagnifyingGlassPlus, Pause, Play } from "@phosphor-icons/react";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type LessonStep = "location" | "unit" | "anatomy" | "field" | "torque" | "heat" | "protection";
type IsolateMode = "both" | "stator" | "rotor";
type PullMode = "magnet" | "steel" | "both";

type StepInfo = {
  id: LessonStep;
  kicker: string;
  title: string;
  question: string;
  answer: string;
  detail: string;
};

const STEPS: readonly StepInfo[] = [
  { id: "location", kicker: "01 · the whole car", title: "Where the motor lives", question: "What actually turns the wheels?", answer: "A compact drive unit sits between the battery and the wheels.", detail: "The battery sends electrical energy forward. The drive unit turns that energy into rotation at the axle." },
  { id: "unit", kicker: "02 · inside the unit", title: "Open the drive unit", question: "What is packed inside?", answer: "Power electronics feed a motor; gears pass its rotation to the axle.", detail: "The inverter shapes the battery's current. The motor makes torque. The gearset carries that torque to the wheels." },
  { id: "anatomy", kicker: "03 · the motor", title: "Stator and rotor", question: "What moves, and what stays still?", answer: "Copper coils stay still in the stator. Magnets ride inside on the spinning rotor.", detail: "The air gap keeps the two parts close enough to pull on each other without touching. Use the isolate buttons to separate the roles." },
  { id: "field", kicker: "04 · the first pull", title: "Three coils make one field", question: "How can a still coil make motion?", answer: "Three coil groups take turns being strong. Their combined push travels around the ring.", detail: "The coils do not travel. The magnetic push does. The rotor follows that moving field." },
  { id: "torque", kicker: "05 · why it turns", title: "Two pulls, one shaft", question: "Why does the rotor keep turning?", answer: "The magnet follows the field, while the steel shape tries to line up too.", detail: "The first pull is synchronous torque. The second is reluctance torque: steel prefers an easier magnetic route." },
  { id: "heat", kicker: "06 · the weak point", title: "Heat can leave a patch", question: "Why is heat a motor problem?", answer: "Heat makes a magnet easier to reverse. A strong opposing field can leave that reversal behind.", detail: "The controls are qualitative. The important idea is the combined stress: heat lowers the margin, and an opposing field can trigger a permanent patch." },
  { id: "protection", kicker: "07 · the material choice", title: "Protect the vulnerable edge", question: "Why add dysprosium or terbium?", answer: "Dy/Tb protects the edge where reversal is most likely to begin.", detail: "More protection gives more resistance to reversal, but it can soften the magnet's useful field. Grain-boundary diffusion puts protection where it matters most." },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function StageLabel({ children, position, tone = "neutral" }: { children: string; position: [number, number, number]; tone?: "neutral" | "cyan" | "violet" | "amber" | "copper" | "rose" }) {
  return <Html position={position} center distanceFactor={7} style={{ pointerEvents: "none" }}><span className={`stage-label stage-label--${tone}`}>{children}</span></Html>;
}

function VehicleWheel({ position, motionActive }: { position: [number, number, number]; motionActive: boolean }) {
  const hubRef = useRef<THREE.Group>(null);
  const angle = useRef(0);
  useFrame((_, delta) => {
    if (motionActive) angle.current += delta * 3.1;
    if (hubRef.current) hubRef.current.rotation.z = angle.current;
  });
  return <group position={position}>
    <mesh castShadow receiveShadow><torusGeometry args={[0.5, 0.125, 16, 40]} /><meshStandardMaterial color="#203339" roughness={0.52} metalness={0.18} /></mesh>
    <group ref={hubRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.035]}><cylinderGeometry args={[0.3, 0.3, 0.13, 28]} /><meshStandardMaterial color="#bdc9c9" roughness={0.24} metalness={0.92} /></mesh>
      {Array.from({ length: 7 }, (_, index) => <mesh key={index} position={[0.16 * Math.cos((index * Math.PI * 2) / 7), 0.16 * Math.sin((index * Math.PI * 2) / 7), 0.12]} rotation={[0, 0, (index * Math.PI * 2) / 7]}><boxGeometry args={[0.25, 0.045, 0.045]} /><meshStandardMaterial color="#607b80" metalness={0.86} roughness={0.26} /></mesh>)}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.13]}><cylinderGeometry args={[0.075, 0.075, 0.15, 20]} /><meshStandardMaterial color="#35555d" roughness={0.28} metalness={0.84} /></mesh>
    </group>
  </group>;
}

function VehicleShell() {
  const bodyGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-3.18, 0.58);
    shape.lineTo(-3.08, 1.1);
    shape.lineTo(-2.6, 1.3);
    shape.lineTo(-1.55, 1.45);
    shape.lineTo(-0.92, 2.05);
    shape.lineTo(1.12, 2.08);
    shape.lineTo(1.9, 1.47);
    shape.lineTo(2.68, 1.34);
    shape.lineTo(3.12, 1.06);
    shape.lineTo(3.18, 0.62);
    shape.lineTo(2.82, 0.42);
    shape.lineTo(-2.88, 0.42);
    shape.closePath();

    const frontArch = new THREE.Path();
    frontArch.absellipse(-2.02, 0.55, 0.59, 0.59, 0, Math.PI * 2, true);
    const rearArch = new THREE.Path();
    rearArch.absellipse(2.04, 0.55, 0.59, 0.59, 0, Math.PI * 2, true);
    shape.holes.push(frontArch, rearArch);
    return new THREE.ExtrudeGeometry(shape, { depth: 1.34, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.025, bevelThickness: 0.025, curveSegments: 36 });
  }, []);
  return <mesh geometry={bodyGeometry} position={[0, 0, -0.67]} castShadow><meshPhysicalMaterial color="#c4d5d4" transparent opacity={0.32} roughness={0.23} metalness={0.28} clearcoat={0.55} clearcoatRoughness={0.24} side={THREE.DoubleSide} depthWrite={false} /><Edges color="#6d8c90" threshold={18} /></mesh>;
}

function BatteryPack({ motionActive }: { motionActive: boolean }) {
  const moduleRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!moduleRef.current) return;
    const pulse = motionActive ? 0.18 + Math.sin(clock.elapsedTime * 5) * 0.07 : 0.12;
    moduleRef.current.children.forEach((child) => {
      const material = (child as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (material?.emissive) material.emissiveIntensity = pulse;
    });
  });
  return <group position={[-0.38, 0.68, 0]}>
    <RoundedBox args={[3.56, 0.3, 1.08]} radius={0.07} smoothness={2}><meshStandardMaterial color="#3f6671" metalness={0.68} roughness={0.29} /><Edges color="#a8cbd0" threshold={20} /></RoundedBox>
    <group ref={moduleRef} position={[0, 0.18, 0]}>{Array.from({ length: 8 }, (_, row) => Array.from({ length: 2 }, (_, column) => <RoundedBox key={`${row}-${column}`} args={[0.32, 0.12, 0.38]} radius={0.025} smoothness={2} position={[-1.42 + row * 0.405, 0, -0.24 + column * 0.48]}><meshStandardMaterial color="#4f99a5" emissive="#53c4ce" emissiveIntensity={0.12} roughness={0.34} metalness={0.48} /></RoundedBox>))}</group>
    <mesh position={[0, 0.35, 0]}><boxGeometry args={[3.22, 0.035, 0.88]} /><meshBasicMaterial color="#66d4db" transparent opacity={0.28} /></mesh>
  </group>;
}

function EAxleModel({ motionActive }: { motionActive: boolean }) {
  const rotorRef = useRef<THREE.Group>(null);
  const gearRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!motionActive) return;
    if (rotorRef.current) rotorRef.current.rotation.z += delta * 5;
    if (gearRef.current) gearRef.current.rotation.z -= delta * 2.4;
  });
  return <group position={[1.95, 0.72, 0]}>
    <RoundedBox args={[0.72, 0.42, 0.9]} radius={0.07} smoothness={2} position={[-0.72, 0.14, 0]}><meshStandardMaterial color="#78949a" metalness={0.72} roughness={0.25} /><Edges color="#c8d8d8" threshold={20} /></RoundedBox>
    {Array.from({ length: 6 }, (_, index) => <mesh key={index} position={[-0.72 + (index - 2.5) * 0.1, 0.38, 0]}><boxGeometry args={[0.045, 0.12, 0.72]} /><meshStandardMaterial color="#b9c8c7" metalness={0.72} roughness={0.28} /></mesh>)}
    <group ref={rotorRef} position={[-0.08, 0, 0.39]}>{Array.from({ length: 10 }, (_, index) => <mesh key={index} position={[Math.cos((index * Math.PI * 2) / 10) * 0.32, Math.sin((index * Math.PI * 2) / 10) * 0.32, 0]} rotation={[0, 0, (index * Math.PI * 2) / 10]}><RoundedBox args={[0.15, 0.26, 0.12]} radius={0.025} smoothness={2}><meshStandardMaterial color="#c96c31" emissive="#a74e1d" emissiveIntensity={0.38} metalness={0.68} roughness={0.25} /></RoundedBox></mesh>)}<mesh><cylinderGeometry args={[0.26, 0.26, 0.16, 28]} /><meshStandardMaterial color="#5f7479" metalness={0.85} roughness={0.24} /></mesh></group>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[-0.08, 0, 0]}><cylinderGeometry args={[0.48, 0.48, 0.72, 36]} /><meshPhysicalMaterial color="#d3dedd" metalness={0.8} roughness={0.2} transparent opacity={0.32} clearcoat={0.45} /></mesh>
    <group ref={gearRef} position={[0.48, 0, 0.41]}><GearWheel radius={0.3} teeth={11} /></group>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0.32, -0.15, 0]}><cylinderGeometry args={[0.06, 0.06, 1.95, 16]} /><meshStandardMaterial color="#d9e5e2" metalness={0.9} roughness={0.18} /></mesh>
  </group>;
}

function EnergyPulse({ curve, offset, motionActive }: { curve: THREE.CatmullRomCurve3; offset: number; motionActive: boolean }) {
  const pulseRef = useRef<THREE.Mesh>(null);
  const progress = useRef(offset);
  useFrame((_, delta) => {
    if (motionActive) progress.current = (progress.current + delta * 0.34) % 1;
    pulseRef.current?.position.copy(curve.getPointAt(progress.current));
  });
  return <mesh ref={pulseRef}><sphereGeometry args={[0.078, 16, 16]} /><meshStandardMaterial color="#0b9dad" emissive="#37d4dc" emissiveIntensity={0.9} roughness={0.18} /></mesh>;
}

function EnergyPath({ motionActive }: { motionActive: boolean }) {
  const cableCurve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.45, 0.85, 0.62),
    new THREE.Vector3(0.95, 0.93, 0.62),
    new THREE.Vector3(1.45, 0.84, 0.62),
    new THREE.Vector3(1.78, 0.82, 0.62),
  ]), []);
  return <group>
    <mesh><tubeGeometry args={[cableCurve, 28, 0.035, 8, false]} /><meshStandardMaterial color="#19a3b0" emissive="#64d2d8" emissiveIntensity={0.75} roughness={0.25} /></mesh>
    <mesh position={[1.66, 0.82, 0.62]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.08, 0.16, 3]} /><meshBasicMaterial color="#19a3b0" /></mesh>
    <EnergyPulse curve={cableCurve} offset={0} motionActive={motionActive} /><EnergyPulse curve={cableCurve} offset={0.33} motionActive={motionActive} /><EnergyPulse curve={cableCurve} offset={0.66} motionActive={motionActive} />
  </group>;
}

function CarModel({ motionActive }: { motionActive: boolean }) {
  return <group scale={1.22} position={[0, -0.05, 0]} rotation={[0, 0.54, 0]}>
    <VehicleShell />
    <RoundedBox args={[2.12, 0.55, 0.05]} radius={0.06} smoothness={2} position={[-0.04, 1.72, 0.7]}><meshStandardMaterial color="#52757a" transparent opacity={0.4} roughness={0.16} metalness={0.42} /></RoundedBox>
    <mesh position={[0.12, 1.72, 0.74]}><boxGeometry args={[0.05, 0.62, 0.045]} /><meshStandardMaterial color="#6f8a8d" metalness={0.52} roughness={0.33} /></mesh>
    <BatteryPack motionActive={motionActive} />
    <EAxleModel motionActive={motionActive} />
    <EnergyPath motionActive={motionActive} />
    <VehicleWheel position={[-2.02, 0.55, 0.76]} motionActive={motionActive} /><VehicleWheel position={[2.04, 0.55, 0.76]} motionActive={motionActive} />
    <StageLabel position={[-0.5, 0.02, 1.22]} tone="cyan">battery pack</StageLabel><StageLabel position={[2.12, 1.42, 0.74]} tone="copper">rear e-axle</StageLabel>
  </group>;
}

function GearWheel({ radius, teeth }: { radius: number; teeth: number }) {
  return <group>
    <mesh><cylinderGeometry args={[radius * 0.7, radius * 0.7, 0.24, 32]} /><meshStandardMaterial color="#aab9b8" metalness={0.78} roughness={0.28} /></mesh>
    <mesh><torusGeometry args={[radius * 0.72, 0.065, 10, 32]} /><meshStandardMaterial color="#e0e8e5" metalness={0.75} roughness={0.24} /></mesh>
    {Array.from({ length: teeth }, (_, index) => { const angle = (Math.PI * 2 * index) / teeth; return <mesh key={index} position={[Math.cos(angle) * radius * 0.92, Math.sin(angle) * radius * 0.92, 0]} rotation={[0, 0, angle]}><boxGeometry args={[0.14, 0.25, 0.25]} /><meshStandardMaterial color="#99acae" metalness={0.78} roughness={0.28} /></mesh>; })}
  </group>;
}

function DriveMotorCore({ motionActive }: { motionActive: boolean }) {
  const rotorRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => { if (motionActive && rotorRef.current) rotorRef.current.rotation.z += delta * 3.6; });
  return <group>
    <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.74, 0.74, 0.94, 40]} /><meshPhysicalMaterial color="#c4d0cf" metalness={0.84} roughness={0.23} transparent opacity={0.36} clearcoat={0.5} /></mesh>
    <mesh position={[0, 0, 0.5]}><torusGeometry args={[0.63, 0.075, 12, 48]} /><meshStandardMaterial color="#83999b" metalness={0.82} roughness={0.25} /></mesh>
    {Array.from({ length: 12 }, (_, index) => { const angle = (index * Math.PI * 2) / 12; return <group key={index} position={[Math.cos(angle) * 0.54, Math.sin(angle) * 0.54, 0.53]} rotation={[0, 0, angle]}><RoundedBox args={[0.16, 0.36, 0.11]} radius={0.025} smoothness={2}><meshStandardMaterial color="#aab9b8" metalness={0.82} roughness={0.26} /></RoundedBox>{[-0.06, 0, 0.06].map((shift) => <mesh key={shift} position={[shift, -0.02, 0.075]}><torusGeometry args={[0.065, 0.015, 8, 20]} /><meshStandardMaterial color="#cf662c" emissive="#a54418" emissiveIntensity={0.35} metalness={0.68} roughness={0.24} /></mesh>)}</group>; })}
    <group ref={rotorRef} position={[0, 0, 0.59]}>{[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle) => <group key={angle} rotation={[0, 0, angle]}><RoundedBox args={[0.56, 0.16, 0.11]} radius={0.025} smoothness={2} position={[0, 0.32, 0]}><meshStandardMaterial color="#7065bf" emissive="#50469b" emissiveIntensity={0.55} roughness={0.27} metalness={0.42} /></RoundedBox><RoundedBox args={[0.68, 0.09, 0.08]} radius={0.02} smoothness={2} position={[0, 0.47, -0.015]}><meshStandardMaterial color="#c5d0cf" metalness={0.84} roughness={0.22} /></RoundedBox></group>)}<mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.31, 0.31, 0.16, 32]} /><meshStandardMaterial color="#5c7378" metalness={0.86} roughness={0.25} /></mesh></group>
    <mesh position={[0, 0, 0.75]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.13, 0.13, 1.45, 24]} /><meshStandardMaterial color="#e1e8e5" metalness={0.92} roughness={0.16} /></mesh>
  </group>;
}

function DriveUnit({ motionActive }: { motionActive: boolean }) {
  const gearRef = useRef<THREE.Group>(null);
  const powerCurve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.03, 0.56, 0.58),
    new THREE.Vector3(-0.78, 0.56, 0.62),
    new THREE.Vector3(-0.45, 0.42, 0.65),
    new THREE.Vector3(-0.2, 0.32, 0.65),
  ]), []);
  useFrame((_, delta) => {
    if (!motionActive) return;
    if (gearRef.current) gearRef.current.rotation.z -= delta * 1.8;
  });
  return <group position={[0, 0.1, 0]} scale={1.36}>
    <group position={[-1.5, 0.62, 0]}><RoundedBox args={[1.25, 0.52, 1.12]} radius={0.1} smoothness={3}><meshStandardMaterial color="#7d9699" metalness={0.8} roughness={0.25} /><Edges color="#cedbd9" threshold={20} /></RoundedBox>{Array.from({ length: 9 }, (_, index) => <mesh key={index} position={[-0.42 + index * 0.105, 0.31, 0]}><boxGeometry args={[0.045, 0.13, 0.8]} /><meshStandardMaterial color="#c3d0ce" metalness={0.78} roughness={0.27} /></mesh>)}<StageLabel position={[0, 0.82, 0]} tone="cyan">inverter</StageLabel></group>
    <group position={[0, 0.3, 0]}><DriveMotorCore motionActive={motionActive} /><StageLabel position={[0, 0.97, 0.48]} tone="copper">copper-wound motor</StageLabel></group>
    <group ref={gearRef} position={[1.5, 0.3, 0.42]}><GearWheel radius={0.52} teeth={12} /><StageLabel position={[0, 0.75, 0]} tone="neutral">reduction gear</StageLabel></group>
    <mesh position={[0, -0.35, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.06, 0.06, 4.1, 16]} /><meshStandardMaterial color="#e0e7e5" metalness={0.85} roughness={0.18} /></mesh>
    <mesh><tubeGeometry args={[powerCurve, 24, 0.034, 8, false]} /><meshStandardMaterial color="#078b9a" emissive="#25cbd1" emissiveIntensity={0.56} roughness={0.24} /></mesh>
    <EnergyPulse curve={powerCurve} offset={0.1} motionActive={motionActive} /><EnergyPulse curve={powerCurve} offset={0.56} motionActive={motionActive} />
    <StageLabel position={[0, -1.0, 0]} tone="neutral">axle</StageLabel>
  </group>;
}

function StatorTooth({ angle, phase, activePhase, visible }: { angle: number; phase: number; activePhase: number; visible: boolean }) {
  const x = Math.cos(angle) * 1.27;
  const y = Math.sin(angle) * 1.27;
  const active = phase === activePhase;
  return <group position={[x, y, 0]} rotation={[0, 0, angle]} visible={visible}>
    <RoundedBox args={[0.29, 0.78, 0.42]} radius={0.045} smoothness={2} castShadow><meshStandardMaterial color={active ? "#8ba6aa" : "#b2c0bf"} emissive={active ? "#2f8f97" : "#8b9da1"} emissiveIntensity={active ? 0.5 : 0.07} metalness={0.82} roughness={0.27} /><Edges color="#e6edeb" threshold={24} /></RoundedBox>
    <group position={[0, 0, 0.25]}>{[-0.19, -0.095, 0, 0.095, 0.19].map((shift) => <mesh key={shift} position={[0, shift, 0]} scale={[1, 1.52, 1]}><torusGeometry args={[0.15, 0.019, 8, 24]} /><meshStandardMaterial color={active ? "#ec7f36" : "#c86a32"} emissive="#a94419" emissiveIntensity={active ? 0.9 : 0.25} metalness={0.7} roughness={0.23} /></mesh>)}</group>
  </group>;
}

function Stator({ visible, activePhase }: { visible: boolean; activePhase: number }) {
  return <group visible={visible}><mesh><torusGeometry args={[1.45, 0.16, 16, 64]} /><meshStandardMaterial color="#93aaad" metalness={0.7} roughness={0.3} /><Edges color="#e6edeb" threshold={24} /></mesh><mesh position={[0, 0, -0.23]}><torusGeometry args={[1.56, 0.075, 10, 64]} /><meshStandardMaterial color="#d3dddb" metalness={0.78} roughness={0.26} /></mesh>{Array.from({ length: 12 }, (_, index) => <StatorTooth key={index} angle={(Math.PI * 2 * index) / 12} phase={index % 3} activePhase={activePhase} visible={visible} />)}<mesh><torusGeometry args={[1.1, 0.025, 8, 64]} /><meshBasicMaterial color="#83c4c5" transparent opacity={0.34} /></mesh></group>;
}

function Rotor({ heat, protection, visible, showMagnets = true }: { heat: boolean; protection: number; visible: boolean; showMagnets?: boolean }) {
  const margin = 0.16 + protection * 0.23;
  const magnetPairs = [[0, 0.57, 0], [0, -0.57, Math.PI], [0.57, 0, Math.PI / 2], [-0.57, 0, -Math.PI / 2]] as const;
  return <group visible={visible}>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.94, 0.94, 0.48, 40]} /><meshStandardMaterial color="#7f959b" metalness={0.8} roughness={0.3} /><Edges color="#e0e8e5" threshold={20} /></mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.27]}><cylinderGeometry args={[0.34, 0.34, 0.66, 32]} /><meshStandardMaterial color="#d2dcda" metalness={0.86} roughness={0.22} /></mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 3.6, 20]} /><meshStandardMaterial color="#e4eae8" metalness={0.92} roughness={0.16} /></mesh>
    {magnetPairs.map(([x, y, rotation], index) => <group key={index} position={[x, y, 0.34]} rotation={[0, 0, rotation]} visible={showMagnets}><RoundedBox args={[0.46, 0.18, 0.12]} radius={0.04} smoothness={2}><meshStandardMaterial color="#778592" metalness={0.75} roughness={0.34} /></RoundedBox><RoundedBox args={[0.34, 0.1, 0.13]} radius={0.03} smoothness={2} position={[0, 0, 0.05]}><meshStandardMaterial color="#756bd0" emissive="#554da2" emissiveIntensity={0.42} roughness={0.28} metalness={0.5} /></RoundedBox></group>)}
    {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle) => <mesh key={angle} position={[Math.cos(angle) * 0.79, Math.sin(angle) * 0.79, 0.32]} rotation={[0, 0, angle]}><boxGeometry args={[0.12, 0.34, 0.16]} /><meshStandardMaterial color="#c6d2cf" metalness={0.84} roughness={0.23} /></mesh>)}
    <mesh><torusGeometry args={[0.94 + margin, 0.035, 8, 48]} /><meshStandardMaterial color="#d59f29" transparent opacity={0.45 + protection * 0.35} emissive="#a87314" emissiveIntensity={0.25} /></mesh>
    {heat && <mesh position={[0, 0, 0.55]} renderOrder={3}><torusGeometry args={[1.18, 0.13, 12, 48]} /><meshBasicMaterial color="#e57643" transparent opacity={0.56 + (1 - protection) * 0.18} depthTest={false} /></mesh>}
  </group>;
}

function FieldArrows({ visible, groupRef }: { visible: boolean; groupRef: React.RefObject<THREE.Group | null> }) {
  return <group ref={groupRef} visible={visible}>
    <mesh><torusGeometry args={[1.7, 0.026, 8, 64]} /><meshBasicMaterial color="#1aa6b4" transparent opacity={0.38} /></mesh>
    <group position={[0, 1.7, 0.34]} rotation={[0, 0, Math.PI / 2]}><mesh position={[0, 0.33, 0]}><boxGeometry args={[0.065, 0.66, 0.065]} /><meshBasicMaterial color="#078b9a" transparent opacity={0.95} /></mesh><mesh position={[0, 0.72, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.16, 0.3, 3]} /><meshBasicMaterial color="#078b9a" /></mesh></group>
  </group>;
}

function PhaseCurrent({ phase, motionActive, selectedPhase }: { phase: number; motionActive: boolean; selectedPhase: number }) {
  const markerRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    const amplitude = motionActive ? (Math.sin(clock.elapsedTime * 2.2 + phase * (Math.PI * 2 / 3)) + 1) / 2 : phase === selectedPhase ? 0.92 : 0.16;
    if (markerRef.current) markerRef.current.scale.setScalar(0.78 + amplitude * 0.28);
    if (materialRef.current) materialRef.current.emissiveIntensity = 0.12 + amplitude * 1.15;
  });
  const angle = phase * (Math.PI * 2 / 3) + Math.PI / 6;
  const color = ["#d65d22", "#078b9a", "#6355b4"][phase];
  return <group ref={markerRef} position={[Math.cos(angle) * 1.68, Math.sin(angle) * 1.68, 0.52]}><mesh><sphereGeometry args={[0.1, 18, 18]} /><meshStandardMaterial ref={materialRef} color={color} emissive={color} emissiveIntensity={0.35} roughness={0.28} /></mesh></group>;
}

function VectorArrow({ angle, length, color, opacity = 1, position = [0, 0, 1.15] as [number, number, number] }: { angle: number; length: number; color: string; opacity?: number; position?: [number, number, number] }) {
  return <group position={position} rotation={[0, 0, angle]}><mesh position={[0, length / 2, 0]}><boxGeometry args={[0.045, length, 0.045]} /><meshBasicMaterial color={color} transparent opacity={opacity} depthTest={false} /></mesh><mesh position={[0, length, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.13, 0.26, 3]} /><meshBasicMaterial color={color} transparent opacity={opacity} depthTest={false} /></mesh></group>;
}

function TorqueVectors({ motionActive, reducedMotion, load, showMagnetPull, showSteelPull }: { motionActive: boolean; reducedMotion: boolean; load: number; showMagnetPull: boolean; showSteelPull: boolean }) {
  const vectorRef = useRef<THREE.Group>(null);
  const angle = useRef(0);
  useFrame((_, delta) => {
    if (motionActive && !reducedMotion) angle.current += delta * 0.62;
    if (vectorRef.current) vectorRef.current.rotation.z = angle.current;
  });
  const torqueGap = 0.18 + load * 0.6;
  return <group ref={vectorRef}>
    <VectorArrow angle={Math.PI / 2} length={1.15} color="#078b9a" opacity={0.95} />
    <VectorArrow angle={Math.PI / 2 - torqueGap} length={0.92} color="#6355b4" opacity={showMagnetPull ? 0.96 : 0.12} />
    <VectorArrow angle={0} length={0.82} color="#b87600" opacity={showSteelPull ? 0.9 : 0.08} position={[0, 0, 1.2]} />
  </group>;
}

function DamagePatch({ motionActive, reducedMotion }: { motionActive: boolean; reducedMotion: boolean }) {
  const patchRef = useRef<THREE.Group>(null);
  const progress = useRef(reducedMotion ? 1 : 0.15);
  useFrame((_, delta) => {
    if (motionActive && !reducedMotion) progress.current = Math.min(1, progress.current + delta * 1.65);
    if (patchRef.current) {
      const scale = 0.25 + progress.current * 0.75;
      patchRef.current.scale.setScalar(scale);
    }
  });
  return <group ref={patchRef} position={[0.52, 0.16, 0.97]} renderOrder={6}><mesh><sphereGeometry args={[0.14, 16, 16]} /><meshBasicMaterial color="#c13e4c" transparent opacity={0.92} depthTest={false} /></mesh><mesh position={[0.1, 0.05, 0]}><sphereGeometry args={[0.06, 12, 12]} /><meshBasicMaterial color="#f38d85" depthTest={false} /></mesh></group>;
}

function MotorModel({ step, paused, reducedMotion, protection, isolate, pullMode, heat, opposingField, load, phaseIndex, damageLatched }: { step: LessonStep; paused: boolean; reducedMotion: boolean; protection: number; isolate: IsolateMode; pullMode: PullMode; heat: number; opposingField: number; load: number; phaseIndex: number; damageLatched: boolean }) {
  const fieldRef = useRef<THREE.Group>(null);
  const rotorRef = useRef<THREE.Group>(null);
  const fieldAngle = useRef(0);
  const phase = step === "field" ? phaseIndex : 0;
  const motorStep = step === "anatomy" || step === "field" || step === "torque" || step === "heat";
  useFrame((_, delta) => {
    const shouldMove = !paused && !reducedMotion;
    if (shouldMove && (step === "field" || step === "torque" || step === "anatomy")) fieldAngle.current += delta * (step === "anatomy" ? 0.75 : 0.62);
    if (fieldRef.current) fieldRef.current.rotation.z = fieldAngle.current;
    if (rotorRef.current) rotorRef.current.rotation.z = step === "field" || step === "torque" || step === "anatomy" ? fieldAngle.current - (step === "torque" ? 0.18 + load * 0.22 : 0) : 0;
  });
  const statorVisible = isolate !== "rotor";
  const rotorVisible = isolate !== "stator";
  const showMagnetPull = pullMode === "magnet" || pullMode === "both";
  const showSteelPull = pullMode === "steel" || pullMode === "both";
  return <group visible={motorStep} scale={1.18} position={[0, 0.1, 0]} rotation={[-0.28, 0.48, 0]}>
    <Stator visible={statorVisible} activePhase={phase} />
    <group ref={rotorRef}><Rotor heat={step === "heat" && heat > 0.2} protection={protection} visible={rotorVisible} showMagnets={step !== "torque" || showMagnetPull} /></group>
    <FieldArrows visible={step === "field"} groupRef={fieldRef} />
    {step === "field" && <><PhaseCurrent phase={0} motionActive={!paused && !reducedMotion} selectedPhase={phaseIndex} /><PhaseCurrent phase={1} motionActive={!paused && !reducedMotion} selectedPhase={phaseIndex} /><PhaseCurrent phase={2} motionActive={!paused && !reducedMotion} selectedPhase={phaseIndex} /></>}
    {step === "anatomy" && <><StageLabel position={[-1.7, 1.56, 0.3]} tone="copper">fixed copper stator</StageLabel><StageLabel position={[1.5, -1.5, 0.4]} tone="violet">spinning magnet rotor</StageLabel></>}
    {step === "field" && <><StageLabel position={[-1.5, 1.67, 0.3]} tone="copper">three coil phases</StageLabel><StageLabel position={[1.57, -1.5, 0.36]} tone="cyan">moving field</StageLabel></>}
    {step === "torque" && <><TorqueVectors motionActive={!paused} reducedMotion={reducedMotion} load={load} showMagnetPull={showMagnetPull} showSteelPull={showSteelPull} /><StageLabel position={[-1.7, 1.58, 0.4]} tone="cyan">field leads</StageLabel><StageLabel position={[1.55, 1.38, 0.4]} tone="violet">rotor follows</StageLabel></>}
    {step === "heat" && <><VectorArrow angle={-Math.PI / 3} length={1.14} color="#c13e4c" opacity={0.5 + opposingField * 0.5} position={[1.7, 0, 1.12]} /><StageLabel position={[-1.45, 1.7, 0.35]} tone="amber">heat shrinks margin</StageLabel>{damageLatched && <StageLabel position={[1.52, -1.45, 0.48]} tone="rose">reversed patch</StageLabel>}</>}
    {step === "heat" && heat > 0.2 && <mesh position={[0, 0, 0.9]} renderOrder={5}><torusGeometry args={[1.06, 0.11, 12, 48]} /><meshBasicMaterial color="#e57643" transparent opacity={0.42 + heat * 0.32} depthTest={false} /></mesh>}
    {step === "heat" && damageLatched && <DamagePatch motionActive={!paused} reducedMotion={reducedMotion} />}
  </group>;
}

function MagnetGrainModel({ protection, motionActive, reducedMotion }: { protection: number; motionActive: boolean; reducedMotion: boolean }) {
  const seedRef = useRef<THREE.Group>(null);
  const testing = useRef(0);
  const targetX = protection > 0.54 ? -0.55 : 0.28;
  useFrame((_, delta) => {
    if (motionActive && !reducedMotion) testing.current = (testing.current + delta * 0.27) % 1;
    const eased = 1 - Math.pow(1 - testing.current, 3);
    if (seedRef.current) {
      seedRef.current.position.x = -1.36 + (targetX + 1.36) * eased;
      seedRef.current.scale.setScalar(0.72 + eased * 0.4);
    }
  });
  const shellScale = 0.82 + protection * 0.1;
  return <group scale={1.42} position={[0, -0.05, 0]} rotation={[-0.16, 0.26, 0]}>
    <mesh position={[0, 0, -0.18]}><dodecahedronGeometry args={[1.33, 1]} /><meshPhysicalMaterial color="#799196" transparent opacity={0.18} metalness={0.7} roughness={0.28} depthWrite={false} /><Edges color="#82989b" threshold={15} /></mesh>
    <mesh position={[0, 0, 0.52]} scale={[shellScale, shellScale, 0.34]}><dodecahedronGeometry args={[1.21, 1]} /><meshStandardMaterial color="#bd7d16" emissive="#9e6207" emissiveIntensity={0.28 + protection * 0.42} metalness={0.55} roughness={0.27} /></mesh>
    <mesh position={[0, 0, 0.72]} scale={[0.76, 0.76, 0.28]}><dodecahedronGeometry args={[1.18, 1]} /><meshStandardMaterial color="#6256aa" emissive="#4e4394" emissiveIntensity={0.36} metalness={0.42} roughness={0.3} /><Edges color="#9189d1" threshold={15} /></mesh>
    {Array.from({ length: 5 }, (_, index) => <mesh key={index} position={[-0.38 + index * 0.19, 0.03, 1.05]}><boxGeometry args={[0.11, 0.54, 0.025]} /><meshBasicMaterial color="#a19ada" transparent opacity={0.48} /></mesh>)}
    <VectorArrow angle={Math.PI / 2} length={0.9} color="#078b9a" position={[0, 0, 1.14]} />
    <group ref={seedRef} position={[-1.36, 0.15, 1.16]}><mesh><sphereGeometry args={[0.11, 16, 16]} /><meshStandardMaterial color="#c13e4c" emissive="#f26762" emissiveIntensity={0.75} roughness={0.24} /></mesh><mesh position={[-0.14, 0, 0]} rotation={[0, 0, Math.PI / 2]}><coneGeometry args={[0.09, 0.22, 3]} /><meshBasicMaterial color="#c13e4c" /></mesh></group>
    <StageLabel position={[-1.3, 1.24, 0.52]} tone="amber">edge shell</StageLabel><StageLabel position={[1.22, -1.25, 0.52]} tone="violet">magnet core</StageLabel>
  </group>;
}

function CameraRig({ command, step }: { command: { id: number; action: "in" | "out" | "reset" }; step: LessonStep }) {
  const { camera } = useThree();
  useEffect(() => {
    const focus = new THREE.Vector3(0, step === "location" ? 0.7 : 0.1, 0);
    if (command.action === "reset" || command.id === 0) {
      camera.position.set(4.25, step === "location" ? 2.55 : 2.2, step === "location" ? 6.55 : 5.7);
    } else {
      const factor = command.action === "in" ? 0.82 : 1.2;
      camera.position.sub(focus).multiplyScalar(factor).add(focus);
    }
    camera.lookAt(focus);
    camera.updateProjectionMatrix();
  }, [camera, command, step]);
  return null;
}

function Scene({ step, paused, reducedMotion, protection, isolate, pullMode, heat, opposingField, load, phaseIndex, damageLatched, cameraCommand }: { step: LessonStep; paused: boolean; reducedMotion: boolean; protection: number; isolate: IsolateMode; pullMode: PullMode; heat: number; opposingField: number; load: number; phaseIndex: number; damageLatched: boolean; cameraCommand: { id: number; action: "in" | "out" | "reset" } }) {
  const motionActive = !paused && !reducedMotion;
  return <><CameraRig command={cameraCommand} step={step} /><ambientLight intensity={2.25} color="#fffdf8" /><directionalLight position={[4, 5, 6]} intensity={3.7} color="#ffffff" castShadow shadow-mapSize={[1024, 1024]} /><pointLight position={[-4, 1, 3]} intensity={1.25} color="#67cbd0" /><pointLight position={[3, -2, 2]} intensity={0.68} color="#e5a252" />{step === "location" && <CarModel motionActive={motionActive} />}{step === "unit" && <DriveUnit motionActive={motionActive} />}{step !== "location" && step !== "unit" && step !== "protection" && <MotorModel step={step} paused={paused} reducedMotion={reducedMotion} protection={protection} isolate={isolate} pullMode={pullMode} heat={heat} opposingField={opposingField} load={load} phaseIndex={phaseIndex} damageLatched={damageLatched} />}{step === "protection" && <MagnetGrainModel protection={protection} motionActive={motionActive} reducedMotion={reducedMotion} />}<ContactShadows position={[0, -2.05, 0]} opacity={0.24} scale={9} blur={2.5} far={4} /></>;
}

function StaticFallback({ step }: { step: LessonStep }) {
  return <div className="static-fallback" role="img" aria-label={`${STEPS.find((item) => item.id === step)?.title ?? "Motor lesson"} visual fallback`}><div className={`fallback-object fallback-object--${step}`}><span className="fallback-core" /><span className="fallback-ring" /><span className="fallback-accent" /></div><p>Interactive 3D is unavailable here. The lesson controls still work.</p></div>;
}

function QualitativeRange({ id, label, value, onChange, tone, low, high, hint }: { id: string; label: string; value: number; onChange: (value: number) => void; tone: "cyan" | "amber" | "rose"; low: string; high: string; hint: string }) {
  const ariaValue = value < 0.34 ? low : value > 0.66 ? high : "some";
  const update = (event: React.FormEvent<HTMLInputElement>) => onChange(Number(event.currentTarget.value));
  return <div className={`lesson-control lesson-control--${tone}`}><label htmlFor={id}>{label}</label><input id={id} type="range" min="0" max="1" step="0.01" value={value} onChange={update} onInput={update} aria-valuetext={ariaValue} /><div className="range-ends"><span>{low}</span><span>{high}</span></div><p className="control-hint">{hint}</p></div>;
}

export default function App() {
  const [stepIndex, setStepIndex] = useState(0);
  const [motionPlaying, setMotionPlaying] = useState(true);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [protection, setProtection] = useState(0.55);
  const [isolate, setIsolate] = useState<IsolateMode>("both");
  const [pullMode, setPullMode] = useState<PullMode>("both");
  const [load, setLoad] = useState(0.4);
  const [heat, setHeat] = useState(0.48);
  const [opposingField, setOpposingField] = useState(0.35);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [damageLatched, setDamageLatched] = useState(false);
  const [cameraCommand, setCameraCommand] = useState<{ id: number; action: "in" | "out" | "reset" }>({ id: 0, action: "reset" });
  const step = STEPS[stepIndex];

  useEffect(() => { document.title = "How an EV motor works"; const media = window.matchMedia("(prefers-reduced-motion: reduce)"); const update = () => setReducedMotion(media.matches); update(); media.addEventListener("change", update); return () => media.removeEventListener("change", update); }, []);
  useEffect(() => { if (step.id !== "anatomy") setIsolate("both"); if (step.id !== "torque") setPullMode("both"); if (step.id !== "heat") setDamageLatched(false); setCameraCommand((current) => ({ id: current.id + 1, action: "reset" })); }, [step.id]);
  useEffect(() => { if (heat > 0.65 && opposingField > 0.65) setDamageLatched(true); }, [heat, opposingField]);
  useEffect(() => { const onKeyDown = (event: KeyboardEvent) => { if (event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement) return; if (event.key === "ArrowRight" || event.key === "PageDown") { event.preventDefault(); setStepIndex((current) => clamp(current + 1, 0, STEPS.length - 1)); } else if (event.key === "ArrowLeft" || event.key === "PageUp") { event.preventDefault(); setStepIndex((current) => clamp(current - 1, 0, STEPS.length - 1)); } else if (event.key === " ") { event.preventDefault(); setMotionPlaying((playing) => !playing); } }; window.addEventListener("keydown", onKeyDown); return () => window.removeEventListener("keydown", onKeyDown); }, []);

  const status = reducedMotion ? "Motion is reduced by your system preference. The model holds its explanatory pose." : !motionPlaying ? "Motion is paused. Zoom or drag to inspect this exact moment." : step.id === "location" ? "Energy pulses from the battery to the rear e-axle. The wheel follows." : step.id === "unit" ? "Watch power pass from inverter to motor to reduction gear." : step.id === "field" ? "The copper stays still. Its combined field travels around the stator." : step.id === "torque" ? pullMode === "magnet" ? "Showing the magnet's pull." : pullMode === "steel" ? "Showing the steel's easy direction." : "Both pulls travel together around one shaft." : step.id === "heat" ? damageLatched ? "A reversed patch remains even after the stress is eased." : "No permanent patch yet. Heat and opposing field must combine." : step.id === "protection" ? protection > 0.54 ? "The test seed meets the protective edge shell and stops." : "The test seed can travel into the softer core." : step.answer;

  return <div className="core-app">
    <a className="skip-link" href="#lesson-stage">Skip to lesson</a>
    <header className="topbar"><div className="brand-lockup"><span className="brand-mark" aria-hidden="true"><span /></span><div><p className="eyebrow">A visual primer</p><p className="brand-name">How an EV motor works</p></div></div><p className="topbar-note">Seven small ideas · one machine</p></header>
    <main className="lesson-layout">
      <section id="lesson-stage" className="lesson-stage" aria-labelledby="stage-heading">
        <div className="stage-heading-row"><div><p className="stage-kicker">{step.kicker}</p><h1 id="stage-heading">{step.title}</h1></div><span className="step-count">{String(stepIndex + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}</span></div>
        <div className="canvas-wrap">
          <Canvas shadows dpr={[1, 1.5]} camera={{ position: [4.4, 2.8, 7.4], fov: 38 }} fallback={<StaticFallback step={step.id} />}>
            <Suspense fallback={null}>
              <Scene step={step.id} paused={!motionPlaying} reducedMotion={reducedMotion} protection={protection} isolate={isolate} pullMode={pullMode} heat={heat} opposingField={opposingField} load={load} phaseIndex={phaseIndex} damageLatched={damageLatched} cameraCommand={cameraCommand} />
              <OrbitControls enablePan={false} enableZoom minDistance={3.4} maxDistance={12} zoomSpeed={0.72} minPolarAngle={Math.PI / 2.75} maxPolarAngle={Math.PI / 2.15} rotateSpeed={0.42} enableDamping dampingFactor={0.08} />
            </Suspense>
          </Canvas>
          <div className="canvas-toolbar" role="group" aria-label="Model view and motion">
            <button type="button" className="canvas-tool canvas-tool--play" aria-pressed={motionPlaying} onClick={() => setMotionPlaying((playing) => !playing)} disabled={reducedMotion}>{motionPlaying ? <Pause size={16} weight="fill" aria-hidden="true" /> : <Play size={16} weight="fill" aria-hidden="true" />}{motionPlaying ? "Pause motion" : "Play motion"}</button>
            <button type="button" className="canvas-tool" aria-label="Zoom in" onClick={() => setCameraCommand((current) => ({ id: current.id + 1, action: "in" }))}><MagnifyingGlassPlus size={17} weight="bold" aria-hidden="true" /></button>
            <button type="button" className="canvas-tool" aria-label="Zoom out" onClick={() => setCameraCommand((current) => ({ id: current.id + 1, action: "out" }))}><MagnifyingGlassMinus size={17} weight="bold" aria-hidden="true" /></button>
            <button type="button" className="canvas-tool" aria-label="Reset model view" onClick={() => setCameraCommand((current) => ({ id: current.id + 1, action: "reset" }))}><ArrowClockwise size={17} weight="bold" aria-hidden="true" /></button>
          </div>
          <div className="canvas-hint">Drag to orbit. Scroll or pinch to zoom.</div>
        </div>
        <div className="stage-status" aria-live="polite"><span className="status-dot" aria-hidden="true" />{status}</div>
      </section>
      <aside className="lesson-panel" aria-label="Lesson explanation"><nav className="step-nav" aria-label="Lesson steps">{STEPS.map((item, index) => <button key={item.id} type="button" className={`step-button ${index === stepIndex ? "is-active" : ""}`} onClick={() => setStepIndex(index)} aria-current={index === stepIndex ? "step" : undefined}><span className="step-number">{String(index + 1).padStart(2, "0")}</span><span>{item.title}</span></button>)}</nav><div className="lesson-copy"><p className="copy-question">{step.question}</p><p className="copy-answer">{step.answer}</p><p className="copy-detail">{step.detail}</p></div>
        {step.id === "anatomy" && <div className="lesson-control"><p className="control-label">Isolate a part</p><div className="segmented-control" role="group" aria-label="Isolate motor part">{(["both", "stator", "rotor"] as const).map((mode) => <button key={mode} type="button" aria-pressed={isolate === mode} className={isolate === mode ? "is-selected" : ""} onClick={() => setIsolate(mode)}>{mode}</button>)}</div><p className="control-hint">The geometry stays in place; only the selected part fades back.</p></div>}
        {step.id === "field" && <div className="lesson-control"><div className="phase-key" aria-label="Choose a coil group">{(["A", "B", "C"] as const).map((name, index) => <button key={name} type="button" className={`phase-key__item ${phaseIndex === index ? "is-active" : ""}`} aria-pressed={phaseIndex === index} onClick={() => { setPhaseIndex(index); setMotionPlaying(true); }}><span className={`phase-dot phase-dot--${name.toLowerCase()}`} />{name}</button>)}</div><p className="control-hint">The stage control plays or pauses every moving physical cue.</p></div>}
        {step.id === "torque" && <><div className="lesson-control"><p className="control-label">Show the pull</p><div className="segmented-control segmented-control--three" role="group" aria-label="Show torque effect">{(["magnet", "steel", "both"] as const).map((mode) => <button key={mode} type="button" aria-pressed={pullMode === mode} className={pullMode === mode ? "is-selected" : ""} onClick={() => setPullMode(mode)}>{mode === "magnet" ? "Magnet" : mode === "steel" ? "Steel" : "Together"}</button>)}</div></div><QualitativeRange id="shaft-load" label="Shaft load" value={load} onChange={setLoad} tone="cyan" low="light" high="heavy" hint="A heavier load opens the angle while both parts stay in step." /></>}
        {step.id === "heat" && <><QualitativeRange id="magnet-heat" label="Magnet heat" value={heat} onChange={setHeat} tone="rose" low="cool" high="hot" hint="Heat lowers the magnet's resistance to reversal." /><QualitativeRange id="opposing-field" label="Opposing stator field" value={opposingField} onChange={setOpposingField} tone="rose" low="gentle" high="hard" hint="A permanent patch appears only when both stresses are high." /></>}
        {step.id === "protection" && <QualitativeRange id="dy-tb-protection" label="Dy/Tb protection" value={protection} onChange={setProtection} tone="amber" low="less protection" high="more protection" hint="The amber shell protects the edge; it is not a coolant." />}
        <div className="panel-footer"><button type="button" className="nav-button nav-button--back" onClick={() => setStepIndex((current) => clamp(current - 1, 0, STEPS.length - 1))} disabled={stepIndex === 0}><ArrowLeft size={17} aria-hidden="true" />Back</button><button type="button" className="nav-button nav-button--next" onClick={() => setStepIndex((current) => clamp(current + 1, 0, STEPS.length - 1))} disabled={stepIndex === STEPS.length - 1}>Next<ArrowRight size={17} aria-hidden="true" /></button></div><p className="panel-footnote">This first pass stays with the machine itself. Alternative motor families come after the basic picture clicks.</p></aside>
    </main>
  </div>;
}
