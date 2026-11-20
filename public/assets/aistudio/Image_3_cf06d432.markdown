---
name: Atmospheric Intelligence
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bccac0'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#87948b'
  outline-variant: '#3d4a42'
  surface-tint: '#68dba9'
  primary: '#68dba9'
  on-primary: '#003825'
  primary-container: '#25a475'
  on-primary-container: '#00311f'
  inverse-primary: '#006c4a'
  secondary: '#6bd8cb'
  on-secondary: '#003732'
  secondary-container: '#29a195'
  on-secondary-container: '#00302b'
  tertiary: '#ffb3b6'
  on-tertiary: '#68001a'
  tertiary-container: '#ff5168'
  on-tertiary-container: '#5b0015'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#85f8c4'
  primary-fixed-dim: '#68dba9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005137'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffdada'
  tertiary-fixed-dim: '#ffb3b6'
  on-tertiary-fixed: '#40000c'
  on-tertiary-fixed-variant: '#920028'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 56px
    fontWeight: '800'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.75rem
  margin: 1.25rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system powers an AI-driven urban air quality monitoring and hyper-local smog defense platform built for community vigilance and personal respiratory health.

### Brand Personality & Emotional Impact
- **Vigilant & Authoritative:** Instills immediate confidence through precise environmental telemetry, clear risk scoring, and verified actionable advisories.
- **Protective & Human-Centric:** Balances technical sensor data with empathetic, family-first mitigation steps (e.g., child travel alerts, indoor air filtration automations).
- **Atmospheric & Crisp:** Visualizes invisible ambient factors through structured clarity, airy contrasts, and zero decorative clutter.

### Visual Direction
A hybrid of **Deep Slate Environmental Contrast** and **Targeted Functional Glassmorphism**. The visual hierarchy anchors around high-contrast deep slate canvases that eliminate outdoor glare and visual strain, paired with luminous emerald and cyan-teal purity accents. AQI thresholds borrow universally understood environmental semantics (emerald, amber, rose) calibrated strictly for WCAG 2.1 AA legibility across direct sunlight and dark screen environments.

## Colors

The palette simulates high-altitude atmospheric visibility. The default color mode is **dark** to minimize mobile OLED battery draw during persistent telemetry display and to maximize contrast against saturated AQI alerts.

### Palette Architecture
- **Primary (`#059669` - Emerald Pure):** Represents clean air states (AQI 0-50), successful air purifications, positive health trends, and primary interactive buttons.
- **Secondary (`#0D9488` - Cyan Teal):** Signifies telemetry metrics, active sensors, secondary actions, and micro-climate navigation nodes.
- **Tertiary & Hazard Spectrum:**
  - **Smog Critical / Hazardous (`#E11D48` - Atmospheric Rose):** Used for AQI > 150 alerts, immediate indoor shelter prompts, and emergency warnings.
  - **Smog Moderate / Sensitive Warning (`#F59E0B` - Solar Amber):** Denotes moderate air quality (AQI 51-100) and sensitive group cautions.
  - **Optimal Air Baseline (`#10B981` - Mint Purity):** Real-time trace telemetry highlights and sensor pulse states.
- **Neutral Canvas (`#0F172A` - Midnight Slate):** Ground base surface with `#1E293B` (Elevated Deep Slate) providing structure for telemetry modules and telemetry cards.

### Accessibility Protocols
All text pairings on `#0F172A` and `#1E293B` maintain a minimum 4.5:1 contrast ratio. AQI color shifts are never used in isolation; every hazardous or warning color indicator must be accompanied by an iconography cue and explicit numerical/textual AQI band labels.

## Typography

The typographic hierarchy relies on **Plus Jakarta Sans** for headlines and high-impact sensor figures, delivering approachable geometric modernism, balanced by **Inter** for dense sensor telemetry and diagnostic micro-copy.

### Typographic Principles
- **AQI Numerical Scale:** Giant numerical readings (e.g., "42 AQI") utilize `display-lg` / `display-lg-mobile` with tabular figures enabled to prevent layout jittering during real-time streaming updates.
- **Telemetry Readability:** Small metric labels (PM2.5, PM10, O3, NO2, VOC) require `label-sm` or `label-md` with upper-casing and positive letter spacing (`0.05em`) to ensure legibility when overlaid on live environmental satellite maps.
- **Hierarchy of Urgency:** Critical smog alerts adopt `headline-md` or `headline-sm` with semibold weight to cut through secondary ambient data.

## Layout & Spacing

The layout is built for fluid responsive mobile layouts anchored within an 8-point geometric rhythm (with a 4-point micro-scale).

