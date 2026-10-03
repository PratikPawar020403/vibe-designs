# LABELIT — Precision Bottle Labeling

An Awwwards-caliber interactive luxury bottle packaging digital experience showcasing high-precision labeling, vessel architecture, and tactile brand engineering.

## Highlights
- **120-Frame Canvas Scrollytelling Journey**: Synchronized scroll engine scrubbing through the complete transformation from blank glass vessel to fully labeled, 24K gold foil finished bottle.
- **Dynamic Per-Frame Bottle Centering**: Portrait-friendly mobile framing tracking bottle centers in real-time coordinates.
- **3D Curved Vessel Architecture Gallery**: Built with WebGL & OGL (`ogl.mjs`), featuring smooth drag, wheel, touch, and full keyboard arrow/A-D navigation.
- **Methodology Pipeline**: Interactive 5-step accordion rail with ARIA APG compliance and arrow key navigation.
- **Idle GPU/CPU Optimization**: `IntersectionObserver` auto-pauses WebGL and canvas animation loops when sections are out of the viewport.
- **Agentic AI Web Accessibility**: Includes comprehensive `llms.txt` and `llms-full.txt` specifications.

## Local Development
```bash
# Using Vite
npm install
npm run dev

# Or with Python HTTP server
python -m http.server 8080
```

## Structure
```
labelit/
├── assets/
│   ├── bottles/            # Vessel gallery images
│   └── frames/             # 120-frame cinematic scrub sequence
├── css/                    # Modular stylesheet architecture
├── js/                     # Scrollytelling, WebGL, navigation, and animations
├── index.html              # Accessible, semantic entrypoint
├── llms.txt                # AI agent context
├── package.json
└── README.md
```
