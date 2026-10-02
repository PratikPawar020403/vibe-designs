# Aura — Precision Espresso Engineering (`aur-fee`)

A high-craft, Awwwards-style interactive digital showcase for the Aura espresso machine and Veloce OS thermodynamic architecture.

## Highlights
- **Aura Boot Sequence:** Dynamic preloader with real-time percentage ramp and status transition (`WARMING` -> `BREWING` -> `EXTRACTING` -> `READY`).
- **Interactive Scrollytelling Hero:** Scroll-driven camera push-in with dynamic headline fade and interactive tactile hotspot overlays with real-time telemetry tooltips.
- **Veloce OS Interactive Feature Cycler:** 4-stage sticky scrollytelling exploring Temperature (Dual PID 93.5°C), Shot Time (24.2s), Rotary Pump Pressure (9.0 BAR), and Yield Curves.
- **Horizontal Engineering Detail Gallery:** Pinned scroll scrub showcasing the 58mm solid brass portafilter, machined aluminum dials, and commercial steam wand.
- **Sticky Technical Architecture Specs:** 2-column split with sticky hardware render and staggered metric reveals.
- **Kinetic Closing CTA:** Responsive hover-distorting reserve section with dynamic color threshold shifts.

## Tech Stack
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4
- **Animation:** Framer Motion (GPU-accelerated transforms & opacity, scroll-linked progress)
- **Icons:** Lucide React

## Local Development
```bash
# Navigate to project folder
cd aur-fee

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Netlify Deployment (Monorepo)
To deploy this project to Netlify from the `vibe-designs` repository:
1. Log into [Netlify](https://app.netlify.com/) and click **Add new site** > **Import an existing project**.
2. Select **GitHub** and authorize access to `PratikPawar020403/vibe-designs`.
3. In **Build settings**:
   - **Base directory:** `aur-fee`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Deploy site. Netlify will automatically detect and apply `aur-fee/netlify.toml`.
