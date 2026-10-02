"use client";

import { useState, useRef } from "react";
import { clsx } from "clsx";

export function FooterCtaSection() {
  const [email, setEmail] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [isLocatorOpen, setIsLocatorOpen] = useState(false);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const burstIdCounter = useRef(0);

  const triggerBurst = (e: React.MouseEvent<HTMLElement> | { clientX: number; clientY: number }) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const id = burstIdCounter.current++;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setBursts((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
    }, 650);
  };

  const handleJoinSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || isJoined) return;

    // Trigger subtle kinetic burst at button location
    const submitBtn = (e.currentTarget.querySelector("button[type='submit']") || e.currentTarget) as HTMLElement;
    const btnRect = submitBtn.getBoundingClientRect();
    triggerBurst({
      clientX: btnRect.left + btnRect.width / 2,
      clientY: btnRect.top + btnRect.height / 2,
    });

    setIsJoined(true);
  };

  const handleFindClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerBurst(e);
    setIsLocatorOpen((prev) => !prev);
  };

  const marqueePhrases = [
    "DRINK SOMETHING INTERESTING",
    "FIND US NEAR YOU",
    "NEW BATCHES",
    "STAY THIRSTY",
  ];
  const marqueeUnits = Array(4).fill(marqueePhrases);

  return (
    <section 
      ref={containerRef}
      className="w-full bg-paper-white border-t border-ink-black text-ink-black relative overflow-hidden select-none"
      aria-label="Join the Crew and Store Locator"
    >
      {/* 
        01 — KINETIC MARQUEE
        Continuous seamless broadcast ticker with mechanical snappy motion
      */}
      <div className="overflow-hidden whitespace-nowrap bg-ink-black text-paper-white border-b border-ink-black py-3 sm:py-3.5 select-none flex">
        <div className="animate-marquee flex items-center">
          <div className="flex items-center shrink-0">
            {marqueeUnits.map((phrases, uIdx) => (
              <span key={`u1-${uIdx}`} className="flex items-center">
                {phrases.map((phrase: string, pIdx: number) => (
                  <span 
                    key={`p1-${uIdx}-${pIdx}`} 
                    className="font-mono text-xs sm:text-sm md:text-base font-bold uppercase tracking-widest flex items-center"
                  >
                    <span className="text-rani-pink mx-3 sm:mx-4">★</span>
                    <span>{phrase}</span>
                  </span>
                ))}
              </span>
            ))}
            <span className="text-rani-pink mx-3 sm:mx-4">★</span>
          </div>
          <div className="flex items-center shrink-0" aria-hidden="true">
            {marqueeUnits.map((phrases, uIdx) => (
              <span key={`u2-${uIdx}`} className="flex items-center">
                {phrases.map((phrase: string, pIdx: number) => (
                  <span 
                    key={`p2-${uIdx}-${pIdx}`} 
                    className="font-mono text-xs sm:text-sm md:text-base font-bold uppercase tracking-widest flex items-center"
                  >
                    <span className="text-rani-pink mx-3 sm:mx-4">★</span>
                    <span>{phrase}</span>
                  </span>
                ))}
              </span>
            ))}
            <span className="text-rani-pink mx-3 sm:mx-4">★</span>
          </div>
        </div>
      </div>

      {/* 
        02 — MAIN CTA GRID
        Strict 2-column desktop split, 1px borders, zero radius, hard shadows
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-ink-black">
        {/* LEFT COLUMN: 01 / JOIN THE CREW */}
        <div className="p-5 sm:p-10 lg:p-14 flex flex-col justify-between bg-paper-white relative">
          <div>
            {/* Technical Label */}
            <div className="font-mono text-xs uppercase tracking-widest text-ink-black/60 mb-5 sm:mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-electric-blue inline-block flex-shrink-0" />
              <span>01 / JOIN THE CREW</span>
            </div>

            {/* Headline */}
            <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-ink-black leading-none mb-4">
              JOIN THE CREW.
            </h2>

            {/* Supporting Copy */}
            <p className="font-body text-sm sm:text-lg text-ink-black/75 mb-6 sm:mb-8 leading-relaxed max-w-md">
              New beers. New drops. No boring updates.
            </p>
          </div>

          {/* Email Signup Interface */}
          <div className="max-w-md w-full">
            {!isJoined ? (
              <form onSubmit={handleJoinSubmit} className="w-full">
                <div className="flex flex-col sm:flex-row gap-0 border border-ink-black shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="YOUR EMAIL"
                    className="w-full min-w-0 flex-1 bg-paper-white px-4 py-3 sm:py-3.5 font-mono text-xs sm:text-sm uppercase tracking-wider text-ink-black placeholder:text-ink-black/40 outline-none border-b sm:border-b-0 sm:border-r border-ink-black focus:bg-ink-black/[0.02]"
                    aria-label="Email address"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 sm:py-3.5 bg-ink-black text-paper-white font-mono text-xs sm:text-sm uppercase tracking-wider font-bold hover:bg-electric-blue hover:text-paper-white active:bg-rani-pink transition-snappy whitespace-nowrap cursor-pointer text-center"
                  >
                    [ GET ME IN → ]
                  </button>
                </div>
              </form>
            ) : (
              <div className="border border-ink-black bg-paper-white p-4 shadow-[4px_4px_0px_0px_rgba(0,34,255,1)] flex items-center justify-between transition-snappy">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 bg-electric-blue inline-block animate-pulse" />
                  <span className="font-mono text-xs sm:text-sm font-bold text-ink-black uppercase tracking-wider">
                    {"[ CREW MEMBER // CONFIRMED ]"}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-ink-black/50 uppercase tracking-widest hidden sm:inline-block">
                  DISPATCH ACTIVE
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: 02 / FIND US */}
        <div className="p-5 sm:p-10 lg:p-14 flex flex-col justify-between bg-paper-white relative">
          <div>
            {/* Technical Label */}
            <div className="font-mono text-xs uppercase tracking-widest text-ink-black/60 mb-5 sm:mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-rani-pink inline-block flex-shrink-0" />
              <span>02 / FIND US</span>
            </div>

            {/* Headline */}
            <h2 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-ink-black leading-none mb-4 break-words">
              WE&apos;RE PROBABLY CLOSER THAN YOU THINK.
            </h2>

            {/* Supporting Copy */}
            <p className="font-body text-sm sm:text-lg text-ink-black/75 mb-6 sm:mb-8 leading-relaxed max-w-md">
              Find a cold one near you.
            </p>
          </div>

          {/* CTA & Radar Drawer */}
          <div className="max-w-md w-full">
            <button
              type="button"
              onClick={handleFindClick}
              className={clsx(
                "p-4 font-mono text-xs sm:text-sm uppercase tracking-wider font-bold border border-ink-black transition-snappy cursor-pointer inline-flex items-center gap-2",
                "shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[2px_2px_0px_0px_rgba(10,10,10,1)] active:translate-x-[2px] active:translate-y-[2px]",
                isLocatorOpen 
                  ? "bg-ink-black text-paper-white" 
                  : "bg-paper-white text-ink-black hover:bg-rani-pink hover:text-paper-white"
              )}
            >
              <span>[ FIND YOUR BEER → ]</span>
            </button>

            {/* Confident, honest locator dispatch drawer */}
            {isLocatorOpen && (
              <div className="mt-4 p-4 border border-ink-black bg-ink-black text-paper-white font-mono text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(255,0,127,1)] transition-snappy">
                <div className="flex items-center justify-between border-b border-paper-white/20 pb-2 mb-2.5">
                  <span className="text-rani-pink font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-rani-pink inline-block animate-pulse" />
                    {"[ STORE LOCATOR // IN DEVELOPMENT ]"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsLocatorOpen(false)}
                    className="text-paper-white/60 hover:text-paper-white text-[10px] cursor-pointer"
                  >
                    [CLOSE ×]
                  </button>
                </div>
                <p className="font-body normal-case text-paper-white/90 text-xs leading-relaxed mb-3">
                  Cold cans are currently distributed through select licensed craft bottle shops, gourmet food halls, and taprooms. Official GPS radar map coming online soon.
                </p>
                <div className="text-[10px] text-paper-white/60 tracking-widest font-mono">
                  ASK YOUR LOCAL RETAILER FOR BENGAL TIGER &amp; KINETIC BREW IPA.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 
        SECTION END — TECHNICAL SIGN-OFF
      */}
      <div className="w-full bg-paper-white py-4 px-6 sm:px-10 lg:px-14 border-t border-ink-black flex flex-col sm:flex-row items-center justify-between font-mono text-xs text-ink-black/60 uppercase tracking-widest gap-3">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Riot Brewing Co." className="h-6 w-auto object-contain shrink-0" />
          <span>{"[ END OF TRANSMISSION // KEEP IT COLD ]"}</span>
        </div>
        <span>© {new Date().getFullYear()} {"//"} RIOT BREWING CO.</span>
      </div>

      {/* Kinetic Confetti Bursts on interaction */}
      {bursts.map((burst) =>
        Array.from({ length: 12 }).map((_, i) => {
          const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.5;
          const distance = 40 + Math.random() * 90;
          const tx = `${Math.cos(angle) * distance}px`;
          const ty = `${Math.sin(angle) * distance}px`;
          const rot = `${Math.random() * 360}deg`;
          const isPink = Math.random() > 0.5;
          const shape = Math.random() > 0.5 ? "rounded-full" : "rounded-none";

          return (
            <div
              key={`${burst.id}-${i}`}
              className={clsx(
                "absolute w-4 h-4 z-50 animate-burst pointer-events-none mix-blend-multiply",
                isPink ? "bg-rani-pink" : "bg-electric-blue",
                shape
              )}
              style={
                {
                  left: burst.x,
                  top: burst.y,
                  "--tx": tx,
                  "--ty": ty,
                  "--rot": rot,
                } as React.CSSProperties
              }
            />
          );
        })
      )}
    </section>
  );
}