### Screen Partitioning & Breakpoints
- **Mobile Handset (< 640px):** 4-column fluid layout with a base outer margin of `margin-mobile` (16px) and `gutter-sm` (12px). Quick-action floating widgets sit inside persistent bottom-safe telemetry docks.
- **Tablet / Split Dashboard (640px - 1024px):** 8-column layout with `margin` (20px) and `gutter` (16px). Dual-pane configuration separates regional satellite smog heatmaps from localized family profile metrics.
- **Desktop / Wall Telemetry Console (> 1024px):** 12-column layout centered at maximum 1280px container width.

### Flow & Density
- Metric cards sit strictly on 8px bounding boxes using `space-md` (16px) padding.
- Sensor clusters (PM2.5, humidity, pollen index) leverage compact 2-column or 3-column micro-grids separated by `space-sm` (8px).

## Elevation & Depth

Visual hierarchy uses **Glassmorphism telemetry panels layered over dark atmospheric foundations**, avoiding muddy dropshadows in favor of luminous backdrops and subtle luminescence.

### Elevation Architecture
1. **Base Tier (Ground Zero):** Solid `#0F172A`. Used for underlying map canvases, historical trends, and non-elevated dashboard backings.
2. **Surface Tier 1 (Module Panels):** `#1E293B` with 80% opacity and 12px backdrop blur (`backdrop-filter: blur(12px)`). Outlined with a 1px solid stroke of `rgba(255, 255, 255, 0.08)` to clearly define boundaries.
3. **Surface Tier 2 (Floating Alerts & Critical Cards):** `#1E293B` with 92% opacity, 1px stroke of `rgba(255, 255, 255, 0.15)`, and a subtle localized glow tinted by the active AQI category:
   - *Safe (AQI 0-50):* `0 8px 32px -4px rgba(5, 150, 105, 0.25)`
   - *Moderate (AQI 51-100):* `0 8px 32px -4px rgba(245, 158, 11, 0.25)`
   - *Hazardous (AQI 151+):* `0 8px 32px -4px rgba(225, 29, 72, 0.35)`
4. **Surface Tier 3 (Modals & Emergency Drawers):** `#0F172A` at 96% opacity with `24px` backdrop blur, floating above a dimmed overlay of `rgba(15, 23, 42, 0.8)`.

## Shapes

The design system enforces a **Level 2 (Rounded)** shape rhythm to project warmth, ergonomic comfort, and digital tactility without appearing toy-like.

### Geometry Guidelines
- **Standard Components (0.5rem / 8px):** Buttons, sensor tags, input fields, and metric micro-cards.
- **Containers & Panels (`rounded-lg` / 1rem / 16px):** Primary telemetry containers, family health profile cards, and radar map modules.
- **Overlays & Drawers (`rounded-xl` / 1.5rem / 24px):** Bottom action sheets, filter switchers, and full-screen diagnostic modals.
- **Pill Form Factors (Full Round):** Real-time AQI badge meters, live status chips, and filter toggles.

## Components

### Buttons
- **Primary:** Filled `#059669` (Emerald Pure) background with `#FFFFFF` text. Height of 48px on mobile for finger-tap ergonomics. Focused state generates a 2px offset ring in `#10B981`.
- **Secondary / Telemetry:** Frosted glass surface (`#1E293B` at 75% opacity) with a 1px border of `#0D9488` and `#0D9488` text.
- **Hazard Action:** `#E11D48` solid background with pure white text, reserved for smog escape routings and health warning triggers.

### Live AQI Badge Meters
- Capsule-shaped pills enclosing a pulsing live dot indicator (8px circle).
- Dynamic background changes according to data levels:
  - *Good:* `#059669` background with white text.
  - *Moderate:* `#F59E0B` background with `#0F172A` deep text for WCAG compliance.
  - *Unhealthy:* `#E11D48` background with white text.

### Telemetry & Metric Cards
- Standard layout: `rounded-lg` with surface blur and 1px border.
- Header row contains the pollutant indicator (`label-md` in muted gray) accompanied by an info tooltip.
- Body displays large numerical readings (`headline-lg`) aligned beside a mini sparkline chart showing the 6-hour trend.

### Input Fields
- Dark slate surface container (`rgba(30, 41, 59, 0.6)`) with 1px border of `rgba(255, 255, 255, 0.16)`.
- Active focus state: 2px ring using `#0D9488` (Cyan Teal) and an ambient border highlight.
- Clear error state: `#E11D48` ring accompanied by a persistent descriptive warning icon and error string.

### Selection Controls (Checkboxes & Radios)
- Custom 20px inputs with 4px border radius for checkboxes and full circular curvature for radios.
- Inactive: 1.5px border of `rgba(255, 255, 255, 0.3)` against dark background.
- Active: Solid `#059669` fill containing a crisp white vector checkmark or dot.

### Specialized Component: Family Member Smog Shield Card
- Compact interactive list card featuring a user avatar, sensitivity rating (e.g., "Asthma Alert"), and their current hyper-local exposure index.
- Edge highlights dynamically transition from emerald to amber or rose depending on individual member risk thresholds.