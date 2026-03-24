import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "LastEMI — India's Honest Debt Freedom Platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "white",
            marginBottom: 16,
            letterSpacing: "-2px",
          }}
        >
          LastEMI
        </div>
        <div
          style={{
            fontSize: 32,
            color: "rgba(255,255,255,0.9)",
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          India&apos;s Honest Debt Freedom Platform
        </div>
        <div
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.7)",
            marginTop: 24,
            textAlign: "center",
          }}
        >
          EMI Calculators &bull; Payoff Planner &bull; Debt-Free Date Tracker
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 18,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          lastemi.com
        </div>
      </div>
    ),
    { ...size }
  );
}
