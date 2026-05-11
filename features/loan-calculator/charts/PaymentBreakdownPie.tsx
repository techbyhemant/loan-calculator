"use client";

import { useThemeColors } from "@/lib/hooks/useThemeColors";

/**
 * Two-slice pie chart for principal vs interest. Previously used
 * chart.js + react-chartjs-2 which pulled ~66KB into the homepage's
 * initial bundle (shared chunk with the bar/line charts). For two
 * slices it was vast overkill.
 *
 * This is pure SVG: two arc paths, computed once per render. No client
 * runtime cost beyond the arithmetic. The visual output matches the
 * previous chart.js version closely enough that users will not notice
 * the swap.
 *
 * If we ever need legend interactions or tooltips on hover, those can
 * be added incrementally without bringing chart.js back — the SVG paths
 * are just elements we can attach onMouseEnter / onClick to.
 */

export interface PaymentBreakdownPieProps {
  principal: number;
  interest: number;
}

// Geometry helpers for the pie slices. The SVG viewBox is 100x100 so
// coordinates here are independent of the actual rendered size — the
// CSS class (w-48 h-48) scales the rendered output.
const CENTER = 50;
const RADIUS = 45;

function polarToCartesian(angleRadians: number, radius: number): [number, number] {
  // SVG y-axis points down, so we negate sin to make 0° = top of circle.
  return [
    CENTER + radius * Math.sin(angleRadians),
    CENTER - radius * Math.cos(angleRadians),
  ];
}

function buildArcPath(startFrac: number, endFrac: number): string {
  // Special-case 100% slice — full circle requires two arcs (SVG won't
  // draw a 360° arc with a single A command, the start and end points
  // would coincide and the renderer skips it).
  if (endFrac - startFrac >= 1) {
    return `M ${CENTER - RADIUS} ${CENTER} A ${RADIUS} ${RADIUS} 0 1 0 ${CENTER + RADIUS} ${CENTER} A ${RADIUS} ${RADIUS} 0 1 0 ${CENTER - RADIUS} ${CENTER} Z`;
  }
  const startAngle = startFrac * 2 * Math.PI;
  const endAngle = endFrac * 2 * Math.PI;
  const [x1, y1] = polarToCartesian(startAngle, RADIUS);
  const [x2, y2] = polarToCartesian(endAngle, RADIUS);
  const largeArc = endFrac - startFrac > 0.5 ? 1 : 0;
  return `M ${CENTER} ${CENTER} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

export function PaymentBreakdownPie({
  principal,
  interest,
}: PaymentBreakdownPieProps) {
  const colors = useThemeColors();
  const total = principal + interest;

  // Guard against degenerate inputs (loan paid off, zero principal, etc.)
  // Render an empty grey circle rather than a NaN arc path.
  if (total <= 0) {
    return (
      <div
        className="w-48 h-48 mx-auto"
        role="img"
        aria-label="Payment breakdown — no data"
      />
    );
  }

  const principalFrac = principal / total;
  const principalPath = buildArcPath(0, principalFrac);
  const interestPath = buildArcPath(principalFrac, 1);

  return (
    <div
      className="w-48 h-48 mx-auto flex flex-col items-center"
      role="img"
      aria-label={`Payment breakdown: principal ${Math.round(principalFrac * 100)}%, interest ${Math.round((1 - principalFrac) * 100)}%`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-36 h-36"
        aria-hidden="true"
      >
        {/* Render the bigger slice first so the smaller one paints over
            its edge — avoids a 1-pixel anti-aliasing seam on the boundary */}
        {principalFrac >= 0.5 ? (
          <>
            <path d={principalPath} fill={colors.chart1} />
            <path d={interestPath} fill={colors.chart2} />
          </>
        ) : (
          <>
            <path d={interestPath} fill={colors.chart2} />
            <path d={principalPath} fill={colors.chart1} />
          </>
        )}
      </svg>
      {/* Legend — replaces chart.js's built-in legend. Kept as flex
          row of two label+swatch pairs to match the previous layout. */}
      <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: colors.mutedForeground }}>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block w-3 h-3 rounded-sm"
            style={{ backgroundColor: colors.chart1 }}
          />
          Principal
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block w-3 h-3 rounded-sm"
            style={{ backgroundColor: colors.chart2 }}
          />
          Interest
        </span>
      </div>
    </div>
  );
}
