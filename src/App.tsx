import { Canvas, useFrame } from "@react-three/fiber";
import { Edges, Html, OrbitControls, RoundedBox } from "@react-three/drei";
import { ArrowLeft, ArrowRight, Pause, Play } from "@phosphor-icons/react";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type LessonStep = "location" | "unit" | "motor" | "field" | "heat";

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
  { id: "unit", kicker: "02 · inside the unit", title: "Open the drive unit", question: "What is packed inside?", answer: "Power electronics feed a motor; gears pass its rotation to the axle.", detail: "The body of the car can stay the same. This small assembly is where the electrical and mechanical work meet." },
  { id: "motor", kicker: "03 · the motor", title: "Stator and rotor", question: "What moves, and what stays still?", answer: "Copper coils stay still in the stator. Magnets ride inside on the spinning rotor.", detail: "The air gap keeps the two parts close enough to pull on each other without touching." },
  { id: "field", kicker: "04 · the pull", title: "Make a moving field", question: "How does a still coil make motion?", answer: "Three coil groups take turns being strong. Their combined magnetic push travels around the ring.", detail: "The rotor follows that moving push. That is the useful torque that reaches the wheels." },
  { id: "heat", kicker: "05 · the hard part", title: "Why heat matters", question: "Why add dysprosium or terbium?", answer: "Heat makes a magnet easier to reverse. Dy/Tb adds a little more resistance to that reversal.", detail: "It is a trade-off: more protection can mean a little less magnetic strength. The control shows the idea, not a universal recipe." },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function StageLabel({ children, position, tone = "neutral" }: { children: string; position: [number, number, number]; tone?: "neutral" | "cyan" | "violet" | "amber" | "copper" }) {
  return <Html position={position} center distanceFactor={7} style={{ pointerEvents: "none" }}><span className={`stage-label stage-label--${tone}`}>{children}</span></Html>;
}

function Wheel({ position }: { position: [number, number, number] }) {
  return <mesh position={position} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow><cylinderGeometry args={[0.52, 0.52, 0.22, 32]} /><meshStandardMaterial color="#10161a" roughness={0.55} metalness={0.45} /></mesh>;
}

function CarModel({ visible }: { visible: boolean }) {
  const material = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#9fb3b7", transparent: true, opacity: visible ? 0.46 : 0, roughness: 0.24, metalness: 0.22, transmission: 0.04 }), [visible]);
  return <group visible={visible} scale={1.08} position={[0, 0.12, 0]}>
    <RoundedBox args={[5.8, 0.8, 2.2]} radius={0.22} smoothness={3} position={[0, 1.05, 0]} castShadow><primitive object={material} attach="material" /><Edges color="#718d92" threshold={18} /></RoundedBox>
    <RoundedBox args={[3.4, 0.54, 1.76]} radius={0.18} smoothness={3} position={[0.25, 1.7, 0]}><meshStandardMaterial color="#6b858b" transparent opacity={0.34} roughness={0.25} metalness={0.2} /></RoundedBox>
    <mesh position={[0, 0.66, 0]}><boxGeometry args={[2.9, 0.38, 1.25]} /><meshStandardMaterial color="#2e7d92" emissive="#b7e4e8" emissiveIntensity={0.42} roughness={0.5} /></mesh>
    <Wheel position={[-1.9, 0.38, 1.18]} /><Wheel position={[1.9, 0.38, 1.18]} /><Wheel position={[-1.9, 0.38, -1.18]} /><Wheel position={[1.9, 0.38, -1.18]} />
    <RoundedBox args={[1.34, 0.34, 0.92]} radius={0.08} smoothness={2} position={[0, 0.94, 0]}><meshStandardMaterial color="#377f98" emissive="#b7e4e8" emissiveIntensity={0.65} transparent opacity={0.95} /></RoundedBox>
    <mesh position={[1.1, 0.92, 0]}><cylinderGeometry args={[0.42, 0.42, 0.62, 32]} /><meshStandardMaterial color="#d97835" emissive="#99461e" emissiveIntensity={0.25} roughness={0.35} metalness={0.72} /></mesh>
    {visible && <StageLabel position={[1.1, 1.7, 0]} tone="cyan">drive unit</StageLabel>}
  </group>;
}

