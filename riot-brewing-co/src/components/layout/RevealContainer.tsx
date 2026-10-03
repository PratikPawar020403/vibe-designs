"use client";

import { Product } from "@/lib/data/mock-schema";
import { TicketModule } from "@/components/ui/TicketModule";
import { ScrollVideoJourney } from "@/components/layout/ScrollVideoJourney";
import { ParticleText } from "@/components/ui/ParticleText";
import { clsx } from "clsx";
import { useEffect, useState, useRef } from "react";

interface RevealContainerProps {
  selectedProduct: Product | null;
  onCloseMobile: () => void;
}

export function HeroCanvas({ isMobile = false }: { isMobile?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  if (isMobile) {
    return (
      <div 
        ref={containerRef}
        className="w-full h-[48dvh] min-h-[320px] max-h-[420px] flex flex-col justify-between bg-paper-white text-ink-black relative border-b border-ink-black select-none overflow-hidden"
      >
        {/* Geometric Cubes Pattern on White Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: "url('/cubes.png')",
            backgroundRepeat: "repeat",
            filter: "invert(1)",
          }}
        />

        {/* Top Metadata */}
        <div className="w-full pt-4 px-4 font-mono text-[11px] text-ink-black/70 uppercase tracking-[0.2em] pointer-events-none z-20 flex items-center justify-center gap-2 whitespace-nowrap">
          <span className="w-1.5 h-1.5 bg-rani-pink inline-block animate-pulse" />
          <span>05 BEERS // 05 WORLDS</span>
        </div>

        {/* Center: Bold ParticleText Canvas */}
        <div className="w-full flex-1 flex items-center justify-center relative z-10 px-3 py-2">
          <ParticleText
            lines={[
              { text: "EXPLORE", color: "#0a0a0a" },
              { text: "THE", color: "#ff007f" },
              { text: "KINETIC", color: "#0022ff" },
              { text: "BAZAAR", color: "#0a0a0a" },
            ]}
            particleSize={2.8}
            density={2.8}
            color="#0a0a0a"
            highlightColor="#ff007f"
            scatter={75}
            gatherDuration={800}
            stagger={100}
            pointerRepel={35}
            repelRadius={80}
            idleDrift={0.12}
            trigger="mount"
            fontSize="clamp(3.0rem, 13vw, 4.8rem)"
            fontWeight={900}
            fontFamily="var(--font-clash), sans-serif"
            glow={false}
            className="w-full h-full"
          />
        </div>

        {/* Bottom Directional Prompt */}
        <div className="w-full pb-4 px-4 font-mono text-[11px] uppercase tracking-widest pointer-events-none z-20 text-center flex items-center justify-center gap-1.5 text-ink-black font-bold whitespace-nowrap">
          <span className="text-electric-blue">↓</span>
          <span>SELECT A PRODUCT TO BEGIN</span>
          <span className="text-electric-blue">↓</span>
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <div 
      className="hidden md:flex flex-col justify-between w-full h-full min-h-[calc(100vh-4rem)] bg-paper-white text-ink-black relative overflow-hidden select-none"
      ref={containerRef}
    >
      {/* Geometric Cubes Pattern on White Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: "url('/cubes.png')",
          backgroundRepeat: "repeat",
          filter: "invert(1)",
        }}
      />

      {/* Top Label */}
      <div className="w-full pt-8 px-8 font-mono text-xs text-ink-black/70 uppercase tracking-[0.25em] pointer-events-none z-20 flex items-center justify-center gap-2 whitespace-nowrap">
        <span className="w-1.5 h-1.5 bg-rani-pink inline-block animate-pulse" />
        <span>RIOT BREWING CO.</span>
      </div>
      
      {/* Center: ParticleText with Previous Color Configuration */}
      <div className="w-full flex-1 flex items-center justify-center relative z-10 px-8 py-4">
        <ParticleText
          lines={[
            { text: "EXPLORE", color: "#0a0a0a" },
            { text: "THE", color: "#ff007f" },
            { text: "KINETIC", color: "#0022ff" },
            { text: "BAZAAR", color: "#0a0a0a" },
          ]}
          particleSize={2.4}
          density={2.8}
          color="#0a0a0a"
          highlightColor="#ff007f"
          scatter={120}
          gatherDuration={800}
          stagger={160}
          pointerRepel={55}
          repelRadius={120}
          idleDrift={0.35}
          trigger="mount"
          fontSize="clamp(3.5rem, 8vw, 6.5rem)"
          fontWeight={900}
          fontFamily="var(--font-clash), sans-serif"
          glow={false}
          className="w-full h-full"
        />
      </div>
      
      {/* Bottom Metadata & Directional Prompt */}
      <div className="w-full pb-8 px-8 font-mono text-xs uppercase tracking-widest pointer-events-none z-20 text-center flex flex-col items-center gap-1 whitespace-nowrap">
        <div className="text-ink-black/50 tracking-[0.2em] text-xs">
          05 BEERS / 05 WORLDS
        </div>
        <div className="text-ink-black font-bold tracking-wider flex items-center gap-1 text-xs">
          <span>SELECT A PRODUCT TO BEGIN →</span>
        </div>
      </div>
    </div>
  );
}

export function RevealContainer({ selectedProduct, onCloseMobile }: RevealContainerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [bursts, setBursts] = useState<{id: number, x: number, y: number}[]>([]);
  const burstIdCounter = useRef(0);
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [jumpToProgress, setJumpToProgress] = useState<{ progress: number; key: number } | null>(null);

  useEffect(() => {
    if (selectedProduct) {
      setIsVisible(false);
      setActiveStageIdx(0);
      setJumpToProgress(null);
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [selectedProduct]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (selectedProduct?.editorialSteps) return; // Disable burst on editorial
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const id = burstIdCounter.current++;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setBursts(prev => [...prev, { id, x, y }]);
    
    setTimeout(() => {
      setBursts(prev => prev.filter(b => b.id !== id));
    }, 600);
  };

  if (!selectedProduct) {
    return <HeroCanvas isMobile={false} />;
  }

  // Combine primary and secondary visuals for the gallery
  const visuals = [selectedProduct.primaryVisual, ...(selectedProduct.secondaryVisuals || [])];

  return (
    <div className={clsx(
      "fixed inset-0 z-50 bg-paper-white overflow-y-auto flex flex-col",
      "md:relative md:inset-auto md:h-full md:flex-row md:overflow-hidden items-stretch",
      "transition-snappy transform",
      isVisible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
    )}>
      
      {/* Mobile Sticky Top Header with Back Button */}
      <div className="md:hidden sticky top-0 z-40 bg-paper-white border-b border-ink-black px-4 py-3 flex items-center justify-between shadow-sm">
        <button 
          type="button"
          className="bg-ink-black text-paper-white font-mono text-xs px-3 py-2 flex items-center gap-1.5 hover:bg-electric-blue active:bg-rani-pink transition-snappy cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,34,255,1)]"
          onClick={onCloseMobile}
        >
          <span>←</span> [BACK TO CATALOG]
        </button>
        <span className="font-mono text-xs uppercase tracking-wider text-ink-black font-bold truncate max-w-[150px]">
          {selectedProduct.name}
        </span>
      </div>

      {/* Main Visual Layer (Video Journey, Editorial, or Static Gallery) */}
      <div 
        ref={containerRef}
        className={clsx(
          "w-full md:flex-1 flex relative group items-center shrink-0 md:shrink",
          selectedProduct.videoJourney 
            ? "p-0 overflow-hidden border-b border-ink-black md:border-b-0" 
            : "p-4 sm:p-8 overflow-x-auto overflow-y-hidden snap-x snap-mandatory border-b border-ink-black md:border-b-0 h-[48dvh] min-h-[300px] md:h-full",
          !selectedProduct.editorialSteps && !selectedProduct.videoJourney && "cursor-pointer"
        )}
        onClick={!selectedProduct.videoJourney ? handleImageClick : undefined}
      >
        {selectedProduct.videoJourney ? (
          <ScrollVideoJourney
            key={selectedProduct.id}
            videoSrc={selectedProduct.videoJourney.src}
            mobileSrc={selectedProduct.videoJourney.mobileSrc}
            fallbackSrc={selectedProduct.videoJourney.fallbackSrc}
            posterSrc={selectedProduct.videoJourney.poster}
            fallbackVisual={selectedProduct.primaryVisual}
            productName={selectedProduct.name}
            maxTime={selectedProduct.videoJourney.maxTime}
            chapters={selectedProduct.videoJourney.chapters}
            trackLabel={selectedProduct.videoJourney.trackLabel}
            onBurst={handleImageClick}
            onStageChange={setActiveStageIdx}
            jumpToProgress={jumpToProgress}
          />
        ) : selectedProduct.editorialSteps ? (
          /* EDITORIAL STEPS RENDERING (HORIZONTAL) */
          <div className="flex h-full items-center gap-6 sm:gap-16 px-4 sm:px-8 w-max">
            {/* Intro Card */}
            <div className="flex-shrink-0 w-[80vw] sm:w-[85vw] md:w-[45vw] h-[36dvh] md:h-[70vh] relative snap-center border-4 border-ink-black shadow-[8px_8px_0_0_rgb(10,10,10)] md:shadow-[16px_16px_0_0_rgb(10,10,10)]">
               <img src={selectedProduct.primaryVisual} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" alt="Hero" />
               <div className="absolute inset-0 bg-ink-black/40 flex items-center justify-center p-4 sm:p-8">
                  <h2 className="font-display text-3xl sm:text-5xl md:text-7xl text-paper-white text-center uppercase tracking-tighter mix-blend-overlay">The Journey</h2>
               </div>
            </div>
            
            {/* Step Cards */}
            {selectedProduct.editorialSteps.map((step, idx) => (
              <div key={idx} className="flex-shrink-0 w-[80vw] sm:w-[85vw] md:w-[35vw] snap-center bg-paper-white p-4 sm:p-8 border-4 border-ink-black shadow-[8px_8px_0_0_rgb(0,34,255)] md:shadow-[12px_12px_0_0_rgb(0,34,255)] flex flex-col gap-4 sm:gap-6 transform transition-snappy hover:-translate-y-2 hover:shadow-[16px_16px_0_0_rgb(255,0,127)]">
                <div className="overflow-hidden border-2 border-ink-black h-40 sm:h-64 md:h-80 relative">
                  <img src={step.visual} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 hover:scale-105 transition-all duration-700 ease-out" alt={step.title} />
                </div>
                <div>
                  <h3 className="font-display text-2xl sm:text-4xl uppercase mb-1 sm:mb-2 text-ink-black">{step.title}</h3>
                  <p className="font-body text-sm sm:text-lg leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
            
            {/* Spacer for final scroll padding */}
            <div className="w-6 sm:w-8 flex-shrink-0" />
          </div>
        ) : (
          /* STANDARD PRODUCT GALLERY RENDERING */
          <div className="flex w-full h-full items-center">
            {visuals.map((vis, idx) => (
              <div key={idx} className="min-w-full h-full flex-shrink-0 flex items-center justify-center snap-center relative z-10 p-2 sm:p-4">
                <img 
                  src={vis} 
                  alt={`${selectedProduct.name} View ${idx + 1}`} 
                  loading="lazy"
                  decoding="async"
                  className="max-h-[35dvh] md:max-h-[85vh] max-w-full object-contain drop-shadow-2xl group-active:scale-[0.98] transition-transform duration-75"
                />{visuals.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {visuals.map((_, dotIdx) => (
                      <div key={dotIdx} className={clsx("w-2 h-2 rounded-full", dotIdx === idx ? "bg-ink-black" : "bg-ink-black/20")} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Kinetic Burst Elements (Active for Products and Video Journeys) */}
        {(selectedProduct.videoJourney || !selectedProduct.editorialSteps) && bursts.map(burst => {
          return Array.from({ length: 12 }).map((_, i) => {
            const angle = (Math.PI * 2 * i) / 12 + (Math.random() * 0.5);
            const distance = 50 + Math.random() * 100;
            const tx = `${Math.cos(angle) * distance}px`;
            const ty = `${Math.sin(angle) * distance}px`;
            const rot = `${Math.random() * 360}deg`;
            const isPink = Math.random() > 0.5;
            const shape = Math.random() > 0.5 ? 'rounded-full' : 'rounded-none';
            
            return (
              <div
                key={`${burst.id}-${i}`}
                className={clsx(
                  "absolute w-5 h-5 z-40 animate-burst pointer-events-none mix-blend-multiply",
                  isPink ? "bg-rani-pink" : "bg-electric-blue",
                  shape
                )}
                style={{
                  left: burst.x,
                  top: burst.y,
                  '--tx': tx,
                  '--ty': ty,
                  '--rot': rot,
                } as React.CSSProperties}
              />
            );
          });
        })}
      </div>

      {/* Detail Narrative, Process & Specifications Rail */}
      <div className="w-full md:w-[380px] lg:w-[420px] md:border-l border-ink-black p-5 lg:p-6 flex flex-col justify-between bg-paper-white overflow-y-visible md:overflow-y-auto shrink-0 pb-12 md:pb-6">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl uppercase leading-none mb-2 tracking-tight">
            {selectedProduct.name}
          </h1>
          {selectedProduct.description && (
            <p className="font-body text-xs sm:text-sm text-ink-black/75 mb-4 leading-relaxed">
              {selectedProduct.description}
            </p>
          )}

          {/* Curated Editorial Phases - Single-screen view with interactive click-to-jump */}
          {selectedProduct.editorialSteps && (
            <div className="space-y-1.5 border-t border-ink-black pt-3">
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink-black/50 flex justify-between items-center mb-1">
                <span>[PROCESS PHASES]</span>
                <span className="text-[9px] text-electric-blue font-bold tracking-wider">CLICK TO JUMP</span>
              </div>
              <div className="space-y-1.5">
                {selectedProduct.editorialSteps.map((step, idx) => {
                  const isActive = activeStageIdx === idx;
                  const chapterProgress = selectedProduct.videoJourney?.chapters?.[idx]?.targetProgress ?? (idx / selectedProduct.editorialSteps!.length);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setJumpToProgress({ progress: chapterProgress, key: Date.now() })}
                      className={clsx(
                        "w-full p-2.5 sm:p-2 border transition-all duration-150 text-left outline-none block select-none cursor-pointer",
                        isActive
                          ? "border-electric-blue bg-electric-blue/5 shadow-[2px_2px_0px_0px_rgba(0,34,255,1)]"
                          : "border-ink-black bg-paper-white hover:border-electric-blue hover:bg-ink-black/[0.02]"
                      )}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={clsx(
                          "font-mono text-[10px] font-bold uppercase tracking-wider",
                          isActive ? "text-electric-blue" : "text-ink-black"
                        )}>
                          {step.title}
                        </span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-electric-blue animate-pulse" />
                        )}
                      </div>
                      <p className="font-body text-[11px] leading-snug text-ink-black/75">
                        {step.text}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        {/* The Ticket / Spec Module */}
        {selectedProduct.specs && (
          <div className="mt-5 pt-4 border-t border-ink-black">
            <TicketModule specs={selectedProduct.specs} />
          </div>
        )}

        {/* Mobile Bottom Back Button so user doesn't have to scroll all the way back up */}
        <div className="md:hidden mt-8 pt-4 border-t border-ink-black/20">
          <button 
            type="button"
            onClick={onCloseMobile}
            className="w-full py-3.5 bg-ink-black text-paper-white font-mono text-xs uppercase tracking-wider font-bold hover:bg-electric-blue active:bg-rani-pink transition-snappy shadow-[4px_4px_0px_0px_rgba(0,34,255,1)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>←</span> [ BACK TO CATALOG ]
          </button>
        </div>
      </div>
    </div>
  );
}
