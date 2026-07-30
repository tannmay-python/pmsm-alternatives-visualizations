import { Float, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  Group,
  MathUtils,
  Vector3,
} from "three";
import type { MutableRefObject } from "react";
import type { AlternativeKey, StorySignal } from "../types";

const GRAPHITE = "#15191b";
const GRAPHITE_2 = "#242a2d";
const STEEL = "#90999c";
const STEEL_DARK = "#444d50";
const COPPER = "#b96532";
const COPPER_BRIGHT = "#db8d51";
const SIGNAL = "#badb3d";
const GLASS = "#819095";

type StoryCanvasProps = {
  signal: MutableRefObject<StorySignal>;
  onReady: () => void;
};

type SceneProps = {
  signal: MutableRefObject<StorySignal>;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const smooth = (start: number, end: number, value: number) => {
  const t = clamp01((value - start) / (end - start));
  return t * t * (3 - 2 * t);
};

const stagePresence = (progress: number, index: number) => {
  const distance = Math.abs(progress - index);
  return 1 - smooth(0.36, 0.66, distance);
};

function ScenePresence({
  signal,
  index,
  children,
  position = [0, 0, 0],
}: SceneProps & {
  index: number;
  children: React.ReactNode;
  position?: [number, number, number];
}) {
  const group = useRef<Group>(null);

  useFrame(() => {
    if (!group.current) return;
    const presence = stagePresence(signal.current.progress, index);
    const easedScale = 0.82 + presence * 0.18;
    group.current.visible = presence > 0.002;
    group.current.scale.lerp(
      new Vector3(
        Math.max(0.001, easedScale * presence),
        Math.max(0.001, easedScale * presence),
        Math.max(0.001, easedScale * presence),
      ),
      signal.current.reducedMotion ? 1 : 0.12,
    );
    group.current.position.x = MathUtils.lerp(
      group.current.position.x,
      position[0],
      0.12,
    );
    group.current.position.y = MathUtils.lerp(
      group.current.position.y,
      position[1] + (1 - presence) * -0.6,
      0.12,
    );
    group.current.position.z = MathUtils.lerp(
      group.current.position.z,
      position[2] - (1 - presence) * 4,
      0.12,
    );
  });

  return <group ref={group}>{children}</group>;
}

function CameraRig({ signal }: SceneProps) {
  const { camera, pointer, size } = useThree();
  const target = useMemo(() => new Vector3(), []);

  useFrame(() => {
    const progress = signal.current.progress;
    const stage = Math.round(progress);
    const mobile = size.width < 720;
    const desktopX = stage === 0 ? 1.1 : stage === 3 ? 0.3 : 0;
    const pointerFactor = signal.current.reducedMotion ? 0 : 0.25;
    const x = (mobile ? desktopX * 0.35 : desktopX) + pointer.x * pointerFactor;
    const y = 1.2 + pointer.y * pointerFactor * 0.45;
    const baseZ = stage === 0 ? 13.5 : stage === 1 ? 12.2 : 11.2;
    const z = baseZ * (mobile ? 2.12 : 1);

    camera.position.x = MathUtils.lerp(camera.position.x, x, 0.035);
    camera.position.y = MathUtils.lerp(camera.position.y, y, 0.035);
    camera.position.z = MathUtils.lerp(camera.position.z, z, 0.035);
    target.set(
      mobile ? 0 : stage === 0 ? 0.9 : 0,
      mobile ? 1.1 : stage === 0 ? 0.2 : 0,
      0,
    );
    camera.lookAt(target);
  });

  return null;
}

function Wheel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.72, 0.72, 0.42, 36]} />
        <meshStandardMaterial color="#111415" roughness={0.84} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.04, 20]} />
        <meshStandardMaterial color={STEEL_DARK} metalness={0.86} roughness={0.28} />
      </mesh>
      {Array.from({ length: 8 }).map((_, index) => (
        <mesh
          key={index}
          rotation={[0, (index / 8) * Math.PI * 2, 0]}
          position={[
            Math.sin((index / 8) * Math.PI * 2) * 0.23,
            0.25,
            Math.cos((index / 8) * Math.PI * 2) * 0.23,
          ]}
        >
          <boxGeometry args={[0.08, 0.035, 0.34]} />
          <meshStandardMaterial color={STEEL} metalness={0.8} roughness={0.24} />
        </mesh>
      ))}
    </group>
  );
}