function GearWheel({ radius, teeth }: { radius: number; teeth: number }) {
  return <group>
    <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[radius * 0.7, radius * 0.7, 0.24, 32]} /><meshStandardMaterial color="#7f9398" metalness={0.88} roughness={0.22} /></mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[radius * 0.72, 0.065, 10, 32]} /><meshStandardMaterial color="#c1ccca" metalness={0.85} roughness={0.2} /></mesh>
    {Array.from({ length: teeth }, (_, index) => { const angle = (Math.PI * 2 * index) / teeth; return <mesh key={index} position={[Math.cos(angle) * radius * 0.92, Math.sin(angle) * radius * 0.92, 0]} rotation={[0, 0, angle]}><boxGeometry args={[0.14, 0.25, 0.25]} /><meshStandardMaterial color="#82949b" metalness={0.87} roughness={0.22} /></mesh>; })}
  </group>;
}

function DriveUnit({ visible }: { visible: boolean }) {
  return <group visible={visible} position={[0, 0.1, 0]} scale={1.1}>
    <group position={[-1.5, 0.62, 0]}><RoundedBox args={[1.2, 0.46, 1.1]} radius={0.12} smoothness={3}><meshStandardMaterial color="#8fa2a5" metalness={0.75} roughness={0.25} /></RoundedBox><mesh position={[0, 0.28, 0]}><boxGeometry args={[0.82, 0.08, 0.76]} /><meshStandardMaterial color="#d07939" emissive="#9a461d" emissiveIntensity={0.38} metalness={0.55} roughness={0.35} /></mesh>{visible && <StageLabel position={[0, 0.73, 0]} tone="amber">inverter</StageLabel>}</group>
    <group position={[0, 0.3, 0]}><RoundedBox args={[1.5, 0.72, 1.34]} radius={0.18} smoothness={3}><meshStandardMaterial color="#bbc8ca" metalness={0.65} roughness={0.27} /></RoundedBox><mesh position={[0, 0, 0.72]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.48, 0.12, 12, 32]} /><meshStandardMaterial color="#d97835" emissive="#98451d" emissiveIntensity={0.28} metalness={0.7} roughness={0.3} /></mesh>{visible && <StageLabel position={[0, 0.82, 0]} tone="violet">motor</StageLabel>}</group>
    <group position={[1.5, 0.3, 0]}><GearWheel radius={0.52} teeth={12} />{visible && <StageLabel position={[0, 0.72, 0]} tone="neutral">gearset</StageLabel>}</group>
    <mesh position={[0, -0.35, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.06, 0.06, 4.1, 16]} /><meshStandardMaterial color="#e0e7e5" metalness={0.85} roughness={0.18} /></mesh>
  </group>;
}

function StatorTooth({ angle, active }: { angle: number; active: boolean }) {
  const x = Math.cos(angle) * 1.27;
  const y = Math.sin(angle) * 1.27;
  return <group position={[x, y, 0]} rotation={[0, 0, angle]}>
    <RoundedBox args={[0.31, 0.76, 0.42]} radius={0.06} smoothness={2} castShadow>
      <meshStandardMaterial color="#8a9ca0" emissive="#93a5aa" emissiveIntensity={0.18} metalness={0.8} roughness={0.3} />
      <Edges color="#d5dedd" threshold={24} />
    </RoundedBox>
    <group position={[0, 0, 0.23]}>
      <RoundedBox args={[0.42, 0.13, 0.15]} radius={0.04} smoothness={2}><meshStandardMaterial color="#d87a36" emissive="#a34c1e" emissiveIntensity={active ? 0.68 : 0.18} metalness={0.62} roughness={0.3} /></RoundedBox>
      <RoundedBox args={[0.13, 0.63, 0.15]} radius={0.04} smoothness={2} position={[-0.14, -0.22, 0]}><meshStandardMaterial color="#d87a36" emissive="#9f4b20" emissiveIntensity={active ? 0.62 : 0.18} metalness={0.62} roughness={0.3} /></RoundedBox>
      <RoundedBox args={[0.13, 0.63, 0.15]} radius={0.04} smoothness={2} position={[0.14, -0.22, 0]}><meshStandardMaterial color="#d87a36" emissive="#9f4b20" emissiveIntensity={active ? 0.62 : 0.18} metalness={0.62} roughness={0.3} /></RoundedBox>
    </group>
  </group>;
}

