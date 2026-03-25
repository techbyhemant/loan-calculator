# LastEMI Design System — Complete Dual-Tone Theme Specification

> **Purpose**: Single source of truth for every color, component, and token in the app.
> Paste this entire file into Claude Code when implementing the theme.
> After implementation, ZERO hardcoded colors should exist in any component file.

---

## 1. ARCHITECTURE OVERVIEW

```
globals.css (:root + .dark)     ← CSS custom properties (single source of truth)
    ↓
shadcn components (components/ui/)  ← consume CSS vars via Tailwind (bg-card, text-foreground, etc.)
    ↓
shared calc components (components/calculators/shared.tsx)  ← built on shadcn, re-export for calculators
    ↓
page components                  ← use ONLY shared components + shadcn, NEVER raw color classes
```

**Rules:**
- Components NEVER use raw Tailwind color classes (`bg-gray-50`, `text-gray-900`, `bg-white`)
- Components ONLY use semantic tokens (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`)
- The `.dark` class on `<html>` flips all tokens automatically — no `dark:` variants needed in components
- Chart.js colors read CSS variables at runtime via `getComputedStyle`

---

## 2. CSS CUSTOM PROPERTIES — THE COMPLETE TOKEN SET

All values are HSL (hue saturation% lightness%) without the `hsl()` wrapper — Tailwind v4 expects this format.

```css
:root {
  /* ── Layout Surfaces ─────────────────────────── */
  --background: 220 14% 97%;        /* Page bg: #F4F5F7 */
  --foreground: 224 71% 4%;         /* Default text: #0F172A */
  --card: 0 0% 100%;                /* Card/surface bg: #FFFFFF */
  --card-foreground: 224 71% 4%;    /* Card text: #0F172A */
  --popover: 0 0% 100%;             /* Popover bg */
  --popover-foreground: 224 71% 4%;

  /* ── Semantic Text ───────────────────────────── */
  --muted: 220 14% 96%;             /* Muted bg: #F1F3F7 */
  --muted-foreground: 220 9% 46%;   /* Secondary text: #6B7280 */

  /* ── Primary (Indigo) ────────────────────────── */
  --primary: 239 84% 67%;           /* #6366F1 */
  --primary-foreground: 0 0% 100%;  /* White */

  /* ── Secondary ───────────────────────────────── */
  --secondary: 220 14% 96%;         /* #F1F3F7 */
  --secondary-foreground: 224 71% 4%;

  /* ── Accent (hover bg for buttons/tabs) ──────── */
  --accent: 220 14% 96%;            /* #F1F3F7 */
  --accent-foreground: 239 84% 67%; /* Indigo text */

  /* ── Destructive ─────────────────────────────── */
  --destructive: 0 84% 60%;         /* #EF4444 */
  --destructive-foreground: 0 0% 100%;

  /* ── Borders & Inputs ────────────────────────── */
  --border: 220 13% 87%;            /* #DADDE3 */
  --input: 220 13% 87%;             /* Same as border */
  --ring: 239 84% 67%;              /* Indigo focus ring */

  /* ── Chart Colors ────────────────────────────── */
  --chart-1: 239 84% 67%;           /* Indigo (principal) */
  --chart-2: 38 92% 50%;            /* Amber (interest) */
  --chart-3: 160 84% 39%;           /* Emerald (positive) */
  --chart-4: 0 84% 60%;             /* Red (negative) */
  --chart-5: 271 91% 65%;           /* Violet */

  /* ── Sidebar ─────────────────────────────────── */
  --sidebar: 0 0% 100%;
  --sidebar-foreground: 224 71% 4%;
  --sidebar-primary: 239 84% 67%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 220 14% 96%;
  --sidebar-accent-foreground: 224 71% 4%;
  --sidebar-border: 220 13% 87%;
  --sidebar-ring: 239 84% 67%;

  /* ── Radius ──────────────────────────────────── */
  --radius: 0.5rem;

  /* ══ CUSTOM SEMANTIC TOKENS (non-shadcn) ══════ */

  /* Positive/Negative/Warning — for financial data */
  --positive: 160 84% 39%;          /* #10B981 — gains, savings, loan-paid% */
  --positive-foreground: 152 81% 96%; /* Light green text on dark bg */
  --negative: 0 84% 60%;            /* #EF4444 — losses, interest payable */
  --negative-foreground: 0 93% 94%; /* Light red text on dark bg */
  --warning: 38 92% 50%;            /* #F59E0B — interest in tables */
  --warning-foreground: 38 97% 89%; /* Light amber text on dark bg */

  /* Table-specific */
  --table-header: 220 14% 96%;      /* #F1F3F7 */
  --table-header-foreground: 220 9% 46%; /* #6B7280 */
  --table-alt: 220 14% 98%;         /* #F8F9FB — alternating rows */
  --table-hover: 220 14% 96%;       /* #F1F3F7 */
  --table-expanded: 239 100% 97%;   /* #EDEDFF — expanded year row */

  /* Pro feature */
  --pro: 239 84% 67%;               /* Indigo (same as primary) */
  --pro-foreground: 0 0% 100%;
  --pro-subtle: 239 100% 97%;       /* Light indigo bg */

  /* Slider */
  --slider-track: 220 13% 87%;      /* #DADDE3 */
  --slider-fill: 239 84% 67%;       /* Indigo */
  --slider-thumb: 239 84% 67%;

  /* Tag / Pill */
  --tag-active: 239 84% 67%;        /* Indigo bg */
  --tag-active-foreground: 0 0% 100%;
  --tag-inactive: 220 14% 96%;      /* #F1F3F7 */
  --tag-inactive-foreground: 220 9% 46%;
}

/* ═══════════════════════════════════════════════════
   DARK THEME
   ═══════════════════════════════════════════════════ */
.dark {
  /* ── Layout Surfaces ─────────────────────────── */
  --background: 228 24% 6%;         /* #0F1117 */
  --foreground: 225 20% 95%;        /* #F1F3F7 */
  --card: 228 18% 13%;              /* #1A1D27 */
  --card-foreground: 225 20% 95%;   /* #F1F3F7 */
  --popover: 228 18% 13%;
  --popover-foreground: 225 20% 95%;

  /* ── Semantic Text ───────────────────────────── */
  --muted: 228 14% 17%;             /* #242834 */
  --muted-foreground: 223 8% 55%;   /* #808898 */

  /* ── Primary (Indigo — brighter in dark) ─────── */
  --primary: 239 84% 67%;           /* #6366F1 */
  --primary-foreground: 0 0% 100%;

  /* ── Secondary ───────────────────────────────── */
  --secondary: 228 14% 17%;         /* #242834 */
  --secondary-foreground: 223 12% 75%; /* #A0A6B6 */

  /* ── Accent ──────────────────────────────────── */
  --accent: 228 14% 17%;            /* #242834 */
  --accent-foreground: 239 92% 82%; /* #A5B4FC */

  /* ── Destructive ─────────────────────────────── */
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;

  /* ── Borders & Inputs ────────────────────────── */
  --border: 225 10% 20%;            /* #2E3340 */
  --input: 228 14% 17%;             /* #242834 */
  --ring: 239 84% 67%;

  /* ── Chart Colors (brighter for dark bg) ─────── */
  --chart-1: 239 92% 82%;           /* #A5B4FC (light indigo) */
  --chart-2: 45 93% 56%;            /* #FBBF24 (bright amber) */
  --chart-3: 160 72% 51%;           /* #34D399 (bright emerald) */
  --chart-4: 0 91% 71%;             /* #F87171 (bright red) */
  --chart-5: 271 81% 76%;           /* #A78BFA (bright violet) */

  /* ── Sidebar ─────────────────────────────────── */
  --sidebar: 228 18% 13%;
  --sidebar-foreground: 225 20% 95%;
  --sidebar-primary: 239 84% 67%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 228 14% 17%;
  --sidebar-accent-foreground: 225 20% 95%;
  --sidebar-border: 225 10% 20%;
  --sidebar-ring: 239 84% 67%;

  /* ══ CUSTOM SEMANTIC TOKENS ═══════════════════ */

  --positive: 160 72% 51%;          /* #34D399 */
  --positive-foreground: 160 72% 51%;
  --negative: 0 84% 60%;            /* #EF4444 */
  --negative-foreground: 0 91% 71%; /* #F87171 */
  --warning: 45 93% 56%;            /* #FBBF24 */
  --warning-foreground: 45 93% 56%;

  --table-header: 228 16% 14%;      /* #1E2230 */
  --table-header-foreground: 223 8% 55%;
  --table-alt: 228 18% 13%;         /* #1A1D27 */
  --table-hover: 228 14% 17%;       /* #242834 */
  --table-expanded: 243 47% 13%;    /* #1E1B4B */

  --pro: 239 84% 67%;
  --pro-foreground: 0 0% 100%;
  --pro-subtle: 243 47% 13%;

  --slider-track: 225 10% 20%;      /* #2E3340 */
  --slider-fill: 239 84% 67%;
  --slider-thumb: 239 84% 67%;

  --tag-active: 239 84% 67%;
  --tag-active-foreground: 0 0% 100%;
  --tag-inactive: 228 14% 17%;      /* #242834 */
  --tag-inactive-foreground: 223 12% 75%; /* #A0A6B6 */
}
```

---

## 3. TAILWIND UTILITY MAPPING

Components should ONLY use these Tailwind classes for colors. Never use `bg-gray-*`, `text-gray-*`, `bg-white`, etc.

### Backgrounds
| Use case | Tailwind class | Light | Dark |
|----------|---------------|-------|------|
| Page background | `bg-background` | #F4F5F7 | #0F1117 |
| Card / surface | `bg-card` | #FFFFFF | #1A1D27 |
| Muted / input bg | `bg-muted` | #F1F3F7 | #242834 |
| Secondary surface | `bg-secondary` | #F1F3F7 | #242834 |
| Hover state | `bg-accent` | #F1F3F7 | #242834 |
| Primary button | `bg-primary` | #6366F1 | #6366F1 |
| Destructive | `bg-destructive` | #EF4444 | #EF4444 |
| Table header | `bg-[hsl(var(--table-header))]` | #F1F3F7 | #1E2230 |
| Table alt row | `bg-[hsl(var(--table-alt))]` | #F8F9FB | #1A1D27 |
| Table expanded | `bg-[hsl(var(--table-expanded))]` | #EDEDFF | #1E1B4B |
| Pro subtle | `bg-[hsl(var(--pro-subtle))]` | #F5F3FF | #1E1B4B |

### Text
| Use case | Tailwind class | Light | Dark |
|----------|---------------|-------|------|
| Primary text | `text-foreground` | #0F172A | #F1F3F7 |
| Card text | `text-card-foreground` | #0F172A | #F1F3F7 |
| Secondary text | `text-muted-foreground` | #6B7280 | #808898 |
| Primary button text | `text-primary-foreground` | #FFFFFF | #FFFFFF |
| Accent text (links) | `text-accent-foreground` | #6366F1 | #A5B4FC |
| Primary color text | `text-primary` | #6366F1 | #6366F1 |
| Positive value | `text-[hsl(var(--positive))]` | #10B981 | #34D399 |
| Negative value | `text-[hsl(var(--negative))]` | #EF4444 | #EF4444 |
| Warning value | `text-[hsl(var(--warning))]` | #F59E0B | #FBBF24 |

### Borders
| Use case | Tailwind class | Light | Dark |
|----------|---------------|-------|------|
| Default border | `border-border` | #DADDE3 | #2E3340 |
| Input border | `border-input` | #DADDE3 | #242834 |
| Table border | `border-border` | #DADDE3 | #2E3340 |

### Shadows
| Use case | Tailwind class |
|----------|---------------|
| Card | `shadow-sm` |
| Dropdown | `shadow-lg` |
| No shadow in dark | Add `dark:shadow-none` or let CSS override handle it |

---

## 4. COMPONENT INVENTORY & EXPECTED TOKEN USAGE

### shadcn components (components/ui/) — already token-based

| Component | Background | Text | Border | Notes |
|-----------|-----------|------|--------|-------|
| `Card` | `bg-card` | `text-card-foreground` | `border` (→ border-border) | Used by all calc components |
| `Button default` | `bg-primary` | `text-primary-foreground` | — | Active tabs, CTAs |
| `Button outline` | `bg-background` | — | `border` | Inactive tabs, secondary actions |
| `Button ghost` | transparent | — | — | Hover: `bg-accent` |
| `Button destructive` | `bg-destructive` | `text-white` | — | Delete actions |
| `Input` | `bg-transparent` | — | `border-input` | All text inputs |
| `Tabs` | — | — | — | Wraps TabsTrigger |
| `TabsTrigger` | uses active/inactive | — | — | Auto-styles via data-state |

### Shared calc components (components/calculators/shared.tsx)

| Component | Tokens to use |
|-----------|--------------|
| `CalcCard` | `Card` → auto |
| `CalcSection` | `Card + CardHeader + CardTitle` → auto |
| `StatCard` | `Card` bg, `text-muted-foreground` label, `text-foreground` value |
| `ToggleGroup` | `Button variant=default` (active), `Button variant=outline` (inactive) |
| `TableCard` | `Card` wrapper, `bg-muted/50` footer |
| `Verdict good` | `bg-[hsl(var(--positive))]/10 text-[hsl(var(--positive))] border-[hsl(var(--positive))]/20` |
| `Verdict bad` | `bg-[hsl(var(--negative))]/10 text-[hsl(var(--negative))] border-[hsl(var(--negative))]/20` |
| `Verdict neutral` | `bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/20` |
| `Callout info` | `bg-primary/5 border-primary/20 text-primary` |
| `Callout warning` | `bg-[hsl(var(--warning))]/10 border-[hsl(var(--warning))]/20 text-[hsl(var(--warning))]` |
| `Label` | `text-foreground` |

### Custom components to update

| Component | Current (broken) | Should be |
|-----------|-----------------|-----------|
| `Header` nav links | `text-gray-600`, `bg-gray-50` | `text-muted-foreground`, `bg-accent` |
| `Header` active link | `text-blue-700 bg-blue-50` | `text-primary bg-primary/10` |
| `Header` sign-in btn | `bg-blue-600 text-white` | `bg-primary text-primary-foreground` |
| `Footer` | `bg-white border-gray-200` | `bg-card border-border` |
| `Footer` headings | `text-gray-900` | `text-foreground` |
| `Footer` links | `text-gray-600` | `text-muted-foreground` |
| `ProGate` | `bg-purple-50 border-purple-200` | `bg-[hsl(var(--pro-subtle))] border-primary/20` |
| `ProGate` button | `bg-purple-600` | `bg-primary text-primary-foreground` |
| `CompactTabsToggle` active | `bg-emerald-700 text-white` | `bg-primary text-primary-foreground` |
| `CompactTabsToggle` inactive | `text-gray-600` | `text-muted-foreground` |
| `CompactTabsToggle` container | `bg-emerald-50 border-emerald-300` | `bg-muted border-border` |
| `DashboardShell` sidebar | Various grays | `bg-card`, `border-border`, `text-foreground` |
| `DashboardShell` active nav | `bg-blue-50 text-blue-700` | `bg-primary/10 text-primary` |
| `DashboardShell` inactive nav | `text-gray-700 hover:bg-gray-50` | `text-foreground hover:bg-accent` |
| `DashboardShell` user avatar | `bg-blue-100 text-blue-700` | `bg-primary/10 text-primary` |
| `Login` page bg | `bg-gray-50` | `bg-background` |
| `Login` card | `bg-white border-gray-100` | `bg-card border-border` |
| `Login` Google btn | `bg-white border-gray-300 text-gray-700` | `bg-card border-border text-foreground` |

### Calculator-specific components

| Component | Current | Should be |
|-----------|---------|-----------|
| `LoanCalculator` wrapper | `bg-[#F9FAFB]` → now `bg-gray-50` | `bg-background` |
| `LoanInputForm` heading | `text-gray-900` | `text-foreground` |
| `LoanInputForm` labels | `text-gray-700` | `text-foreground` or `text-muted-foreground` |
| `LoanInputForm` type tabs active | `bg-emerald-700 text-white` | `bg-primary text-primary-foreground` |
| `LoanInputForm` type tabs inactive | `text-gray-600` | `text-muted-foreground` |
| `LoanSummary` stat labels | `text-gray-500` | `text-muted-foreground` |
| `LoanSummary` EMI value | `text-gray-900` | `text-foreground` |
| `LoanSummary` interest value | `text-rose-600` | `text-[hsl(var(--negative))]` |
| `LoanSummary` total payment | `text-gray-900` | `text-foreground` |
| `AmortizationTable` header bg | `bg-white sticky` | `bg-card` |
| `AmortizationTable` year rows | `bg-emerald-50` | `bg-[hsl(var(--table-expanded))]` |
| `AmortizationTable` month rows | `bg-white hover:bg-gray-50` | `bg-background hover:bg-accent` |
| `AmortizationTable` borders | `border-zinc-200` | `border-border` |
| `AmortizationTable` principal | `text-emerald-600` (class) | `text-primary` or `text-[hsl(var(--chart-1))]` |
| `AmortizationTable` interest | `text-emerald-600` (class) | `text-[hsl(var(--warning))]` |
| `AmortizationTable` loan paid % | `text-emerald-500` (class) | `text-[hsl(var(--positive))]` |

### Charts (Chart.js — read CSS vars at runtime)

```typescript
// lib/hooks/useThemeColors.ts
export function useThemeColors() {
  const style = getComputedStyle(document.documentElement);
  const get = (v: string) => `hsl(${style.getPropertyValue(v).trim()})`;
  return {
    principal: get('--chart-1'),
    interest: get('--chart-2'),
    positive: get('--chart-3'),
    negative: get('--chart-4'),
    foreground: get('--foreground'),
    muted: get('--muted-foreground'),
    border: get('--border'),
    card: get('--card'),
  };
}
```

---

## 5. SLIDER STYLING

Sliders need custom CSS because `<input type="range">` can't be styled with Tailwind utilities alone.

```css
/* Use CSS variables — NOT hardcoded hex */
input[type="range"]::-webkit-slider-runnable-track {
  background: hsl(var(--slider-track));
  height: 6px;
  border-radius: 3px;
}
input[type="range"]::-webkit-slider-thumb {
  background: hsl(var(--slider-thumb));
  border: 2px solid hsl(var(--background));
  width: 20px;
  height: 20px;
  border-radius: 50%;
}
/* Filled portion — requires JS to set --slider-progress */
input[type="range"] {
  background: linear-gradient(
    to right,
    hsl(var(--slider-fill)) 0%,
    hsl(var(--slider-fill)) var(--slider-progress, 0%),
    hsl(var(--slider-track)) var(--slider-progress, 0%),
    hsl(var(--slider-track)) 100%
  );
}
```

---

## 6. WHAT TO DELETE AFTER IMPLEMENTATION

After all components use semantic tokens, remove from `globals.css`:

1. **ALL `.dark .bg-*` overrides** (lines 290+) — no longer needed
2. **ALL `.dark .text-*` overrides** — no longer needed
3. **ALL `.dark .border-*` overrides** — no longer needed
4. **ALL `.dark .hover\:*` overrides** — no longer needed
5. **ALL `.dark input, select, textarea` overrides** — shadcn Input handles it
6. **ALL `.dark .shadow-*` overrides** — shadcn Card handles it
7. The **entire dark mode section** (~180 lines of CSS) gets replaced by just the CSS variable `.dark { }` block

The result: **~200 lines of CSS removed**, replaced by **0 lines** because shadcn components read the CSS variables natively.

---

## 7. IMPLEMENTATION ORDER

1. Update `globals.css` — replace `:root` and `.dark` blocks with the tokens above
2. Update `components/calculators/shared.tsx` — replace all raw color classes with tokens
3. Update `components/ui/CompactTabsToggle.tsx` — use tokens
4. Update `components/ui/Header.tsx` — use tokens
5. Update `components/ui/Footer.tsx` — use tokens
6. Update `components/ui/ProGate.tsx` — use tokens
7. Update `app/dashboard/DashboardShell.tsx` — use tokens
8. Update `app/login/page.tsx` — use tokens
9. Update `features/loan-calculator/LoanCalculator.tsx` — use tokens
10. Update `features/loan-calculator/components/LoanInputForm.tsx` — use tokens
11. Update `features/loan-calculator/components/LoanSummary.tsx` — use tokens
12. Update `features/loan-calculator/AmortizationTable.tsx` — use tokens
13. Update `features/loan-calculator/charts/*.tsx` — use `useThemeColors()` hook
14. Update `app/rbi-rates/page.tsx` — use tokens
15. Update `app/pricing/PricingContent.tsx` — use tokens
16. Update `app/dashboard/page.tsx` — use tokens
17. Delete all `.dark .class` overrides from `globals.css`
18. Verify: `grep -rn "bg-gray-\|bg-white\|text-gray-\|border-gray-" --include="*.tsx" . | grep -v node_modules` returns 0 results

---

## 8. VERIFICATION CHECKLIST

After implementation, verify both themes:

### Light mode
- [ ] Page bg is soft gray (#F4F5F7), not pure white
- [ ] Cards are white with subtle border (#DADDE3)
- [ ] Primary buttons are indigo (#6366F1) with white text
- [ ] Active tabs are indigo with white text
- [ ] Inactive tabs are light gray with muted text
- [ ] Text hierarchy: primary (#0F172A) > secondary (#6B7280) > muted
- [ ] Borders are visible but subtle
- [ ] Table header row is slightly tinted
- [ ] Positive values are green, negative are red, interest is amber

### Dark mode
- [ ] Page bg is deep dark (#0F1117)
- [ ] Cards are #1A1D27 — clearly lighter than page
- [ ] Input fields are #242834 — clearly lighter than cards
- [ ] Primary text is #F1F3F7 — bright and readable
- [ ] Secondary text is #808898 — visible but muted
- [ ] Borders are #2E3340 — visible but subtle
- [ ] Primary buttons are indigo (#6366F1) — same as light mode
- [ ] Active tabs are indigo with white text
- [ ] Charts use brighter colors (#A5B4FC, #FBBF24, #34D399)
- [ ] No text is invisible or low-contrast
- [ ] Table expanded rows have indigo tint (#1E1B4B)
- [ ] Sliders: track is #2E3340, fill is #6366F1

### Both themes
- [ ] ZERO hardcoded hex colors in any .tsx file
- [ ] ZERO `bg-gray-*`, `text-gray-*`, `bg-white` in any component
- [ ] ZERO `.dark .class` overrides in globals.css (only CSS variables)
- [ ] ZERO `dark:` Tailwind variants in any component
- [ ] Theme toggle works instantly — all colors flip
- [ ] Charts re-render with correct colors on toggle
- [ ] All text meets WCAG AA contrast (4.5:1)