function CompactMotor({
  position,
  signalColor = false,
  scale = 1,
}: {
  position: [number, number, number];
  signalColor?: boolean;
  scale?: number;
}) {
  return (
    <group position={position} scale={scale} rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.48, 0.48, 0.8, 32]} />
        <meshStandardMaterial
          color={signalColor ? SIGNAL : STEEL_DARK}
          metalness={0.68}
          roughness={0.32}
        />
      </mesh>
      <mesh position={[0, 0.43, 0]}>
        <torusGeometry args={[0.34, 0.08, 10, 36]} />
        <meshStandardMaterial color={COPPER} metalness={0.76} roughness={0.28} />
      </mesh>
      <mesh position={[0, -0.49, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.2, 24]} />
        <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.22} />
      </mesh>
    </group>
  );
}

function TransparentCar({ signal }: SceneProps) {
  const car = useRef<Group>(null);

  useFrame(() => {
    if (!car.current) return;
    car.current.rotation.y = MathUtils.lerp(
      car.current.rotation.y,
      -0.28 + (signal.current.reducedMotion ? 0 : Math.sin(performance.now() * 0.0002) * 0.025),
      0.04,
    );
  });

  return (
    <ScenePresence signal={signal} index={0} position={[1.35, -0.35, 0]}>
      <Float
        speed={signal.current.reducedMotion ? 0 : 0.55}
        floatIntensity={signal.current.reducedMotion ? 0 : 0.08}
        rotationIntensity={0}
      >
        <group ref={car}>
          <RoundedBox
            args={[7.7, 0.24, 3.25]}
            radius={0.16}
            position={[0, -0.38, 0]}
            castShadow
          >
            <meshStandardMaterial color={STEEL_DARK} metalness={0.82} roughness={0.3} />
          </RoundedBox>
          <RoundedBox
            args={[4.7, 0.38, 2.65]}
            radius={0.15}
            position={[0, -0.1, 0]}
          >
            <meshStandardMaterial color="#383d3e" metalness={0.45} roughness={0.5} />
          </RoundedBox>
          {Array.from({ length: 10 }).map((_, index) => (
            <mesh key={index} position={[-1.82 + index * 0.4, 0.1, 0]}>
              <boxGeometry args={[0.34, 0.08, 2.35]} />
              <meshStandardMaterial
                color={index % 2 ? "#485052" : "#343a3c"}
                metalness={0.38}
                roughness={0.48}
              />
            </mesh>
          ))}

          <RoundedBox
            args={[7.25, 1.65, 3.05]}
            radius={0.62}
            position={[0, 0.72, 0]}
          >
            <meshPhysicalMaterial
              color={GLASS}
              transmission={0.68}
              transparent
              opacity={0.31}
              roughness={0.12}
              metalness={0.15}
              thickness={0.2}
              side={DoubleSide}
              depthWrite={false}
            />
          </RoundedBox>
          <RoundedBox
            args={[3.8, 1.45, 2.82]}
            radius={0.58}
            position={[0.2, 1.58, 0]}
          >
            <meshPhysicalMaterial
              color="#6f7b7f"
              transmission={0.72}
              transparent
              opacity={0.24}
              roughness={0.08}
              thickness={0.12}
              depthWrite={false}
            />
          </RoundedBox>
          <mesh position={[-0.1, 1.7, 0]} rotation={[0, 0, -0.14]}>
            <boxGeometry args={[0.06, 1.25, 2.9]} />
            <meshStandardMaterial color={STEEL} transparent opacity={0.38} />
          </mesh>

          {[
            [-2.6, -0.42, -1.66],
            [-2.6, -0.42, 1.66],
            [2.6, -0.42, -1.66],
            [2.6, -0.42, 1.66],
          ].map((position, index) => (
            <Wheel key={index} position={position as [number, number, number]} />
          ))}

          <mesh position={[-2.58, -0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 3.15, 12]} />
            <meshStandardMaterial color={STEEL} metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[2.58, -0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 3.15, 12]} />
            <meshStandardMaterial color={STEEL} metalness={0.8} roughness={0.3} />
          </mesh>

          <CompactMotor position={[-2.58, 0.08, 0]} />
          <CompactMotor position={[2.58, 0.08, 0]} signalColor />

          <mesh position={[2.58, 1.0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 1.15, 8]} />
            <meshBasicMaterial color={SIGNAL} />
          </mesh>
          <mesh position={[2.58, 1.58, 0]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshBasicMaterial color={SIGNAL} />
          </mesh>
        </group>
      </Float>
    </ScenePresence>
  );
}

