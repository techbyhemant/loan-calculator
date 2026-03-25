"use client";

import { useEffect, useState, useCallback } from "react";

export interface ThemeColors {
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  foreground: string;
  mutedForeground: string;
  border: string;
  card: string;
  background: string;
  primary: string;
  positive: string;
  negative: string;
  warning: string;
}

const SSR_DEFAULTS: ThemeColors = {
  chart1: "hsl(190 84% 30%)",
  chart2: "hsl(38 92% 50%)",
  chart3: "hsl(162 66% 46%)",
  chart4: "hsl(0 84% 60%)",
  chart5: "hsl(220 32% 45%)",
  foreground: "hsl(220 32% 11%)",
  mutedForeground: "hsl(215 10% 44%)",
  border: "hsl(215 13% 85%)",
  card: "hsl(0 0% 100%)",
  background: "hsl(220 14% 95%)",
  primary: "hsl(190 84% 30%)",
  positive: "hsl(162 66% 38%)",
  negative: "hsl(0 84% 60%)",
  warning: "hsl(38 92% 50%)",
};

function readColors(): ThemeColors {
  if (typeof window === "undefined") return SSR_DEFAULTS;
  const s = getComputedStyle(document.documentElement);
  const get = (v: string) => {
    const val = s.getPropertyValue(v).trim();
    return val ? `hsl(${val})` : "";
  };
  return {
    chart1: get("--chart-1"),
    chart2: get("--chart-2"),
    chart3: get("--chart-3"),
    chart4: get("--chart-4"),
    chart5: get("--chart-5"),
    foreground: get("--foreground"),
    mutedForeground: get("--muted-foreground"),
    border: get("--border"),
    card: get("--card"),
    background: get("--background"),
    primary: get("--primary"),
    positive: get("--positive"),
    negative: get("--negative"),
    warning: get("--warning"),
  };
}

export function useThemeColors(): ThemeColors {
  const [colors, setColors] = useState<ThemeColors>(SSR_DEFAULTS);

  const refresh = useCallback(() => setColors(readColors()), []);

  useEffect(() => {
    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [refresh]);

  return colors;
}
