import { Html } from "@react-three/drei";

/**
 * A thin leader line to small type, as in design/references. The label never
 * sits on the part; it sits off to the side with a hairline pointing at it,
 * which is what keeps a detailed model readable.
 */
export function Callout({
  position,
  children,
  accent = false,
  side = "right",
}: {
  position: [number, number, number];
  children: React.ReactNode;
  accent?: boolean;
  side?: "left" | "right";
}) {
  return (
    // No distanceFactor: labels hold a constant on-screen size, so they stay
    // legible whether the camera is close on a rotor or pulled back for the
    // full exploded row.
    <Html position={position} center={false} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
      <div className={`callout callout--${side} ${accent ? "is-accent" : ""}`}>
        <span className="callout__dot" />
        <span className="callout__line" />
        <span className="callout__text">{children}</span>
      </div>
    </Html>
  );
}