function DriveUnitScene({ signal }: SceneProps) {
  const extracted = useRef<Group>(null);

  useFrame(() => {
    if (!extracted.current) return;
    const travel = smooth(0.55, 1.3, signal.current.progress);
    extracted.current.position.x = MathUtils.lerp(-1.6, 1.8, travel);
    extracted.current.rotation.y = MathUtils.lerp(0.18, -0.15, travel);
  });

  return (
    <ScenePresence signal={signal} index={1} position={[-1.8, -0.25, 0]}>
      <group position={[-3.2, -0.2, 0]}>
        <Wheel position={[-1.6, -0.25, -1.75]} />
        <Wheel position={[-1.6, -0.25, 1.75]} />
        <mesh position={[-1.6, -0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.11, 0.11, 3.2, 12]} />
          <meshStandardMaterial color={STEEL} metalness={0.8} roughness={0.3} />
        </mesh>
        <RoundedBox args={[3.1, 1.2, 3.2]} radius={0.34} position={[-1.6, 0.46, 0]}>
          <meshPhysicalMaterial
            color={GLASS}
            transmission={0.6}
            transparent
            opacity={0.08}
            depthWrite={false}
          />
        </RoundedBox>
      </group>

      <group ref={extracted} position={[-1.6, 0.2, 0]} scale={1.45}>
        <CompactMotor position={[0, 0, 0]} signalColor />
        <group position={[0.05, -0.02, 0.76]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.38, 0.52, 0.48, 24]} />
            <meshStandardMaterial color={STEEL} metalness={0.84} roughness={0.26} />
          </mesh>
          <mesh position={[0, 0.33, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.3, 20]} />
            <meshStandardMaterial color={STEEL_DARK} metalness={0.78} roughness={0.3} />
          </mesh>
        </group>
      </group>
      <mesh position={[0.2, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.018, 3.2, 8]} />
        <meshBasicMaterial color={SIGNAL} transparent opacity={0.7} />
      </mesh>
      <group position={[3.2, -1.35, 0]}>
        <mesh>
          <boxGeometry args={[2.1, 0.018, 0.018]} />
          <meshBasicMaterial color={SIGNAL} />
        </mesh>
        <mesh position={[-1.05, 0, 0]}>
          <boxGeometry args={[0.018, 0.18, 0.018]} />
          <meshBasicMaterial color={SIGNAL} />
        </mesh>
        <mesh position={[1.05, 0, 0]}>
          <boxGeometry args={[0.018, 0.18, 0.018]} />
          <meshBasicMaterial color={SIGNAL} />
        </mesh>
      </group>
    </ScenePresence>
  );
}

function Coil({
  angle,
  x,
  intensity = 1,
}: {
  angle: number;
  x: number;
  intensity?: number;
}) {
  const radius = 1.72;
  return (
    <group
      position={[x, Math.cos(angle) * radius, Math.sin(angle) * radius]}
      rotation={[angle, 0, 0]}
    >
      <mesh castShadow>
        <boxGeometry args={[0.58, 0.25, 0.65]} />
        <meshStandardMaterial
          color={intensity > 0.75 ? COPPER_BRIGHT : COPPER}
          metalness={0.72}
          roughness={0.26}
          emissive={new Color(COPPER).multiplyScalar(0.18 * intensity)}
        />
      </mesh>
      {Array.from({ length: 4 }).map((_, index) => (
        <mesh key={index} position={[0, 0.15 + index * 0.03, 0]}>
          <torusGeometry args={[0.22 + index * 0.045, 0.018, 6, 20]} />
          <meshStandardMaterial color={COPPER_BRIGHT} metalness={0.75} roughness={0.22} />
        </mesh>
      ))}
    </group>
  );
}

