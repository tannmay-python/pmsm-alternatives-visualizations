import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import "./RightHandRule.css";

/**
 * The right-hand grip rule, as a small 3D figure.
 *
 * It began as prose in the side panel, which the review threw out on exactly
 * that ground: "I also added the right-hand thumb rule stuff" — "see, that's
 * not helping. Show me the right hand." A rule about where your fingers go
 * cannot be read; it has to be seen, and it has to turn, because the whole
 * point is a relationship between two directions in space.
 *
 * Built from capsules in the same machined steel as the motor, so it reads as
 * a CAD mannequin rather than a cartoon. A flat drawing of a hand either looks
 * like an illustration from a different document or, worse, looks wrong; this
 * carries the piece's own material and lets the grip be understood by watching
 * it rotate.
 *
 * It is on the visualisation, not beside it, and only while the rule is being
 * explained: "I wanted it as an image on the visualisation, which goes away —
 * when you're explaining the right-hand thumb don't let it be there and click
 * next, something else should come."
 */

const STEEL = "#cdd0d8";
const STEEL_DARK = "#b6bac4";
const COPPER = "#c4763f";
const WINE = "#620d3c";

/** One phalanx, with the next joint hanging off its far end. */
function Bone({
  length,
  radius,
  curl,
  children,
}: {
  length: number;
  radius: number;
  /** Rotation at this joint, about the axis the fingers wrap around. */
  curl: number;
  children?: ReactNode;
}) {
  return (
    <group rotation={[0, curl, 0]}>
      <mesh position={[length / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <capsuleGeometry args={[radius, length, 6, 16]} />
        <meshStandardMaterial color={STEEL} roughness={0.52} metalness={0.28} />
      </mesh>
      <group position={[length, 0, 0]}>{children}</group>
    </group>
  );
}

/** Three phalanges, curling progressively — the grip comes from the joints. */
function Finger({
  position,
  scale = 1,
  radius = 0.062,
  curls = [-0.72, -0.92, -0.86],
}: {
  position: [number, number, number];
  scale?: number;
  radius?: number;
  curls?: [number, number, number];
}) {
  return (
    <group position={position}>
      <Bone length={0.34 * scale} radius={radius} curl={curls[0]}>
        <Bone length={0.26 * scale} radius={radius * 0.9} curl={curls[1]}>
          <Bone length={0.2 * scale} radius={radius * 0.8} curl={curls[2]} />
        </Bone>
      </Bone>
    </group>
  );
}

function Hand() {
  return (
    <group>
      {/* Back of the hand, just outside the coil. */}
      <RoundedBox args={[0.3, 0.68, 0.4]} radius={0.1} smoothness={4} position={[-0.62, 0, -0.2]}>
        <meshStandardMaterial color={STEEL} roughness={0.55} metalness={0.26} />
      </RoundedBox>

      {/* Wrist, so the hand does not read as a floating glove. */}
      <mesh position={[-0.94, -0.04, -0.24]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.16, 0.28, 6, 16]} />
        <meshStandardMaterial color={STEEL_DARK} roughness={0.6} metalness={0.24} />
      </mesh>

      {/*
        Four fingers, starting just in front of the coil and curling round it.
        Longest in the middle, and the curl is what does the teaching.
      */}
      <Finger position={[-0.44, 0.245, -0.16]} scale={0.98} />
      <Finger position={[-0.44, 0.085, -0.17]} scale={1.08} />
      <Finger position={[-0.44, -0.075, -0.17]} scale={1.02} />
      <Finger position={[-0.44, -0.23, -0.16]} scale={0.85} radius={0.052} />

      {/*
        The thumb is the whole point, so it is extended along the coil axis
        rather than tucked into the grip.
      */}
      <group position={[-0.6, 0.3, 0.02]} rotation={[0, 0, Math.PI / 2]}>
        <Bone length={0.26} radius={0.07} curl={0.1}>
          <Bone length={0.22} radius={0.06} curl={0.06} />
        </Bone>
      </group>
    </group>
  );
}

/** The coil the hand is gripping, and the axis coming out of its north end. */
function Coil() {
  return (
    <group>
      {[-0.42, -0.14, 0.14, 0.42].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.33, 0.035, 12, 44]} />
          <meshStandardMaterial color={COPPER} roughness={0.42} metalness={0.62} />
        </mesh>
      ))}

      {/* The axis: north out of the top, the direction the thumb gives you. */}
      <mesh position={[0, 0.92, 0]}>
        <cylinderGeometry args={[0.017, 0.017, 0.66, 12]} />
        <meshStandardMaterial color={WINE} roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[0, 1.32, 0]}>
        <coneGeometry args={[0.058, 0.16, 16]} />
        <meshStandardMaterial color={WINE} roughness={0.5} metalness={0.1} />
      </mesh>
    </group>
  );
}

function Rig({ spinning }: { spinning: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current || !spinning) return;
    // A slow oscillation rather than a full spin: the grip has a front, and
    // turning it all the way round hides the thumb half the time.
    // Biased positive: swinging negative would carry the hand behind the coil
    // and hide the grip, which is the one thing the figure exists to show.
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.38) * 0.26 + 0.2;
  });

  return (
    <group ref={group} position={[0.12, -0.16, 0]}>
      <Hand />
      <Coil />
    </group>
  );
}

export function RightHandRule({
  side,
  paused = false,
}: {
  side: "left" | "right";
  paused?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [lost, setLost] = useState(false);

  /*
   * This is the page's second WebGL context, so it is the more likely of the
   * two to be dropped when the browser is under pressure. Losing it should
   * cost the drawing, not the explanation.
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const onLost = (event: Event) => {
      event.preventDefault();
      setLost(true);
    };
    const onRestored = () => setLost(false);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    return () => {
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
    };
  }, [lost]);

  return (
    <figure className={`rhr rhr--${side === "left" ? "right" : "left"}`}>
      <figcaption className="rhr__head">
        <p className="eyebrow">How to read the field</p>
        <h3 className="rhr__title">The right-hand grip rule</h3>
        <p className="rhr__body">
          Curl the fingers of your <em>right</em> hand the way the current runs through a coil
          group. Your thumb then points to that group&rsquo;s north pole — the end the rotor magnet
          is pulled towards.
        </p>
      </figcaption>

      <div className="rhr__scene">
        <Canvas
          dpr={[1, 1.8]}
          camera={{ position: [1.15, 0.9, 2.95], fov: 36 }}
          gl={{ antialias: true }}
          onCreated={({ gl }) => {
            canvasRef.current = gl.domElement;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
          }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={1.1} />
            <directionalLight position={[-3, 4, 4]} intensity={1.8} />
            <directionalLight position={[3, 1, -2]} intensity={0.7} color="#e8eef6" />
            <hemisphereLight args={["#ffffff", "#c9ccd4", 0.7]} />
            <Rig spinning={!paused} />
          </Suspense>
        </Canvas>

        {lost ? (
          <p className="rhr__lost">
            Curl your fingers with the current; your thumb is the north pole.
          </p>
        ) : (
          <>
            <span className="rhr__tag rhr__tag--n">N</span>
            <span className="rhr__tag rhr__tag--current">current</span>
          </>
        )}
      </div>
    </figure>
  );
}
