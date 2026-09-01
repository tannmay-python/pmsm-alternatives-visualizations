/** Small shared SVG parts, so every diagram is built from the same vocabulary. */

export const Axes = ({
  x,
  y,
  w,
  h,
  xLabel,
  yLabel,
  /** Extra room under the axis when tick labels sit on the first row. */
  labelRow = 34,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  /**
   * Axis titles are optional, and usually unnecessary: where the tick labels
   * already carry the unit, the title only repeats them. It used to sit at
   * y + h + 18 anchored to the right edge — exactly where an end-anchored tick
   * like "90° (Peak Magnet)" lands — so every figure that had both drew them
   * on top of each other.
   */
  xLabel?: string;
  yLabel?: string;
  labelRow?: number;
}) => (
  <g>
    <path className="d-axis" d={`M ${x} ${y} L ${x} ${y + h} L ${x + w} ${y + h}`} />
    {xLabel ? (
      <text className="d-axis-label" x={x + w} y={y + h + labelRow} textAnchor="end">
        {xLabel}
      </text>
    ) : null}
    {yLabel ? (
      <text
        className="d-axis-label"
        x={-(y)}
        y={x - 12}
        textAnchor="end"
        transform="rotate(-90)"
      >
        {yLabel}
      </text>
    ) : null}
  </g>
);