function ExplodedMotorScene({ signal }: SceneProps) {
  const housing = useRef<Group>(null);
  const bearing = useRef<Group>(null);
  const stator = useRef<Group>(null);
  const rotor = useRef<Group>(null);
  const magnets = useRef<Group>(null);
  const cap = useRef<Group>(null);

  useFrame(() => {
    const amount = smooth(1.36, 2.18, signal.current.progress);
    const targets: Array<[React.RefObject<Group | null>, number]> = [
      [housing, -3.45 * amount],
      [bearing, -2.15 * amount],
      [stator, -0.8 * amount],
      [rotor, 0.82 * amount],
      [magnets, 1.4 * amount],
      [cap, 3.45 * amount],
    ];
    targets.forEach(([ref, target]) => {
      if (ref.current) ref.current.position.x = MathUtils.lerp(ref.current.position.x, target, 0.1);
    });
  });

  return (
    <ScenePresence signal={signal} index={2} position={[1.15, 0.05, 0]}>
      <group rotation={[0.06, -0.42, -0.04]} scale={1.12}>
        <group ref={housing}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[2.25, 2.25, 0.58, 48, 1, true]} />
            <meshStandardMaterial color={STEEL} metalness={0.77} roughness={0.34} side={DoubleSide} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[1.82, 0.3, 12, 48]} />
            <meshStandardMaterial color={STEEL_DARK} metalness={0.7} roughness={0.4} />
          </mesh>
          {Array.from({ length: 12 }).map((_, index) => {
            const a = (index / 12) * Math.PI * 2;
            return (
              <mesh
                key={index}
                position={[0, Math.cos(a) * 2.2, Math.sin(a) * 2.2]}
                rotation={[a, 0, 0]}
              >
                <boxGeometry args={[0.62, 0.1, 0.38]} />
                <meshStandardMaterial color={STEEL} metalness={0.72} roughness={0.36} />
              </mesh>
            );
          })}
        </group>

        <group ref={bearing}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.62, 0.18, 12, 32]} />
            <meshStandardMaterial color="#c1c7c8" metalness={0.92} roughness={0.17} />
          </mesh>
          {Array.from({ length: 14 }).map((_, index) => {
            const angle = (index / 14) * Math.PI * 2;
            return (
              <mesh key={index} position={[0, Math.cos(angle) * 0.62, Math.sin(angle) * 0.62]}>
                <sphereGeometry args={[0.095, 12, 12]} />
                <meshStandardMaterial color="#d8dddd" metalness={0.95} roughness={0.12} />
              </mesh>
            );
          })}
        </group>

        <group ref={stator}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[1.72, 0.42, 24, 64]} />
            <meshStandardMaterial color={STEEL_DARK} metalness={0.62} roughness={0.42} />
          </mesh>
          {Array.from({ length: 18 }).map((_, index) => (
            <Coil key={index} angle={(index / 18) * Math.PI * 2} x={0} />
          ))}
        </group>

        <group ref={rotor}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[1.12, 1.12, 1.65, 48]} />
            <meshStandardMaterial color={STEEL_DARK} metalness={0.78} roughness={0.32} />
          </mesh>
          {Array.from({ length: 22 }).map((_, index) => (
            <mesh
              key={index}
              position={[-0.79 + index * 0.075, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <torusGeometry args={[1.13, 0.012, 4, 44]} />
              <meshBasicMaterial color="#a6adae" transparent opacity={0.5} />
            </mesh>
          ))}
        </group>

        <group ref={magnets}>
          {Array.from({ length: 8 }).map((_, index) => {
            const angle = (index / 8) * Math.PI * 2;
            return (
              <mesh
                key={index}
                position={[0, Math.cos(angle) * 0.76, Math.sin(angle) * 0.76]}
                rotation={[angle + Math.PI / 4, 0, 0]}
                castShadow
              >
                <boxGeometry args={[1.72, 0.18, 0.42]} />
                <meshStandardMaterial
                  color={SIGNAL}
                  metalness={0.42}
                  roughness={0.26}
                  emissive={new Color(SIGNAL).multiplyScalar(0.07)}
                />
              </mesh>
            );
          })}
        </group>

        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.22, 0.22, 7.3, 24]} />
          <meshStandardMaterial color="#aeb5b6" metalness={0.9} roughness={0.18} />
        </mesh>

        <group ref={cap}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[2.05, 2.05, 0.32, 40]} />
            <meshStandardMaterial color={STEEL} metalness={0.76} roughness={0.34} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.62, 0.14, 10, 30]} />
            <meshStandardMaterial color={STEEL_DARK} metalness={0.82} roughness={0.25} />
          </mesh>
        </group>
      </group>
    </ScenePresence>
  );
}

