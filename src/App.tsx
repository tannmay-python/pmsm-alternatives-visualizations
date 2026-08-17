import { Canvas, useFrame } from "@react-three/fiber";
import { Edges, Html, OrbitControls, RoundedBox } from "@react-three/drei";
import { ArrowLeft, ArrowRight, Pause, Play } from "@phosphor-icons/react";
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

function VehicleWheel({ position }: { position: [number, number, number] }) {
  return <group position={position}>
    <mesh castShadow receiveShadow><torusGeometry args={[0.47, 0.135, 12, 36]} /><meshStandardMaterial color="#1e2b30" roughness={0.58} metalness={0.22} /></mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.035]}><cylinderGeometry args={[0.29, 0.29, 0.13, 24]} /><meshStandardMaterial color="#a9b9ba" roughness={0.25} metalness={0.9} /></mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.11]}><cylinderGeometry args={[0.09, 0.09, 0.15, 20]} /><meshStandardMaterial color="#4e666b" roughness={0.3} metalness={0.82} /></mesh>
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

function BatteryPack() {
  return <group position={[-0.38, 0.68, 0]}>
    <RoundedBox args={[3.52, 0.27, 1.02]} radius={0.07} smoothness={2}><meshStandardMaterial color="#147f91" emissive="#4eb7c2" emissiveIntensity={0.26} metalness={0.42} roughness={0.32} /><Edges color="#b7eceb" threshold={20} /></RoundedBox>
    {Array.from({ length: 7 }, (_, index) => <RoundedBox key={index} args={[0.35, 0.11, 0.8]} radius={0.025} smoothness={2} position={[-1.35 + index * 0.45, 0.12, 0]}><meshStandardMaterial color="#77c6cd" emissive="#78d6d9" emissiveIntensity={0.14} roughness={0.38} /></RoundedBox>)}
  </group>;
}

function EAxleModel() {
  return <group position={[1.95, 0.72, 0]}>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[-0.15, 0, 0]}><cylinderGeometry args={[0.42, 0.42, 0.72, 32]} /><meshStandardMaterial color="#c96c31" emissive="#9a461d" emissiveIntensity={0.23} metalness={0.72} roughness={0.27} /><Edges color="#f0c49c" threshold={18} /></mesh>
    <RoundedBox args={[0.54, 0.36, 0.84]} radius={0.07} smoothness={2} position={[-0.64, 0.14, 0]}><meshStandardMaterial color="#8aa5a7" metalness={0.62} roughness={0.28} /><Edges color="#d4e0df" threshold={20} /></RoundedBox>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0.34, 0, 0]}><cylinderGeometry args={[0.3, 0.3, 0.84, 28]} /><meshStandardMaterial color="#b5c5c4" metalness={0.83} roughness={0.23} /></mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0.1, -0.15, 0]}><cylinderGeometry args={[0.06, 0.06, 1.8, 16]} /><meshStandardMaterial color="#d9e5e2" metalness={0.86} roughness={0.2} /></mesh>
  </group>;
}

function EnergyPath() {
  const cableCurve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.45, 0.85, 0.62),
    new THREE.Vector3(0.95, 0.93, 0.62),
    new THREE.Vector3(1.45, 0.84, 0.62),
    new THREE.Vector3(1.78, 0.82, 0.62),
  ]), []);
  return <group>
    <mesh><tubeGeometry args={[cableCurve, 28, 0.035, 8, false]} /><meshStandardMaterial color="#19a3b0" emissive="#64d2d8" emissiveIntensity={0.75} roughness={0.25} /></mesh>
    <mesh position={[1.66, 0.82, 0.62]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.08, 0.16, 3]} /><meshBasicMaterial color="#19a3b0" /></mesh>
  </group>;
}