function Rotor({ heat, protection }: { heat: boolean; protection: number }) {
  const margin = 0.16 + protection * 0.23;
  const magnetPairs = [[0, 0.57, 0], [0, -0.57, Math.PI], [0.57, 0, Math.PI / 2], [-0.57, 0, -Math.PI / 2]] as const;
  return <group>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.94, 0.94, 0.48, 40]} />
      <meshStandardMaterial color="#7a8c96" metalness={0.8} roughness={0.3} />
      <Edges color="#dce5e3" threshold={20} />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.25]}>
      <cylinderGeometry args={[0.34, 0.34, 0.66, 32]} />
      <meshStandardMaterial color="#c4cecd" metalness={0.86} roughness={0.22} />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.12, 0.12, 3.6, 20]} />
      <meshStandardMaterial color="#e4eae8" metalness={0.92} roughness={0.16} />
    </mesh>
    {magnetPairs.map(([x, y, rotation], index) => <group key={index} position={[x, y, 0.34]} rotation={[0, 0, rotation]}>
      <RoundedBox args={[0.46, 0.18, 0.12]} radius={0.04} smoothness={2}>
        <meshStandardMaterial color="#687586" metalness={0.75} roughness={0.34} />
      </RoundedBox>
      <RoundedBox args={[0.34, 0.1, 0.13]} radius={0.03} smoothness={2} position={[0, 0, 0.05]}>
        <meshStandardMaterial color="#6a61ba" emissive="#4b438b" emissiveIntensity={0.36} roughness={0.28} metalness={0.5} />
      </RoundedBox>
    </group>)}
    {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle) => <mesh key={angle} position={[Math.cos(angle) * 0.79, Math.sin(angle) * 0.79, 0.32]} rotation={[0, 0, angle]}>
      <boxGeometry args={[0.12, 0.34, 0.16]} />
      <meshStandardMaterial color="#bfcac8" metalness={0.84} roughness={0.23} />
    </mesh>)}
    <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.94 + margin, 0.025, 8, 48]} /><meshStandardMaterial color="#d09a24" transparent opacity={0.38 + protection * 0.28} emissive="#a87314" emissiveIntensity={0.2} /></mesh>
    {heat && <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.18, 0.16, 12, 48]} /><meshBasicMaterial color="#e97842" transparent opacity={0.18 + (1 - protection) * 0.14} /></mesh>}
  </group>;
}

function FieldArrows({ angle, visible }: { angle: number; visible: boolean }) {
  return <group visible={visible} rotation={[0, 0, angle]}>
    {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((phase) => <group key={phase} position={[Math.cos(phase) * 1.78, Math.sin(phase) * 1.78, 0.12]} rotation={[0, 0, phase + Math.PI / 2]}><mesh position={[0, 0.34, 0]}><boxGeometry args={[0.035, 0.58, 0.035]} /><meshBasicMaterial color="#1f9eac" transparent opacity={0.9} /></mesh><mesh position={[0, 0.68, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.11, 0.22, 3]} /><meshBasicMaterial color="#1f9eac" transparent opacity={0.96} /></mesh></group>)}
    <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.75, 0.025, 8, 64]} /><meshBasicMaterial color="#1f9eac" transparent opacity={0.32} /></mesh>
  </group>;
}