function FieldRibbon({
  radius,
  rotation,
}: {
  radius: number;
  rotation: number;
}) {
  return (
    <group rotation={[0, 0, rotation]}>
      <mesh>
        <torusGeometry args={[radius, 0.035, 8, 96, Math.PI * 1.48]} />
        <meshBasicMaterial
          color={SIGNAL}
          transparent
          opacity={0.62}
          blending={AdditiveBlending}
        />
      </mesh>
      <mesh rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[radius + 0.09, 0.018, 8, 96, Math.PI * 1.26]} />
        <meshBasicMaterial
          color={SIGNAL}
          transparent
          opacity={0.28}
          blending={AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function FieldScene({ signal }: SceneProps) {
  const rotor = useRef<Group>(null);
  const field = useRef<Group>(null);
  const angle = useRef(0);

  useFrame((_, delta) => {
    if (!signal.current.fieldPaused && !signal.current.reducedMotion) {
      angle.current += delta * 0.62;
    }
    const torqueLag = MathUtils.degToRad(4 + signal.current.load * 0.23);
    if (field.current) field.current.rotation.z = angle.current;
    if (rotor.current) rotor.current.rotation.z = angle.current - torqueLag;
  });

  return (
    <ScenePresence signal={signal} index={3} position={[2.05, -0.08, 0]}>
      <group scale={1.18} rotation={[-0.06, -0.04, 0]}>
        <mesh>
          <torusGeometry args={[2.12, 0.36, 20, 72]} />
          <meshStandardMaterial color={GRAPHITE_2} metalness={0.66} roughness={0.38} />
        </mesh>
        {Array.from({ length: 12 }).map((_, index) => {
          const angleValue = (index / 12) * Math.PI * 2;
          const phaseIntensity = 0.55 + Math.cos(angleValue * 3) * 0.35;
          return (
            <group
              key={index}
              position={[Math.cos(angleValue) * 1.92, Math.sin(angleValue) * 1.92, 0]}
              rotation={[0, 0, angleValue]}
            >
              <mesh>
                <boxGeometry args={[0.48, 0.28, 0.62]} />
                <meshStandardMaterial
                  color={phaseIntensity > 0.7 ? COPPER_BRIGHT : COPPER}
                  metalness={0.74}
                  roughness={0.25}
                  emissive={new Color(COPPER).multiplyScalar(phaseIntensity * 0.1)}
                />
              </mesh>
              {Array.from({ length: 5 }).map((__, coilIndex) => (
                <mesh key={coilIndex} position={[0, 0, 0.34 + coilIndex * 0.025]}>
                  <torusGeometry args={[0.17 + coilIndex * 0.025, 0.012, 5, 16]} />
                  <meshStandardMaterial color={COPPER_BRIGHT} metalness={0.8} roughness={0.2} />
                </mesh>
              ))}
            </group>
          );
        })}
        <group ref={field}>
          <FieldRibbon radius={1.44} rotation={0} />
          <mesh position={[1.42, 0, 0.08]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.12, 0.28, 10]} />
            <meshBasicMaterial color={SIGNAL} />
          </mesh>
        </group>
        <group ref={rotor}>
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.12, 1.12, 0.82, 48]} />
            <meshStandardMaterial color={STEEL_DARK} metalness={0.82} roughness={0.3} />
          </mesh>
          {Array.from({ length: 4 }).map((_, index) => {
            const a = (index / 4) * Math.PI * 2 + Math.PI / 4;
            return (
              <mesh
                key={index}
                position={[Math.cos(a) * 0.66, Math.sin(a) * 0.66, 0.44]}
                rotation={[0, 0, a]}
              >
                <boxGeometry args={[0.5, 0.22, 0.12]} />
                <meshStandardMaterial color={SIGNAL} metalness={0.42} roughness={0.26} />
              </mesh>
            );
          })}
          <mesh position={[0, 0, 1.15]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.19, 0.19, 2.3, 24]} />
            <meshStandardMaterial color="#b9c0c1" metalness={0.92} roughness={0.16} />
          </mesh>
        </group>
      </group>
    </ScenePresence>
  );
}

