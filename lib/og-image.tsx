import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * Shared OG image generator using LastEMI brand colors.
 * Brand: teal #0B7A8C (top circle) → mint #26C49A (bottom circle)
 * Dark bg: #0D1526
 */
export function generateOGImage(params: {
  title: string;
  subtitle?: string;
  badge?: string; // e.g. "Calculator", "Blog", "Guide"
}) {
  const { title, subtitle, badge } = params;

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0D1526 0%, #0B2A3C 50%, #0D1526 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        {/* Top: Badge + Logo area */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo mark — % symbol */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "linear-gradient(135deg, #0B7A8C, #26C49A)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 800,
                color: "white",
              }}
            >
              %
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "white", letterSpacing: "-0.5px" }}>
              LastEMI
            </div>
          </div>

          {/* Badge */}
          {badge && (
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#26C49A",
                background: "rgba(38, 196, 154, 0.15)",
                padding: "6px 16px",
                borderRadius: 20,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              {badge}
            </div>
          )}
        </div>

        {/* Center: Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1, justifyContent: "center" }}>
          <div
            style={{
              fontSize: title.length > 60 ? 40 : title.length > 40 ? 48 : 56,
              fontWeight: 800,
              color: "white",
              lineHeight: 1.2,
              letterSpacing: "-1px",
              maxWidth: "90%",
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 24,
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.4,
                maxWidth: "80%",
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* Bottom: URL + accent line */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 18, color: "rgba(255,255,255,0.4)" }}>
            lastemi.com
          </div>
          {/* Gradient accent line */}
          <div
            style={{
              width: 120,
              height: 4,
              borderRadius: 2,
              background: "linear-gradient(90deg, #0B7A8C, #26C49A)",
            }}
          />
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
