export function reportWebVitals(metric: {
  name: string;
  value: number;
  id: string;
  label: string;
}) {
  if (process.env.NODE_ENV === "development") {
    const threshold: Record<string, number> = {
      LCP: 2500,
      INP: 200,
      CLS: 0.1,
      FCP: 1800,
      TTFB: 800,
    };
    const limit = threshold[metric.name];
    const status = limit && metric.value > limit ? "❌ FAIL" : "✅ PASS";
    console.log(`[CWV] ${status} ${metric.name}: ${metric.value}`);
  }
}