function MotorModel({ step, paused, reducedMotion, protection }: { step: LessonStep; paused: boolean; reducedMotion: boolean; protection: number }) {
  const fieldAngle = useRef(0);
  const rotorAngle = useRef(0);
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (step === "field" && !paused && !reducedMotion) { fieldAngle.current += delta * 0.75; rotorAngle.current += delta * 0.7; }
    if (groupRef.current) groupRef.current.rotation.z = step === "field" ? rotorAngle.current : 0;
  });
  const showMotor = step === "motor" || step === "field" || step === "heat";
  return <group visible={showMotor} scale={1.18} position={[0, -0.12, 0]}><group ref={groupRef}><mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.42, 0.2, 16, 64]} /><meshStandardMaterial color="#93a4a7" metalness={0.82} roughness={0.28} /><Edges color="#dce5e3" threshold={24} /></mesh>{Array.from({ length: 12 }, (_, index) => <StatorTooth key={index} angle={(Math.PI * 2 * index) / 12} active={step === "field"} />)}<Rotor heat={step === "heat"} protection={protection} /><FieldArrows angle={step === "field" ? fieldAngle.current : 0} visible={step === "field"} /></group>{step === "motor" && <><StageLabel position={[-1.75, 1.36, 0]} tone="copper">stator stays still</StageLabel><StageLabel position={[1.35, -1.42, 0]} tone="violet">rotor turns</StageLabel></>}{step === "field" && <><StageLabel position={[-1.5, 1.62, 0]} tone="cyan">field moves</StageLabel><StageLabel position={[1.6, -1.36, 0]} tone="violet">rotor follows</StageLabel></>}{step === "heat" && <StageLabel position={[0, 1.82, 0]} tone="amber">safety margin</StageLabel>}</group>;
}

function Scene({ step, paused, reducedMotion, protection }: { step: LessonStep; paused: boolean; reducedMotion: boolean; protection: number }) {
  return <><ambientLight intensity={2.1} color="#f8fbfa" /><directionalLight position={[4, 5, 6]} intensity={3.2} color="#ffffff" castShadow /><pointLight position={[-4, 1, 3]} intensity={1.4} color="#4fa8b1" /><CarModel visible={step === "location"} /><DriveUnit visible={step === "unit"} /><MotorModel step={step} paused={paused} reducedMotion={reducedMotion} protection={protection} /></>;
}

function StaticFallback({ step }: { step: LessonStep }) {
  return <div className="static-fallback" role="img" aria-label={`${STEPS.find((item) => item.id === step)?.title ?? "Motor lesson"} visual fallback`}><div className={`fallback-object fallback-object--${step}`}><span className="fallback-core" /><span className="fallback-ring" /><span className="fallback-accent" /></div><p>Interactive 3D is unavailable here. The lesson controls still work.</p></div>;
}