function MaterialScene({ signal }: SceneProps) {
  const magnets = useRef<Group>(null);
  const rotor = useRef<Group>(null);

  useFrame((state) => {
    if (magnets.current) {
      const active = stagePresence(signal.current.progress, 4);
      magnets.current.rotation.y = active * Math.sin(state.clock.elapsedTime * 0.32) * 0.06;
    }
    if (rotor.current && !signal.current.reducedMotion) {
      rotor.current.rotation.z += 0.0012;
    }
  });

  return (
    <ScenePresence signal={signal} index={4} position={[2.15, -0.15, 0]}>
      <group ref={rotor} position={[-0.7, 0.75, -0.7]} rotation={[-0.15, 0.22, -0.1]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.65, 1.65, 1.08, 48]} />
          <meshStandardMaterial color={STEEL_DARK} metalness={0.78} roughness={0.34} />
        </mesh>
        <mesh position={[0, 0, 0.75]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 2.4, 24]} />
          <meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.18} />
        </mesh>
        {Array.from({ length: 6 }).map((_, index) => {
          const a = (index / 6) * Math.PI * 2;
          return (
            <mesh
              key={index}
              position={[Math.cos(a) * 1.12, Math.sin(a) * 1.12, 0.58]}
              rotation={[0, 0, a]}
            >
              <boxGeometry args={[0.64, 0.2, 0.25]} />
              <meshStandardMaterial color={SIGNAL} metalness={0.4} roughness={0.25} />
            </mesh>
          );
        })}
      </group>

      <group ref={magnets} position={[1.05, -0.8, 0.55]} rotation={[0.05, -0.2, 0]}>
        {Array.from({ length: 8 }).map((_, index) => (
          <mesh
            key={index}
            position={[0.25 - index * 0.05, index * 0.17, 0]}
            rotation={[0, index * 0.018, 0.02]}
            castShadow
          >
            <boxGeometry args={[1.35, 0.14, 0.55]} />
            <meshStandardMaterial
              color={SIGNAL}
              metalness={0.38}
              roughness={0.25}
              emissive={new Color(SIGNAL).multiplyScalar(0.045)}
            />
          </mesh>
        ))}
      </group>

      <group position={[2.85, -0.7, 0.35]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.52, 0.48, 1.12, 40]} />
          <meshStandardMaterial color="#858e90" metalness={0.94} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.68, 0]}>
          <cylinderGeometry args={[0.25, 0.36, 0.28, 32]} />
          <meshStandardMaterial color="#a9b0b1" metalness={0.94} roughness={0.18} />
        </mesh>
        <mesh position={[0, 0.88, 0]}>
          <sphereGeometry args={[0.24, 24, 16]} />
          <meshStandardMaterial color="#a9b0b1" metalness={0.94} roughness={0.18} />
        </mesh>
      </group>
      <mesh position={[1.6, -1.6, 0]} receiveShadow>
        <boxGeometry args={[4.8, 0.08, 2.8]} />
        <meshStandardMaterial color={GRAPHITE} metalness={0.3} roughness={0.68} />
      </mesh>
    </ScenePresence>
  );
}

