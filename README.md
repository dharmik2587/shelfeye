# ShelfForge Frontend

Immersive frontend-only experience for the AI-Powered Living Retail Nervous System.

## Stack

- Next.js 15 + React 19 + TypeScript strict
- Tailwind CSS 3.4+
- shadcn/ui primitives
- Framer Motion 11+
- three.js + @react-three/fiber + drei + postprocessing + rapier
- Zustand global Echo Engine state
- next-themes (dark default)

## Folder Structure

```txt
app/
  layout.tsx                     # Global shell + theme provider
  globals.css                    # 3D-aware design tokens, motion, glass, depth
  page.tsx                       # Redirects to /login
  login/page.tsx                 # Auth login with immersive 3D scene
  signup/page.tsx                # Auth signup with immersive 3D scene
  forgot-password/page.tsx       # Auth recovery flow
  dashboard/page.tsx             # Dashboard Pulse scene composition
  echo-canvas/page.tsx           # Hero immersive Echo Canvas
  analytics/page.tsx             # Analytics Flow
  tasks/page.tsx                 # Tasks Orbit
  settings/page.tsx              # Settings Core
components/
  2d/
    app-shell.tsx                # Persistent shell excluding auth routes
    holographic-top-bar.tsx      # AI search bar + echo particles
    auth-form-card.tsx           # Glassmorphic auth card + spring fields
    profile-orb-menu.tsx         # Holographic profile menu
    theme-orb-toggle.tsx         # Theme lighting control orb
    spring-counter.tsx           # KPI spring counter
    theme-provider.tsx           # next-themes provider wrapper
  3d/
    auth-background-scene.tsx    # Low-poly store auth background scene
    navigation-orb.tsx           # Floating holographic radial navigation orb
    echo-sphere-chatbot.tsx      # Persistent AI chatbot orb + panel + voice input
    scene-lights.tsx             # Shared cinematic lighting
    shelf-model.tsx              # Reusable shelf model with stock bars
    floating-greeting-3d.tsx     # Dashboard hero text scene
    kpi-arc-scene.tsx            # 3D KPI arc cards
    revenue-heatmap-scene.tsx    # 8x8 revenue tile lattice
    alerts-orb-stack.tsx         # Floating alert orb column
    engagement-terrain-scene.tsx # 3D engagement terrain + dwell clouds
    echo-canvas-scene.tsx        # Core immersive AI Canvas scene
    timeline-rail-3d.tsx         # Rapier-backed timeline rail
    analytics-flow-scene.tsx     # Dwell terrain + ribbon flow + funnel cones
    tasks-orbit-scene.tsx        # Orbiting task pins + shelf assignment
    settings-core-scene.tsx      # 3D settings controls + store carousel
  ui/
    button.tsx
    card.tsx
    input.tsx
    label.tsx
    separator.tsx
    dialog.tsx
    sheet.tsx
    tooltip.tsx
    dropdown-menu.tsx
lib/
  hooks/
    use-mobile.ts
    use-reduced-motion.ts
  realtime/
    use-supabase-echo-stream.ts  # Mock stream + Supabase-ready comments
  stores/
    echo-engine-store.ts          # Shared Zustand Echo Engine
  utils.ts
shaders/
  echo-trail-material.ts          # Custom shader material for Echo trails
public/
  textures/wood/
    wood-diffuse.jpg              # add your diffuse texture
    wood-normal.jpg               # add your normal texture
```

## How to Run This Masterpiece

1. Install dependencies:

```bash
npm install
```

2. Add texture files:

- Place `wood-diffuse.jpg` at `public/textures/wood/wood-diffuse.jpg`
- Place `wood-normal.jpg` at `public/textures/wood/wood-normal.jpg`

3. Start dev server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Supabase Realtime Hook (Commented Ready)

`lib/realtime/use-supabase-echo-stream.ts` already has the integration scaffold.

To activate:

1. Install `@supabase/supabase-js`
2. Create client in `lib/supabase/client.ts`
3. Replace interval pulse with channel subscription
4. Dispatch store updates via `useEchoEngineStore.getState()` actions

## Notes

- Mobile gracefully degrades to lightweight 2D projections.
- Dynamic announcements are exposed with `aria-live` in the shell.
- Particle count is capped (<1200) and heavy scenes are suspended.
