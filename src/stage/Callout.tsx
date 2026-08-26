import { Html } from "@react-three/drei";

export type CalloutDirection =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

/**
 * A thin leader line to crisp small type, pinned directly to 3D world coordinates.
 * Dynamic directional anchoring prevents overlapping labels during 3D rotation.
 */
export function Callout({
  position,
  children,
  accent = false,
  direction,
  side,
  cardSide,
}: {
  position: [number, number, number];
  children: React.ReactNode;
  accent?: boolean;
  direction?: CalloutDirection;
  side?: "left" | "right";
  cardSide?: "left" | "right";
}) {
  const resolvedDirection: CalloutDirection =
    direction ??
    (side === "left" || (cardSide === "right" && !side) ? "left" : "right");

  return (
    <Html position={position} center zIndexRange={[100, 0]} style={{ pointerEvents: "none" }}>
      <div className={`callout callout--${resolvedDirection} ${accent ? "callout--accent" : ""}`}>
        <span className="callout__dot" />
        <span className="callout__stem" />
        <div className="callout__pill">{children}</div>
      </div>
    </Html>
  );
}
