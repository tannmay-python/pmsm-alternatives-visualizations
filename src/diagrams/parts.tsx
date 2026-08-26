/** Small shared SVG parts, so every diagram is built from the same vocabulary. */

export const Axes = ({
  x,
  y,
  w,
  h,
  xLabel,
  yLabel,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  xLabel: string;
  yLabel: string;
}) => (
  <g>
    <path className="d-axis" d={`M ${x} ${y} L ${x} ${y + h} L ${x + w} ${y + h}`} />
    <text className="d-axis-label" x={x + w} y={y + h + 18} textAnchor="end">
      {xLabel}
    </text>
    <text
      className="d-axis-label"
      x={-(y)}
      y={x - 12}
      textAnchor="end"
      transform="rotate(-90)"
    >
      {yLabel}
    </text>
  </g>
);

/** A horizontal proportion bar broken into named segments. */
export const SegmentBar = ({
  x,
  y,
  w,
  h,
  segments,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  segments: readonly { id: string; value: number; label: string; tone?: "accent" | "warn" | "mute" }[];
}) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  let cursor = x;
  return (
    <g>
      {segments.map((segment, index) => {
        const width = (segment.value / total) * w;
        // The final label would run off the right edge if it started at its
        // segment, and a narrow final segment has nowhere to start anyway.
        const last = index === segments.length - 1;
        const rect = (
          <g key={segment.id}>
            <rect
              className={`d-bar ${
                segment.tone === "accent"
                  ? "d-fill--accent"
                  : segment.tone === "warn"
                    ? "d-fill--warn"
                    : segment.tone === "mute"
                      ? "d-fill--mute"
                      : "d-fill"
              }`}
              x={cursor}
              y={y}
              width={Math.max(0, width - 2)}
              height={h}
            />
            <text
              className={`d-label ${segment.tone === "accent" ? "d-label--accent" : ""}`}
              x={last ? x + w : cursor}
              y={y + h + 16}
              textAnchor={last ? "end" : "start"}
            >
              {segment.label}
            </text>
          </g>
        );
        cursor += width;
        return rect;
      })}
    </g>
  );
};

/** A labelled leader line pointing at a coordinate, matching the 3D callouts. */
export const Leader = ({
  from,
  to,
  children,
  accent = false,
  anchor = "start",
}: {
  from: [number, number];
  to: [number, number];
  children: React.ReactNode;
  accent?: boolean;
  anchor?: "start" | "end" | "middle";
}) => (
  <g>
    <path className="d-rule" d={`M ${from[0]} ${from[1]} L ${to[0]} ${to[1]}`} />
    <circle className={accent ? "d-fill--accent" : "d-fill"} cx={from[0]} cy={from[1]} r={2.5} />
    <text
      className={`d-label ${accent ? "d-label--accent" : ""}`}
      x={to[0] + (anchor === "end" ? -6 : 6)}
      y={to[1] + 4}
      textAnchor={anchor}
    >
      {children}
    </text>
  </g>
);

/**
 * An annotation that points at the figure and says what to look at.
 *
 * The review's complaint about the old diagrams was that the explanation sat
 * beside the drawing in small type: "what's the point of having a
 * visualisation when you're writing on the side in some small font? Point it
 * out directly — put an arrow, put a dabba that comes out after that arrow,
 * have the text written."
 *
 * So this is a dot on the thing, a leader with an arrowhead, and a bordered
 * note at the end of it. Coordinates are SVG user units, same as the figure.
 */
export const Note = ({
  at,
  to,
  eyebrow,
  children,
  width = 190,
  tone = "accent",
}: {
  /** The point on the figure being pointed at. */
  at: [number, number];
  /** Where the note sits. */
  to: [number, number];
  eyebrow?: string;
  children: React.ReactNode;
  width?: number;
  tone?: "accent" | "mute";
}) => {
  const [x1, y1] = at;
  const [x2, y2] = to;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  // Stop the leader short of the note so the arrowhead has somewhere to sit.
  const headLength = 7;
  const hx = x2 - Math.cos(angle) * 4;
  const hy = y2 - Math.sin(angle) * 4;
  const spread = 0.42;
  const head = [
    `${hx} ${hy}`,
    `${hx - Math.cos(angle - spread) * headLength} ${hy - Math.sin(angle - spread) * headLength}`,
    `${hx - Math.cos(angle + spread) * headLength} ${hy - Math.sin(angle + spread) * headLength}`,
  ].join(" L ");
  // A note to the left of its anchor is right-aligned, so it reads inward.
  const flip = x2 < x1;

  return (
    <g className={`d-note d-note--${tone}`}>
      <path className="d-note__leader" d={`M ${x1} ${y1} L ${hx} ${hy}`} />
      <path className="d-note__head" d={`M ${head} Z`} />
      <circle className="d-note__dot" cx={x1} cy={y1} r={3} />
      <foreignObject
        x={flip ? x2 - width : x2}
        y={y2 - 13}
        width={width}
        height={130}
        style={{ overflow: "visible" }}
      >
        <div className={`d-note__box ${flip ? "is-flipped" : ""}`}>
          {eyebrow ? <span className="d-note__eyebrow">{eyebrow}</span> : null}
          <span className="d-note__text">{children}</span>
        </div>
      </foreignObject>
    </g>
  );
};
