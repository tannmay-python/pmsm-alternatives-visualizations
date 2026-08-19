import { useMemo } from "react";
import { claims } from "../content/claims";
import { sources } from "../content/sources";
import type { Stop } from "../route/route";

/**
 * Every stop carries its own evidence. A claim whose renderingPolicy is "hide"
 * never reaches the page, and one that is "show-with-condition" is shown with
 * its condition attached rather than as a bare fact.
 */
export function Evidence({ stop }: { stop: Stop }) {
  const shown = useMemo(() => {
    const byId = new Map(claims.map((claim) => [claim.id, claim]));
    return stop.claimIds
      .map((id) => byId.get(id))
      .filter((claim): claim is NonNullable<typeof claim> => Boolean(claim))
      .filter((claim) => claim.renderingPolicy !== "hide");
  }, [stop]);

  const sourceTitle = useMemo(() => {
    const map = new Map<string, string>(
      sources.map((source) => [source.id, source.organisation]),
    );
    return (id: string) => map.get(id) ?? id;
  }, []);

  if (shown.length === 0) return null;

  return (
    <details className="evidence">
      <summary>
        Evidence · {shown.length} claim{shown.length === 1 ? "" : "s"}
      </summary>
      <ul>
        {shown.map((claim) => (
          <li key={claim.id}>
            <span className={`tag tag--${claim.evidenceStatus}`}>{claim.evidenceStatus}</span>
            {claim.statement}
            {claim.quantitative && (
              <>
                {" "}
                <span className="num">
                  {claim.quantitative.value} {claim.quantitative.unit}
                </span>
                {claim.quantitative.denominator && ` — ${claim.quantitative.denominator}`}
              </>
            )}
            {claim.caveat && <> {claim.caveat}</>}
            {claim.conflict && <> Disagrees with the source report: {claim.conflict}</>}
            <br />
            <span style={{ opacity: 0.7 }}>
              {claim.sourceIds.map(sourceTitle).join(" · ")} · {claim.date}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}
