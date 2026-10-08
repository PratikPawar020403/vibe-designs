import React, { useState } from 'react';
import { MegtikLoader } from './components/MegtikLoader';
import { MegtikNavbar } from './components/MegtikNavbar';
import { MegtikEntrance } from './components/MegtikEntrance';
import { MegtikMenu } from './components/MegtikMenu';
import { MegtikProcess } from './components/MegtikProcess';
import { MegtikCombos } from './components/MegtikCombos';
import { MegtikFooter } from './components/MegtikFooter';

export const App: React.FC = () => {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [preloadProgress, setPreloadProgress] = useState<number>(0);

  return (
    <div className="megtik-app" id="top">
      {/* CREATIVE COFFEE MUG LOADING RITUAL (z-index: 9999, covers whole screen until ready) */}
      <MegtikLoader
        isReady={isReady}
        progressPercentage={preloadProgress}
      />

      {/* BRAND ONLY FLOATING NAVBAR */}
      <MegtikNavbar />

      {/* SECTION 01: Immersive Scroll-Reveal Entrance */}
      <MegtikEntrance
        totalFrames={183}
        framePattern="/frames/frame_%03d.webp"
        pinnedDistanceVh={400}
        onPreloadProgress={(percentage) => setPreloadProgress(percentage)}
        onInitialReady={() => setIsReady(true)}
      />

      {/* SECTION 02: MEGTIK Menu — Three-Card Interactive Composition */}
      <MegtikMenu />

      {/* SECTION 03: From Bean to Cup — Cinematic Editorial Process Film */}
      <MegtikProcess />

      {/* SECTION 04: Combos People Love — Curated Cafe Pairings Slider */}
      <MegtikCombos />

      {/* SECTION 05: MEGTIK Footer — Atmospheric Dusk Closing Scene */}
      <MegtikFooter />
    </div>
  );
};

export default App;
