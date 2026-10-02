import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion';

// --- Preloader (Aura Boot Sequence) ---
const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);

  const steps = [
    { pct: 0, word: "WARMING" },
    { pct: 33, word: "BREWING" },
    { pct: 66, word: "EXTRACTING" },
    { pct: 100, word: "READY." },
  ];

  useEffect(() => {
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps.length) {
        clearInterval(interval);
        setTimeout(onComplete, 800); // hold for a moment at 100%
      } else {
        setStep(currentStep);
      }
    }, 500); // smoothly change every 0.5s
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col items-center justify-center text-[#F9F8F6]"
    >
      {/* Top AURA logo */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 heading text-sm md:text-base tracking-[0.3em] uppercase opacity-50">
        Aura
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center w-full max-w-[200px] md:max-w-[280px]">
        {/* Percentage */}
        <div className="font-mono text-7xl md:text-9xl font-light tracking-tighter mb-4 w-full text-center transition-all">
          {steps[step].pct}%
        </div>
        
        {/* Word */}
        <div className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-white/50 mb-8 h-4 transition-all">
          {steps[step].word}
        </div>

        {/* Progress Line */}
        <div className="w-full h-[1px] bg-white/10 relative overflow-hidden">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-[#E54D24]" 
            animate={{ width: `${steps[step].pct === 0 ? 5 : steps[step].pct}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
};

// --- Custom Cursor Removed ---

// --- Scroll Fill Text ---
const ScrollFillText = ({ content, className = "" }: { content: {text: string, highlight?: boolean}[], className?: string }) => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 85%", "end 50%"]
  });

  const words = content.flatMap(c => 
    c.text.split(" ").filter(w => w.length > 0).map(w => ({ word: w, highlight: c.highlight }))
  );

  return (
    <p ref={container} className={`flex flex-wrap justify-center ${className}`}>
      {words.map((item, i) => {
        const start = i / words.length;
        const end = start + (1 / words.length);
        const opacity = useTransform(scrollYProgress, [start, end], [0.15, 1]);
        return (
          <motion.span 
            key={i} 
            style={{ opacity }} 
            className={`mr-[0.25em] ${item.highlight ? 'italic text-[#E54D24]' : ''}`}
          >
            {item.word}
          </motion.span>
        )
      })}
    </p>
  );
};

// --- Horizontal Scroll Gallery ---
const HorizontalGallery = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-66.66%"]);

  return (
    <section ref={targetRef} className="relative h-[300vh] mt-32">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden bg-[#0a0a0a] text-[#F9F8F6]">
        
        <motion.div style={{ x }} className="flex gap-12 px-12 md:px-32 items-center h-full mt-12">
          
          {/* Title Slide */}
          <div className="shrink-0 w-[40vw] md:w-[30vw] pr-12">
            <h2 className="heading text-5xl md:text-7xl uppercase tracking-tighter">
              Engineering <br/> <span className="text-[#E54D24] italic">Details.</span>
            </h2>
          </div>

          {/* Detail 1 */}
          <div className="w-[85vw] md:w-[60vw] h-[55vh] md:h-[65vh] shrink-0 relative overflow-hidden rounded-xl hover-target group shadow-2xl">
            <img src="/aura-portafilter.jpg" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s]" alt="Portafilter" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-12 pointer-events-none">
              <h3 className="heading text-5xl md:text-6xl uppercase tracking-tighter mb-4">Portafilter</h3>
              <p className="body-text text-lg opacity-80 max-w-md">Solid brass 58mm commercial-grade portafilter for optimal heat retention.</p>
            </div>
          </div>

          {/* Detail 2 */}
          <div className="w-[85vw] md:w-[60vw] h-[55vh] md:h-[65vh] shrink-0 relative overflow-hidden rounded-xl hover-target group shadow-2xl">
            <img src="/aura-dials.jpg" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s]" alt="Machine Controls" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-12 pointer-events-none">
              <h3 className="heading text-5xl md:text-6xl uppercase tracking-tighter mb-4">Tactile</h3>
              <p className="body-text text-lg opacity-80 max-w-md">Machined aluminum dials provide satisfying, granular control over steam pressure.</p>
            </div>
          </div>

          {/* Detail 3 */}
          <div className="w-[85vw] md:w-[60vw] h-[55vh] md:h-[65vh] shrink-0 relative overflow-hidden rounded-xl hover-target group shadow-2xl">
            <img src="/aura-steam.jpg" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s]" alt="Steam Wand" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-12 pointer-events-none">
              <h3 className="heading text-5xl md:text-6xl uppercase tracking-tighter mb-4">Power</h3>
              <p className="body-text text-lg opacity-80 max-w-md">Commercial-grade steam wand delivers microfoam perfection in seconds.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// --- Hotspot Tooltip ---
const Hotspot = ({ x, y, label, desc }: { x: string, y: string, label: string, desc: string }) => {
  return (
    <div className="absolute group pointer-events-auto z-50 -translate-x-1/2 -translate-y-1/2" style={{ top: y, left: x }}>
      {/* The Dot */}
      <div className="w-4 h-4 rounded-full bg-[#E54D24] border-2 border-white shadow-[0_0_15px_rgba(229,77,36,0.5)] cursor-pointer relative flex items-center justify-center">
        <div className="w-full h-full rounded-full animate-ping bg-[#E54D24] opacity-50 absolute" />
      </div>
      
      {/* The Tooltip */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none w-48 bg-black/85 backdrop-blur-md border border-white/10 p-3 rounded-md shadow-[0_8px_30px_rgba(0,0,0,0.8)] text-center">
        <div className="text-white text-xs font-bold uppercase tracking-widest mb-1 drop-shadow-md">{label}</div>
        <div className="text-white/95 text-[10px] leading-tight font-medium drop-shadow-sm">{desc}</div>
      </div>
    </div>
  )
};

// --- Scroll Scrubbed Hero ---
const HeroInteractive = () => {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: container, offset: ["start start", "end end"] });
  
  // Beat 1: Camera pushes in (scale from 1 to 1.3)
  const scale = useTransform(scrollYProgress, [0, 0.4], [1, 1.3], { clamp: true });
  
  // Beat 2: Headline fades out completely
  const titleOpacity = useTransform(scrollYProgress, [0.3, 0.5], [1, 0], { clamp: true });
  
  // Beat 3: Hotspots fade in
  const hotspotsOpacity = useTransform(scrollYProgress, [0.6, 0.8], [0, 1], { clamp: true });

  return (
    <section ref={container} className="relative h-[300vh] bg-[#0a0a0a]">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        
        {/* The Machine (Parallax) - Shifted Right */}
        <div className="absolute right-0 top-0 w-[100vw] md:w-[75vw] h-full overflow-hidden">
          <motion.img 
            style={{ scale }}
            src="/aura-hero.jpg"
            className="w-full h-full object-cover object-center origin-center"
            alt="Aura Espresso Machine"
          />
          {/* Seamless fade into the black left void */}
          <div className="absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none" />

          {/* Hotspots (Fades in) - Placed relative to the image */}
          <motion.div style={{ opacity: hotspotsOpacity }} className="absolute inset-0 pointer-events-none">
            {/* Top Center: Screen */}
            <Hotspot x="42%" y="17%" label="Veloce OS" desc="OLED display for real-time telemetry." />
            {/* Top Right: Dial */}
            <Hotspot x="64.5%" y="23%" label="Tactical Control" desc="Machined aluminum steam pressure dial." />
            {/* Bottom Left: Portafilter */}
            <Hotspot x="28%" y="55%" label="Group 1" desc="Solid brass 58mm commercial portafilter." />
            {/* Bottom Right: Second Group */}
            <Hotspot x="56%" y="55%" label="Group 2" desc="Secondary precision extraction head." />
          </motion.div>
        </div>

        {/* Gradients to frame the machine and text */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-[#0a0a0a]/80 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/30 pointer-events-none" />
        {/* Left side void for text */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent w-full md:w-[60%] pointer-events-none" />

        {/* Headline (Fades out) */}
        <motion.div style={{ opacity: titleOpacity }} className="absolute top-1/2 -translate-y-1/2 left-6 md:left-16 lg:left-24 z-20 max-w-sm md:max-w-md lg:max-w-lg">
          <h2 className="heading text-4xl md:text-5xl lg:text-6xl tracking-tighter uppercase leading-[0.95] text-[#F9F8F6]">
            The Absolute <br/> 
            <span className="italic text-[#E54D24]">Standard.</span>
          </h2>
          <div className="flex items-center gap-4 mt-8 opacity-60">
             <div className="w-8 md:w-12 h-[1px] bg-white" />
             <span className="text-[10px] md:text-xs text-white uppercase tracking-widest font-bold">Scroll to Explore</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

// --- Veloce OS Interactive Scrollytelling ---
const VeloceOSInteractive = () => {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: container, offset: ["start start", "end end"] });
  
  // 4 steps total: 0-0.25, 0.25-0.5, 0.5-0.75, 0.75-1.0
  const activeStep = useTransform(scrollYProgress, (v) => {
    if (v < 0.25) return 0;
    if (v < 0.5) return 1;
    if (v < 0.75) return 2;
    return 3;
  });
  
  const [step, setStep] = useState(0);
  useEffect(() => {
    return activeStep.on("change", (latest) => setStep(latest));
  }, [activeStep]);
  
  const steps = [
    {
      title: "Temperature",
      desc: "Dual PID controllers maintain 93.5°C with ±0.1°C variance.",
      ui: <div className="text-4xl md:text-5xl font-mono text-white tracking-tighter">93.5<span className="text-[#E54D24]">°C</span></div>,
      label: "BREW TEMP"
    },
    {
      title: "Shot Time",
      desc: "Integrated timer ensures exactly 24-second extractions.",
      ui: <div className="text-4xl md:text-5xl font-mono text-white tracking-tighter">24.2<span className="text-white/50 text-3xl">s</span></div>,
      label: "EXTRACTION"
    },
    {
      title: "Pressure",
      desc: "Real-time readouts of the 9 BAR commercial rotary pump.",
      ui: <div className="text-4xl md:text-5xl font-mono text-white tracking-tighter">9.0 <span className="text-xl text-white/50">BAR</span></div>,
      label: "PUMP PRESSURE"
    },
    {
      title: "Brew Profile",
      desc: "Visualize pre-infusion and ramp-down phases instantly.",
      ui: (
        <svg viewBox="0 0 100 50" className="w-32 md:w-48 h-16 md:h-24 overflow-visible">
          <path d="M0,50 L20,50 L30,10 L70,10 L90,50 L100,50" className="stroke-[#E54D24] stroke-2 fill-none" />
          <circle cx="70" cy="10" r="3" fill="#E54D24" />
        </svg>
      ),
      label: "YIELD CURVE"
    }
  ];

  return (
    <section ref={container} className="relative h-[400vh] bg-[#0a0a0a]">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center">
        
        {/* Full Bleed Background Panel */}
        <div className="absolute inset-0 z-0 flex items-center justify-center">
           <img src="/aura-panel.jpg" className="w-full h-full object-cover object-center" alt="Veloce Panel" />
           {/* Darken slightly to make UI pop, plus vignette */}
           <div className="absolute inset-0 bg-black/40" />
           <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/80 pointer-events-none" />
        </div>
        
        {/* The Screen Overlay */}
        <div 
          className="absolute z-10 flex items-center justify-center pointer-events-none" 
          style={{ 
            left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
            width: 'clamp(260px, 32vw, 380px)', height: 'clamp(160px, 20vw, 230px)'
          }}
        >
           <AnimatePresence mode="wait">
             <motion.div 
                key={step}
                initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.95 }}
                animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.05 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full flex flex-col items-center justify-center relative"
             >
                <div className="absolute top-4 text-[10px] text-white/50 tracking-[0.3em] uppercase font-mono">{steps[step].label}</div>
                {steps[step].ui}
             </motion.div>
           </AnimatePresence>
        </div>

        {/* The Text Explanation */}
        <div className="absolute bottom-12 md:bottom-24 w-full px-8 md:px-16 z-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
           <div>
             <h2 className="heading text-5xl md:text-7xl text-white uppercase tracking-tighter">Veloce <span className="italic text-[#E54D24]">OS.</span></h2>
             <div className="flex items-center gap-4 mt-4">
                <div className="w-8 h-[1px] bg-white/30" />
                <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold animate-pulse">Scroll to cycle features</span>
             </div>
           </div>
           
           <div className="text-left md:text-right max-w-sm">
             <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="heading text-2xl md:text-3xl text-white mb-2 uppercase tracking-tight">{steps[step].title}</h3>
                  <p className="body-text text-sm text-white/60 leading-relaxed">{steps[step].desc}</p>
                </motion.div>
             </AnimatePresence>
           </div>
        </div>

      </div>
    </section>
  )
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const footerRef = useRef(null);
  const isFooterInView = useInView(footerRef, { margin: "-10% 0px" });

  return (
    <div className="bg-[#F9F8F6] text-[#0a0a0a] min-h-screen font-sans selection:bg-[#E54D24] selection:text-white">
      <AnimatePresence>
        {loading && <Preloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>
      
      <style>{`
        @import url('https://fonts.cdnfonts.com/css/clash-display');
        @import url('https://fonts.cdnfonts.com/css/satoshi');
        .heading { font-family: 'Clash Display', sans-serif; }
        .body-text { font-family: 'Satoshi', sans-serif; }
      `}</style>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full p-8 md:p-12 flex justify-between items-center z-50 pointer-events-none transition-colors duration-700 ${isFooterInView ? 'text-[#0a0a0a]' : 'mix-blend-difference text-white'}`}>
        <div className="text-xl md:text-2xl font-bold tracking-tighter uppercase heading">Aura</div>
        <div className="uppercase tracking-widest text-[10px] md:text-xs font-bold hover:text-[#0a0a0a] transition-colors cursor-pointer border-b border-current pb-1 pointer-events-auto">
          Reserve Machine
        </div>
      </nav>

      {/* 1. Hero Section (Interactive Scrollytelling) */}
      <HeroInteractive />

      {/* 2. Intro Statement */}
      <section className="py-32 md:py-48 px-6 md:px-12 flex justify-center items-center max-w-5xl mx-auto text-center">
        <ScrollFillText 
          className="body-text text-3xl md:text-5xl leading-tight font-medium tracking-tight"
          content={[
            { text: "Aura is not just a coffee machine. It is a" },
            { text: "masterpiece of thermodynamic engineering.", highlight: true },
            { text: "We stripped away the superfluous to leave only pure performance." }
          ]} 
        />
      </section>

      {/* 3. The Digital Interface (Veloce OS Interactive) */}
      <VeloceOSInteractive />

      {/* 4. Horizontal Gallery (Machine Details) */}
      <HorizontalGallery />

      {/* 5. Specifications Grid (Engineering Details) */}
      <section className="py-32 px-6 md:px-12 bg-[#F9F8F6] relative">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
          
          {/* Sticky Engineering Image */}
          <div className="md:col-span-5 h-[50vh] md:h-[80vh] rounded-2xl overflow-hidden shadow-2xl relative md:sticky md:top-24">
            <motion.img 
              initial={{ scale: 1.1 }} whileInView={{ scale: 1 }} transition={{ duration: 1.5 }} viewport={{ once: true }}
              src="/aura-architecture.jpg" 
              className="w-full h-full object-cover" 
              alt="Engineering" 
            />
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
            <div className="absolute bottom-8 left-8 z-10">
               <div className="w-2 h-2 rounded-full bg-[#E54D24] animate-pulse mb-3" />
               <p className="text-white text-xs uppercase tracking-widest font-bold">Aura Core Architecture</p>
            </div>
          </div>
          
          {/* Scrolling Specs Grid */}
          <div className="md:col-span-7 flex flex-col justify-center py-12 md:pl-12">
            <h2 className="heading text-5xl md:text-7xl uppercase tracking-tighter mb-20 leading-[0.9]">
              Technical <br/>
              <span className="text-[#E54D24] italic">Specifications.</span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16">
              {[
                { label: 'Pump Pressure', val: '9 BAR', sub: 'Commercial Rotary' },
                { label: 'Thermal Stability', val: '± 0.1°C', sub: 'Dual PID Control' },
                { label: 'Warm-up Time', val: '3 SEC', sub: 'Instant Heat' },
                { label: 'Portafilter', val: '58 MM', sub: 'Solid Brass' },
                { label: 'Weight', val: '24 KG', sub: 'Machined Aluminum' },
                { label: 'Connectivity', val: 'Wi-Fi 6', sub: 'Veloce App Sync' },
                { label: 'Power', val: '2200 W', sub: '110V / 220V' },
                { label: 'Water Tank', val: '2.5 L', sub: 'Removable BPA-Free' }
              ].map((spec, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: (i % 2) * 0.1 }}
                  className="border-t border-[#0a0a0a]/20 pt-6"
                >
                  <div className="text-[10px] uppercase tracking-widest font-bold opacity-50 mb-2">{spec.label}</div>
                  <div className="heading text-5xl mb-2">{spec.val}</div>
                  <div className="body-text text-sm opacity-70 font-medium">{spec.sub}</div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 6. Designer Quote Break */}
      <section className="py-40 px-6 bg-[#0a0a0a] text-[#F9F8F6] flex justify-center text-center">
        <div className="max-w-4xl">
          <motion.div 
            initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1 }}
            className="w-16 h-[2px] bg-[#E54D24] mx-auto mb-12 origin-center"
          />
          <ScrollFillText 
            className="heading text-4xl md:text-6xl uppercase tracking-tighter leading-[1.1] mb-12"
            content={[
              { text: "\"We didn't just build a coffee machine. We engineered a surgical instrument for extracting the perfect shot.\"" }
            ]}
          />
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1 }} className="uppercase tracking-widest text-xs opacity-50">
            — Marcus Vance, Lead Industrial Designer
          </motion.p>
        </div>
      </section>

      {/* 7. Massive Footer CTA */}
      <section ref={footerRef} className="h-screen flex justify-center items-center overflow-hidden bg-[#E54D24] text-[#F9F8F6]">
        <div className="text-center group cursor-pointer hover-target p-20 hover:scale-105 transition-transform duration-700 ease-out">
          <h1 className="heading text-[12vw] leading-[0.75] tracking-tighter uppercase transition-colors duration-500 group-hover:text-[#0a0a0a]">
            Own <br/> <span className="italic font-light">The</span> <br/> Aura.
          </h1>
          <p className="mt-16 text-sm uppercase tracking-widest font-bold mix-blend-overlay">Reserve Now ↗</p>
        </div>
      </section>

    </div>
  );
}