export default function App() {
  const [stepIndex, setStepIndex] = useState(0);
  const [fieldPlaying, setFieldPlaying] = useState(true);
  const [protection, setProtection] = useState(0.55);
  const [reducedMotion, setReducedMotion] = useState(false);
  const step = STEPS[stepIndex];

  useEffect(() => { document.title = "How an EV motor works"; const media = window.matchMedia("(prefers-reduced-motion: reduce)"); const update = () => setReducedMotion(media.matches); update(); media.addEventListener("change", update); return () => media.removeEventListener("change", update); }, []);
  useEffect(() => { if (step.id !== "field") setFieldPlaying(true); }, [step.id]);
  useEffect(() => { const onKeyDown = (event: KeyboardEvent) => { if (event.target instanceof HTMLInputElement) return; if (event.key === "ArrowRight" || event.key === "PageDown") { event.preventDefault(); setStepIndex((current) => clamp(current + 1, 0, STEPS.length - 1)); } else if (event.key === "ArrowLeft" || event.key === "PageUp") { event.preventDefault(); setStepIndex((current) => clamp(current - 1, 0, STEPS.length - 1)); } else if (event.key === " " && step.id === "field") { event.preventDefault(); setFieldPlaying((playing) => !playing); } }; window.addEventListener("keydown", onKeyDown); return () => window.removeEventListener("keydown", onKeyDown); }, [step.id]);

  const status = step.id === "field" ? fieldPlaying ? "The moving field is playing." : "The field is paused." : step.id === "heat" ? protection > 0.66 ? "More protection: the reversal margin is wider." : "Less protection: the reversal margin is narrower." : step.answer;

  return <div className="core-app">
    <a className="skip-link" href="#lesson-stage">Skip to lesson</a>
    <header className="topbar"><div className="brand-lockup"><span className="brand-mark" aria-hidden="true"><span /></span><div><p className="eyebrow">A visual primer</p><p className="brand-name">How an EV motor works</p></div></div><p className="topbar-note">One idea at a time</p></header>
    <main className="lesson-layout">
      <section id="lesson-stage" className="lesson-stage" aria-labelledby="stage-heading"><div className="stage-heading-row"><div><p className="stage-kicker">{step.kicker}</p><h1 id="stage-heading">{step.title}</h1></div><span className="step-count">{String(stepIndex + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}</span></div><div className="canvas-wrap"><Canvas shadows dpr={[1, 1.5]} camera={{ position: [4.4, 2.8, 7.4], fov: 38 }} fallback={<StaticFallback step={step.id} />}><Suspense fallback={null}><Scene step={step.id} paused={!fieldPlaying} reducedMotion={reducedMotion} protection={protection} /><OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 2.75} maxPolarAngle={Math.PI / 2.15} rotateSpeed={0.35} enabled={step.id !== "location"} /></Suspense></Canvas><div className="canvas-hint">{step.id === "location" ? "Blue is the battery. Copper is the drive unit." : "Drag gently to inspect"}</div></div><div className="stage-status" aria-live="polite"><span className="status-dot" aria-hidden="true" />{status}</div></section>
      <aside className="lesson-panel" aria-label="Lesson explanation"><nav className="step-nav" aria-label="Lesson steps">{STEPS.map((item, index) => <button key={item.id} type="button" className={`step-button ${index === stepIndex ? "is-active" : ""}`} onClick={() => setStepIndex(index)} aria-current={index === stepIndex ? "step" : undefined}><span className="step-number">{String(index + 1).padStart(2, "0")}</span><span>{item.title}</span></button>)}</nav><div className="lesson-copy"><p className="copy-question">{step.question}</p><p className="copy-answer">{step.answer}</p><p className="copy-detail">{step.detail}</p></div>{step.id === "field" && <div className="lesson-control"><button type="button" className="control-button" aria-pressed={fieldPlaying} onClick={() => setFieldPlaying((playing) => !playing)}>{fieldPlaying ? <Pause size={16} weight="bold" aria-hidden="true" /> : <Play size={16} weight="bold" aria-hidden="true" />}{fieldPlaying ? "Pause the field" : "Play the field"}</button><p className="control-hint">Space also pauses it.</p></div>}{step.id === "heat" && <div className="lesson-control"><label htmlFor="protection-range">Dy/Tb protection</label><input id="protection-range" type="range" min="0" max="1" step="0.01" value={protection} onChange={(event) => setProtection(Number(event.target.value))} aria-valuetext={protection > 0.66 ? "more protection" : protection < 0.34 ? "less protection" : "some protection"} /><div className="range-ends"><span>less protection</span><span>more protection</span></div><p className="control-hint">More protection widens the margin, but can soften the magnet.</p></div>}<div className="panel-footer"><button type="button" className="nav-button nav-button--back" onClick={() => setStepIndex((current) => clamp(current - 1, 0, STEPS.length - 1))} disabled={stepIndex === 0}><ArrowLeft size={17} aria-hidden="true" />Back</button><button type="button" className="nav-button nav-button--next" onClick={() => setStepIndex((current) => clamp(current + 1, 0, STEPS.length - 1))} disabled={stepIndex === STEPS.length - 1}>Next<ArrowRight size={17} aria-hidden="true" /></button></div><p className="panel-footnote">Built from the supplied due-diligence explanation. Alternatives come next; this first pass teaches the machine itself.</p></aside>
    </main>
  </div>;
}