function CarModel() {
  return <group scale={1.22} position={[0, -0.05, 0]} rotation={[0, 0.54, 0]}>
    <VehicleShell />
    <RoundedBox args={[2.12, 0.55, 0.05]} radius={0.06} smoothness={2} position={[-0.04, 1.72, 0.7]}><meshStandardMaterial color="#52757a" transparent opacity={0.4} roughness={0.16} metalness={0.42} /></RoundedBox>
    <mesh position={[0.12, 1.72, 0.74]}><boxGeometry args={[0.05, 0.62, 0.045]} /><meshStandardMaterial color="#6f8a8d" metalness={0.52} roughness={0.33} /></mesh>
    <BatteryPack />
    <EAxleModel />
    <EnergyPath />
    <VehicleWheel position={[-2.02, 0.55, 0.76]} /><VehicleWheel position={[2.04, 0.55, 0.76]} />
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

function DriveUnit() {
  return <group position={[0, 0.1, 0]} scale={1.1}>
    <group position={[-1.5, 0.62, 0]}><RoundedBox args={[1.2, 0.46, 1.1]} radius={0.12} smoothness={3}><meshStandardMaterial color="#98acad" metalness={0.75} roughness={0.25} /></RoundedBox><mesh position={[0, 0.28, 0]}><boxGeometry args={[0.82, 0.08, 0.76]} /><meshStandardMaterial color="#d07939" emissive="#9a461d" emissiveIntensity={0.38} metalness={0.55} roughness={0.35} /></mesh><StageLabel position={[0, 0.73, 0]} tone="copper">inverter</StageLabel></group>
    <group position={[0, 0.3, 0]}><RoundedBox args={[1.5, 0.72, 1.34]} radius={0.18} smoothness={3}><meshStandardMaterial color="#c4d0d0" metalness={0.65} roughness={0.27} /></RoundedBox><mesh position={[0, 0, 0.72]}><torusGeometry args={[0.48, 0.12, 12, 32]} /><meshStandardMaterial color="#d97835" emissive="#98451d" emissiveIntensity={0.28} metalness={0.7} roughness={0.3} /></mesh><StageLabel position={[0, 0.82, 0]} tone="violet">motor</StageLabel></group>
    <group position={[1.5, 0.3, 0]}><GearWheel radius={0.52} teeth={12} /><StageLabel position={[0, 0.72, 0]} tone="neutral">gearset</StageLabel></group>
    <mesh position={[0, -0.35, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.06, 0.06, 4.1, 16]} /><meshStandardMaterial color="#e0e7e5" metalness={0.85} roughness={0.18} /></mesh>
    <StageLabel position={[0, -1.0, 0]} tone="neutral">axle</StageLabel>
  </group>;
}

function StatorTooth({ angle, phase, activePhase, visible }: { angle: number; phase: number; activePhase: number; visible: boolean }) {
  const x = Math.cos(angle) * 1.27;
  const y = Math.sin(angle) * 1.27;
  const active = phase === activePhase;
  return <group position={[x, y, 0]} rotation={[0, 0, angle]} visible={visible}>
    <RoundedBox args={[0.31, 0.76, 0.42]} radius={0.06} smoothness={2} castShadow><meshStandardMaterial color={active ? "#91a9aa" : "#aebdbd"} emissive={active ? "#4e9da1" : "#93a5aa"} emissiveIntensity={active ? 0.55 : 0.12} metalness={0.8} roughness={0.3} /><Edges color="#e0e8e5" threshold={24} /></RoundedBox>
    <group position={[0, 0, 0.23]}><RoundedBox args={[0.42, 0.13, 0.15]} radius={0.04} smoothness={2}><meshStandardMaterial color={active ? "#e8833f" : "#d79a72"} emissive="#9f4b20" emissiveIntensity={active ? 0.72 : 0.12} metalness={0.62} roughness={0.3} /></RoundedBox><RoundedBox args={[0.13, 0.63, 0.15]} radius={0.04} smoothness={2} position={[-0.14, -0.22, 0]}><meshStandardMaterial color={active ? "#e8833f" : "#d79a72"} emissive="#9f4b20" emissiveIntensity={active ? 0.62 : 0.12} metalness={0.62} roughness={0.3} /></RoundedBox><RoundedBox args={[0.13, 0.63, 0.15]} radius={0.04} smoothness={2} position={[0.14, -0.22, 0]}><meshStandardMaterial color={active ? "#e8833f" : "#d79a72"} emissive="#9f4b20" emissiveIntensity={active ? 0.62 : 0.12} metalness={0.62} roughness={0.3} /></RoundedBox></group>
  </group>;
}

function Stator({ visible, activePhase }: { visible: boolean; activePhase: number }) {
  return <group visible={visible}><mesh><torusGeometry args={[1.42, 0.14, 16, 64]} /><meshStandardMaterial color="#a6b8b8" metalness={0.58} roughness={0.4} /><Edges color="#e0e8e5" threshold={24} /></mesh>{Array.from({ length: 12 }, (_, index) => <StatorTooth key={index} angle={(Math.PI * 2 * index) / 12} phase={index % 3} activePhase={activePhase} visible={visible} />)}<mesh><torusGeometry args={[1.1, 0.025, 8, 64]} /><meshBasicMaterial color="#83c4c5" transparent opacity={0.34} /></mesh></group>;
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
    {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((phase) => <group key={phase} position={[Math.cos(phase) * 1.78, Math.sin(phase) * 1.78, 0.18]} rotation={[0, 0, phase + Math.PI / 2]}><mesh position={[0, 0.34, 0]}><boxGeometry args={[0.045, 0.58, 0.045]} /><meshBasicMaterial color="#1a96a5" transparent opacity={0.9} /></mesh><mesh position={[0, 0.68, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.12, 0.23, 3]} /><meshBasicMaterial color="#1a96a5" transparent opacity={0.98} /></mesh></group>)}
    <mesh><torusGeometry args={[1.75, 0.032, 8, 64]} /><meshBasicMaterial color="#23a4ac" transparent opacity={0.42} /></mesh>
  </group>;
}

function VectorArrow({ angle, length, color, opacity = 1, position = [0, 0, 1.15] as [number, number, number] }: { angle: number; length: number; color: string; opacity?: number; position?: [number, number, number] }) {
  return <group position={position} rotation={[0, 0, angle]}><mesh position={[0, length / 2, 0]}><boxGeometry args={[0.045, length, 0.045]} /><meshBasicMaterial color={color} transparent opacity={opacity} depthTest={false} /></mesh><mesh position={[0, length, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.13, 0.26, 3]} /><meshBasicMaterial color={color} transparent opacity={opacity} depthTest={false} /></mesh></group>;
}

function MotorModel({ step, paused, reducedMotion, protection, isolate, pullMode, heat, opposingField, load, phaseIndex }: { step: LessonStep; paused: boolean; reducedMotion: boolean; protection: number; isolate: IsolateMode; pullMode: PullMode; heat: number; opposingField: number; load: number; phaseIndex: number }) {
  const fieldRef = useRef<THREE.Group>(null);
  const rotorRef = useRef<THREE.Group>(null);
  const fieldAngle = useRef(0);
  const phase = step === "field" ? phaseIndex : 0;
  const motorStep = step === "anatomy" || step === "field" || step === "torque" || step === "heat";
  useFrame((_, delta) => {
    if (step === "field" && !paused && !reducedMotion) fieldAngle.current += delta * 0.72;
    if (fieldRef.current) fieldRef.current.rotation.z = fieldAngle.current;
    if (rotorRef.current) rotorRef.current.rotation.z = step === "field" ? fieldAngle.current * 0.96 : 0;
  });
  const statorVisible = isolate !== "rotor";
  const rotorVisible = isolate !== "stator";
  const torqueGap = 0.18 + load * 0.6;
  const showMagnetPull = pullMode === "magnet" || pullMode === "both";
  const showSteelPull = pullMode === "steel" || pullMode === "both";
  return <group visible={motorStep} scale={1.18} position={[0, 0.1, 0]} rotation={[-0.28, 0.48, 0]}>
    <Stator visible={statorVisible} activePhase={phase} />
    <group ref={rotorRef}><Rotor heat={step === "heat" && heat > 0.2} protection={protection} visible={rotorVisible} showMagnets={step !== "torque" || showMagnetPull} /></group>
    <FieldArrows visible={step === "field"} groupRef={fieldRef} />
    {step === "anatomy" && <><StageLabel position={[-1.68, 1.52, 0.3]} tone="copper">stator: copper coils</StageLabel><StageLabel position={[1.45, -1.5, 0.4]} tone="violet">rotor: buried magnets</StageLabel></>}
    {step === "field" && <><StageLabel position={[-1.54, 1.66, 0.3]} tone="copper">three coil groups</StageLabel><StageLabel position={[1.58, -1.52, 0.36]} tone="cyan">field moves around</StageLabel></>}
    {step === "torque" && <><VectorArrow angle={Math.PI / 2} length={1.15} color="#1a96a5" opacity={0.95} /><VectorArrow angle={Math.PI / 2 - torqueGap} length={0.92} color="#756bd0" opacity={showMagnetPull ? 0.96 : 0.12} /><VectorArrow angle={Math.PI / 2 - Math.PI / 2} length={0.82} color="#d59f29" opacity={showSteelPull ? 0.9 : 0.08} position={[0, 0, 1.2]} /><StageLabel position={[-1.7, 1.58, 0.4]} tone="cyan">stator field</StageLabel><StageLabel position={[1.55, 1.38, 0.4]} tone="violet">magnet pull</StageLabel><StageLabel position={[-1.45, -1.55, 0.4]} tone="amber">easy steel path</StageLabel></>}
    {step === "heat" && <><VectorArrow angle={-Math.PI / 3} length={1.14} color="#dd6a52" opacity={0.5 + opposingField * 0.5} position={[1.7, 0, 1.12]} /><StageLabel position={[-1.45, 1.7, 0.35]} tone="amber">heat lowers margin</StageLabel>{heat > 0.65 && opposingField > 0.65 && <StageLabel position={[1.52, -1.45, 0.48]} tone="rose">reversed patch</StageLabel>}</>}
    {step === "heat" && heat > 0.2 && <mesh position={[0, 0, 0.9]} renderOrder={5}><torusGeometry args={[1.06, 0.11, 12, 48]} /><meshBasicMaterial color="#e57643" transparent opacity={0.42 + heat * 0.32} depthTest={false} /></mesh>}
    {step === "heat" && heat > 0.65 && opposingField > 0.65 && <mesh position={[0.52, 0.16, 0.97]} renderOrder={6}><sphereGeometry args={[0.14, 16, 16]} /><meshBasicMaterial color="#d95958" transparent opacity={0.9} depthTest={false} /></mesh>}
  </group>;
}

function MagnetGrainModel({ protection }: { protection: number }) {
  const shellScale = 0.28 + protection * 0.42;
  return <group scale={1.25} position={[0, 0.05, 0]} rotation={[-0.18, 0.3, 0]}>
    <RoundedBox args={[2.62, 1.76, 0.22]} radius={0.12} smoothness={3} position={[0, 0, -0.1]}><meshStandardMaterial color="#b9c8c6" metalness={0.55} roughness={0.34} /><Edges color="#e0e8e5" threshold={22} /></RoundedBox>
    <RoundedBox args={[2.24, 1.42, 0.14]} radius={0.1} smoothness={3} position={[0, 0, 0.07]}><meshStandardMaterial color="#d8a642" transparent opacity={0.18 + shellScale * 0.5} emissive="#b87918" emissiveIntensity={0.15} /></RoundedBox>
    <RoundedBox args={[1.5, 0.9, 0.18]} radius={0.08} smoothness={3} position={[0, 0, 0.18]}><meshStandardMaterial color="#756bd0" emissive="#564fa5" emissiveIntensity={0.26} roughness={0.28} metalness={0.4} /></RoundedBox>
    <mesh position={[-0.85, 0, 0.32]} scale={[shellScale, 1, 1]}><boxGeometry args={[0.14, 0.92, 0.12]} /><meshBasicMaterial color="#d59f29" transparent opacity={0.95} depthTest={false} /></mesh>
    <VectorArrow angle={Math.PI / 2} length={0.86} color="#1a96a5" position={[0, 0, 0.42]} />
    <mesh position={[-0.7, 0.56, 0.42]}><sphereGeometry args={[0.085, 16, 16]} /><meshBasicMaterial color="#dd6a52" /></mesh>
    <StageLabel position={[-0.98, 1.28, 0.4]} tone="amber">edge shell</StageLabel><StageLabel position={[1.18, -1.2, 0.4]} tone="violet">NdFeB core</StageLabel>
  </group>;
}

function Scene({ step, paused, reducedMotion, protection, isolate, pullMode, heat, opposingField, load, phaseIndex }: { step: LessonStep; paused: boolean; reducedMotion: boolean; protection: number; isolate: IsolateMode; pullMode: PullMode; heat: number; opposingField: number; load: number; phaseIndex: number }) {
  return <><ambientLight intensity={2.35} color="#fffdf8" /><directionalLight position={[4, 5, 6]} intensity={3.5} color="#ffffff" castShadow /><pointLight position={[-4, 1, 3]} intensity={1.5} color="#6fc2c3" /><pointLight position={[3, -2, 2]} intensity={0.8} color="#f0b15a" />{step === "location" && <CarModel />}{step === "unit" && <DriveUnit />}{step !== "location" && step !== "unit" && step !== "protection" && <MotorModel step={step} paused={paused} reducedMotion={reducedMotion} protection={protection} isolate={isolate} pullMode={pullMode} heat={heat} opposingField={opposingField} load={load} phaseIndex={phaseIndex} />}{step === "protection" && <MagnetGrainModel protection={protection} />}</>;
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
  const [fieldPlaying, setFieldPlaying] = useState(true);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [protection, setProtection] = useState(0.55);
  const [isolate, setIsolate] = useState<IsolateMode>("both");
  const [pullMode, setPullMode] = useState<PullMode>("both");
  const [load, setLoad] = useState(0.4);
  const [heat, setHeat] = useState(0.48);
  const [opposingField, setOpposingField] = useState(0.35);
  const [reducedMotion, setReducedMotion] = useState(false);
  const step = STEPS[stepIndex];

  useEffect(() => { document.title = "How an EV motor works"; const media = window.matchMedia("(prefers-reduced-motion: reduce)"); const update = () => setReducedMotion(media.matches); update(); media.addEventListener("change", update); return () => media.removeEventListener("change", update); }, []);
  useEffect(() => { if (step.id !== "field") setFieldPlaying(true); if (step.id !== "anatomy") setIsolate("both"); if (step.id !== "torque") setPullMode("both"); }, [step.id]);
  useEffect(() => { const onKeyDown = (event: KeyboardEvent) => { if (event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement) return; if (event.key === "ArrowRight" || event.key === "PageDown") { event.preventDefault(); setStepIndex((current) => clamp(current + 1, 0, STEPS.length - 1)); } else if (event.key === "ArrowLeft" || event.key === "PageUp") { event.preventDefault(); setStepIndex((current) => clamp(current - 1, 0, STEPS.length - 1)); } else if (event.key === " " && step.id === "field") { event.preventDefault(); setFieldPlaying((playing) => !playing); } }; window.addEventListener("keydown", onKeyDown); return () => window.removeEventListener("keydown", onKeyDown); }, [step.id]);

  const status = step.id === "field" ? fieldPlaying ? "The field is travelling around the stator." : "The field is paused so you can inspect the three groups." : step.id === "torque" ? pullMode === "magnet" ? "Showing the magnet's pull." : pullMode === "steel" ? "Showing the steel's easy direction." : "Showing both torque effects together." : step.id === "heat" ? heat > 0.65 && opposingField > 0.65 ? "A reversed patch remains after the stress." : "No permanent patch yet: both stresses must be high." : step.id === "protection" ? protection > 0.66 ? "A thicker edge shell gives more reversal margin." : "A thinner edge shell leaves more of the core's field." : step.answer;

  return <div className="core-app">
    <a className="skip-link" href="#lesson-stage">Skip to lesson</a>
    <header className="topbar"><div className="brand-lockup"><span className="brand-mark" aria-hidden="true"><span /></span><div><p className="eyebrow">A visual primer</p><p className="brand-name">How an EV motor works</p></div></div><p className="topbar-note">Seven small ideas · one machine</p></header>
    <main className="lesson-layout">
      <section id="lesson-stage" className="lesson-stage" aria-labelledby="stage-heading"><div className="stage-heading-row"><div><p className="stage-kicker">{step.kicker}</p><h1 id="stage-heading">{step.title}</h1></div><span className="step-count">{String(stepIndex + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}</span></div><div className="canvas-wrap"><Canvas shadows dpr={[1, 1.5]} camera={{ position: [4.4, 2.8, 7.4], fov: 38 }} fallback={<StaticFallback step={step.id} />}><Suspense fallback={null}><Scene step={step.id} paused={!fieldPlaying} reducedMotion={reducedMotion} protection={protection} isolate={isolate} pullMode={pullMode} heat={heat} opposingField={opposingField} load={load} phaseIndex={phaseIndex} /><OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 2.75} maxPolarAngle={Math.PI / 2.15} rotateSpeed={0.35} enabled={step.id !== "location"} /></Suspense></Canvas><div className="canvas-hint">{step.id === "location" ? "Blue is the battery. Copper is the drive unit." : "Drag gently to inspect"}</div></div><div className="stage-status" aria-live="polite"><span className="status-dot" aria-hidden="true" />{status}</div></section>
      <aside className="lesson-panel" aria-label="Lesson explanation"><nav className="step-nav" aria-label="Lesson steps">{STEPS.map((item, index) => <button key={item.id} type="button" className={`step-button ${index === stepIndex ? "is-active" : ""}`} onClick={() => setStepIndex(index)} aria-current={index === stepIndex ? "step" : undefined}><span className="step-number">{String(index + 1).padStart(2, "0")}</span><span>{item.title}</span></button>)}</nav><div className="lesson-copy"><p className="copy-question">{step.question}</p><p className="copy-answer">{step.answer}</p><p className="copy-detail">{step.detail}</p></div>
        {step.id === "anatomy" && <div className="lesson-control"><p className="control-label">Isolate a part</p><div className="segmented-control" role="group" aria-label="Isolate motor part">{(["both", "stator", "rotor"] as const).map((mode) => <button key={mode} type="button" aria-pressed={isolate === mode} className={isolate === mode ? "is-selected" : ""} onClick={() => setIsolate(mode)}>{mode}</button>)}</div><p className="control-hint">The geometry stays in place; only the selected part fades back.</p></div>}
        {step.id === "field" && <div className="lesson-control"><button type="button" className="control-button" aria-pressed={fieldPlaying} onClick={() => setFieldPlaying((playing) => !playing)}>{fieldPlaying ? <Pause size={16} weight="bold" aria-hidden="true" /> : <Play size={16} weight="bold" aria-hidden="true" />}{fieldPlaying ? "Pause the field" : "Play the field"}</button><div className="phase-key" aria-label="Choose a coil group">{(["A", "B", "C"] as const).map((name, index) => <button key={name} type="button" className={`phase-key__item ${phaseIndex === index ? "is-active" : ""}`} aria-pressed={phaseIndex === index} onClick={() => { setPhaseIndex(index); setFieldPlaying(true); }}><span className={`phase-dot phase-dot--${name.toLowerCase()}`} />{name}</button>)}</div><p className="control-hint">Space also pauses it. The field moves; the copper does not.</p></div>}
        {step.id === "torque" && <><div className="lesson-control"><p className="control-label">Show the pull</p><div className="segmented-control segmented-control--three" role="group" aria-label="Show torque effect">{(["magnet", "steel", "both"] as const).map((mode) => <button key={mode} type="button" aria-pressed={pullMode === mode} className={pullMode === mode ? "is-selected" : ""} onClick={() => setPullMode(mode)}>{mode === "magnet" ? "Magnet" : mode === "steel" ? "Steel" : "Together"}</button>)}</div></div><QualitativeRange id="shaft-load" label="Shaft load" value={load} onChange={setLoad} tone="cyan" low="light" high="heavy" hint="A heavier load opens the angle while both parts stay in step." /></>}
        {step.id === "heat" && <><QualitativeRange id="magnet-heat" label="Magnet heat" value={heat} onChange={setHeat} tone="rose" low="cool" high="hot" hint="Heat lowers the magnet's resistance to reversal." /><QualitativeRange id="opposing-field" label="Opposing stator field" value={opposingField} onChange={setOpposingField} tone="rose" low="gentle" high="hard" hint="A permanent patch appears only when both stresses are high." /></>}
        {step.id === "protection" && <QualitativeRange id="dy-tb-protection" label="Dy/Tb protection" value={protection} onChange={setProtection} tone="amber" low="less protection" high="more protection" hint="The amber shell protects the edge; it is not a coolant." />}
        <div className="panel-footer"><button type="button" className="nav-button nav-button--back" onClick={() => setStepIndex((current) => clamp(current - 1, 0, STEPS.length - 1))} disabled={stepIndex === 0}><ArrowLeft size={17} aria-hidden="true" />Back</button><button type="button" className="nav-button nav-button--next" onClick={() => setStepIndex((current) => clamp(current + 1, 0, STEPS.length - 1))} disabled={stepIndex === STEPS.length - 1}>Next<ArrowRight size={17} aria-hidden="true" /></button></div><p className="panel-footnote">This first pass stays with the machine itself. Alternative motor families come after the basic picture clicks.</p></aside>
    </main>
  </div>;
}