function PmsmRotor() {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.02, 1.02, 0.72, 40]} />
        <meshStandardMaterial color={STEEL_DARK} metalness={0.78} roughness={0.32} />
      </mesh>
      {Array.from({ length: 6 }).map((_, index) => {
        const angle = (index / 6) * Math.PI * 2;
        return (
          <mesh
            key={index}
            position={[Math.cos(angle) * 0.67, Math.sin(angle) * 0.67, 0.42]}
            rotation={[0, 0, angle]}
          >
            <boxGeometry args={[0.46, 0.17, 0.16]} />
            <meshStandardMaterial color={SIGNAL} metalness={0.4} roughness={0.26} />
          </mesh>
        );
      })}
    </group>
  );
}

function WoundRotor() {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.92, 0.92, 0.7, 32]} />
        <meshStandardMaterial color={STEEL_DARK} metalness={0.8} roughness={0.3} />
      </mesh>
      {Array.from({ length: 8 }).map((_, index) => {
        const angle = (index / 8) * Math.PI * 2;
        return (
          <group
            key={index}
            position={[Math.cos(angle) * 0.68, Math.sin(angle) * 0.68, 0.42]}
            rotation={[0, 0, angle]}
          >
            <mesh>
              <boxGeometry args={[0.45, 0.2, 0.15]} />
              <meshStandardMaterial color={COPPER_BRIGHT} metalness={0.76} roughness={0.22} />
            </mesh>
            <mesh position={[0, 0, 0.1]}>
              <torusGeometry args={[0.16, 0.035, 6, 18]} />
              <meshStandardMaterial color={COPPER} metalness={0.76} roughness={0.22} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function InductionRotor() {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.96, 0.96, 0.72, 40]} />
        <meshStandardMaterial color={STEEL_DARK} metalness={0.8} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0, 0.41]}>
        <torusGeometry args={[0.78, 0.08, 8, 40]} />
        <meshStandardMaterial color={COPPER} metalness={0.8} roughness={0.2} />
      </mesh>
      {Array.from({ length: 16 }).map((_, index) => {
        const angle = (index / 16) * Math.PI * 2;
        return (
          <mesh
            key={index}
            position={[Math.cos(angle) * 0.74, Math.sin(angle) * 0.74, 0.42]}
            rotation={[0, 0, angle]}
          >
            <boxGeometry args={[0.08, 0.12, 0.18]} />
            <meshStandardMaterial color={COPPER_BRIGHT} metalness={0.78} roughness={0.22} />
          </mesh>
        );
      })}
    </group>
  );
}

function SynRmRotor() {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.02, 1.02, 0.72, 40]} />
        <meshStandardMaterial color={STEEL_DARK} metalness={0.78} roughness={0.32} />
      </mesh>
      {[-0.48, -0.18, 0.18, 0.48].map((y, index) => (
        <mesh key={index} position={[0, y, 0.41]} scale={[1 - Math.abs(y) * 0.5, 1, 1]}>
          <boxGeometry args={[1.25, 0.13, 0.14]} />
          <meshStandardMaterial color="#0f1213" metalness={0.1} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function SrmRotor() {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.58, 0.58, 0.72, 32]} />
        <meshStandardMaterial color={STEEL_DARK} metalness={0.8} roughness={0.3} />
      </mesh>
      {Array.from({ length: 8 }).map((_, index) => {
        const angle = (index / 8) * Math.PI * 2;
        return (
          <mesh
            key={index}
            position={[Math.cos(angle) * 0.77, Math.sin(angle) * 0.77, 0]}
            rotation={[0, 0, angle]}
          >
            <boxGeometry args={[0.6, 0.24, 0.72]} />
            <meshStandardMaterial color={STEEL_DARK} metalness={0.8} roughness={0.3} />
          </mesh>
        );
      })}
    </group>
  );
}

const ROTOR_COMPONENTS: Record<AlternativeKey, () => React.JSX.Element> = {
  pmsm: PmsmRotor,
  wound: WoundRotor,
  induction: InductionRotor,
  synrm: SynRmRotor,
  srm: SrmRotor,
};

function AlternativesScene({ signal }: SceneProps) {
  const keys = Object.keys(ROTOR_COMPONENTS) as AlternativeKey[];
  const rotorRefs = useRef<Array<Group | null>>([]);
  const selectedIndex = keys.indexOf(signal.current.alternative);

  useFrame((_, delta) => {
    keys.forEach((key, index) => {
      const rotor = rotorRefs.current[index];
      if (!rotor) return;
      const isSelected = key === signal.current.alternative;
      rotor.position.y = MathUtils.lerp(rotor.position.y, isSelected ? 0.22 : -0.16, 0.1);
      rotor.position.z = MathUtils.lerp(rotor.position.z, isSelected ? 0.8 : 0, 0.1);
      const scale = isSelected ? 1.24 : 0.84;
      rotor.scale.lerp(new Vector3(scale, scale, scale), 0.1);
      if (!signal.current.reducedMotion) {
        rotor.rotation.z += delta * (isSelected ? 0.18 : 0.035);
      }
    });
  });

  return (
    <ScenePresence signal={signal} index={5} position={[0.35, 0.55, 0]}>
      <group rotation={[-0.28, 0.04, 0]}>
        {keys.map((key, index) => {
          const Rotor = ROTOR_COMPONENTS[key];
          const x = (index - 2) * 2.05;
          const z = -Math.abs(index - selectedIndex) * 0.18;
          return (
            <group
              key={key}
              ref={(node) => {
                rotorRefs.current[index] = node;
              }}
              position={[x, -0.1 + Math.abs(index - 2) * 0.12, z]}
            >
              <Rotor />
              <mesh position={[0, 0, -0.42]}>
                <cylinderGeometry args={[1.24, 1.24, 0.05, 48]} />
                <meshBasicMaterial
                  color={key === signal.current.alternative ? SIGNAL : "#4d5557"}
                  transparent
                  opacity={key === signal.current.alternative ? 0.44 : 0.12}
                />
              </mesh>
              <mesh position={[0, 0, 0.92]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.17, 0.17, 1.1, 20]} />
                <meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.18} />
              </mesh>
            </group>
          );
        })}
      </group>
    </ScenePresence>
  );
}

function Floor() {
  return (
    <>
      <mesh position={[0, -2.15, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color="#0d1011" metalness={0.28} roughness={0.72} />
      </mesh>
      <gridHelper
        args={[28, 28, "#22292b", "#171c1e"]}
        position={[0, -2.1, 0]}
        material-transparent
        material-opacity={0.16}
      />
    </>
  );
}

function StoryWorld({ signal }: SceneProps) {
  return (
    <>
      <CameraRig signal={signal} />
      <color attach="background" args={["#0b0d0e"]} />
      <fog attach="fog" args={["#0b0d0e", 13, 25]} />
      <ambientLight intensity={0.84} color="#c6d0d2" />
      <hemisphereLight args={["#dce6e8", "#090b0c", 2.2]} />
      <directionalLight
        castShadow
        position={[4, 8, 6]}
        intensity={4.3}
        color="#e6f0f0"
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-7, 2, 5]} intensity={2.4} color="#8ca3a8" />
      <pointLight position={[4, 0, 4]} intensity={18} distance={9} color={SIGNAL} />
      <pointLight position={[-3, 1, 4]} intensity={14} distance={8} color={COPPER} />

      <TransparentCar signal={signal} />
      <DriveUnitScene signal={signal} />
      <ExplodedMotorScene signal={signal} />
      <FieldScene signal={signal} />
      <MaterialScene signal={signal} />
      <AlternativesScene signal={signal} />
      <Floor />
    </>
  );
}

export function StoryCanvas({ signal, onReady }: StoryCanvasProps) {
  return (
    <div className="webgl-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, 1.65]}
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [1, 1.2, 13.5], fov: 34, near: 0.1, far: 60 }}
        onCreated={({ gl }) => {
          gl.setClearColor(new Color("#0b0d0e"), 1);
          onReady();
        }}
      >
        <StoryWorld signal={signal} />
      </Canvas>
    </div>
  );
}
