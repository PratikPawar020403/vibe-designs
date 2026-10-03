// Aurelia Villas - Production Client Bundle
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;

const $=id=>document.getElementById(id),cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));

if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/* ========================================================
   CINEMATIC HERO FRAME SEQUENCE ENGINE (CANVAS 60FPS)
   ======================================================== */
const hero=$('hero'),stage=$('stage'),room=$('room');
const heroCanvasLight=$('heroCanvasLight');
const heroCanvasNight=$('heroCanvasNight');
let heroCtxLight=heroCanvasLight?heroCanvasLight.getContext('2d',{alpha:false}):null;
let heroCtxNight=heroCanvasNight?heroCanvasNight.getContext('2d',{alpha:false}):null;
const heroVidLight=$('heroVidLight'),heroVidNight=$('heroVidNight');
const heroStillLight=$('heroStillLight'),heroStillNight=$('heroStillNight');

const THEME_STORAGE_KEY = 'aurelia-theme-mode';

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'night' || saved === 'day') return saved;
  } catch (e) {}
  return (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'night' : 'day';
}

let heroOpeningMode = getInitialTheme();
let heroBaseProgress = 0;

/* ========================================================
   AURELIA BLOSSOM LOADER SYSTEM
   ======================================================== */
let heroReadySignaled=false;
function signalHeroReady(){
  if(heroReadySignaled)return;
  heroReadySignaled=true;
  if(window.AureliaLoader&&typeof window.AureliaLoader.ready==='function'){
    window.AureliaLoader.ready();
  }
}
setTimeout(()=>{signalHeroReady();},8000);

const AureliaLoader=(()=>{
  const NS='http://www.w3.org/2000/svg',reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,k=reduce?.4:1;
  const mulberry=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
  let tl,sway,falling=[],heroReady=false,minTime=false,released=false;
  const mk=(tag,at,parent)=>{const e=document.createElementNS(NS,tag);for(const a in at)e.setAttribute(a,at[a]);parent.appendChild(e);return e};
  const pen=(el)=>{el.setAttribute('pathLength',1);el.style.strokeDasharray=1;el.style.strokeDashoffset=1};

  function build(){
    const rng=mulberry(11),J=a=>(rng()-.5)*2*a;
    const g=document.getElementById('al-g');if(!g)return;g.innerHTML='';
    tl=gsap.timeline({onComplete:()=>{minTime=true;release();}});
    const stem=mk('path',{class:'stem',d:'M80 264 C72 208 92 162 80 120 C72 90 82 64 84 42'},g);pen(stem);
    const L=stem.getTotalLength(),tS=s=>(.1+.8*s)*k;
    const at=(s)=>{const l=s*L,p=stem.getPointAtLength(l),a=stem.getPointAtLength(Math.min(L,l+1)),b=stem.getPointAtLength(Math.max(0,l-1));return{x:p.x,y:p.y,ang:Math.atan2(a.y-b.y,a.x-b.x)*180/Math.PI}};
    tl.to(stem,{strokeDashoffset:0,duration:.8*k,ease:'sine.inOut'},.1*k);

    /* leaves: six, evenly spaced up the lower stem, each drawn by a slightly different hand */
    for(let i=0;i<6;i++){
      const s=.14+i*.1,P=at(s),side=i%2?-1:1,size=.95-.32*i/5,tip=32+J(2),w1=10+J(1.5),w2=10+J(1.5);
      const lg=mk('g',{},g);
      const leaf=mk('path',{class:'leaf',d:`M0 0 C${6+J(1.5)} ${-w1} ${20+J(2)} ${-w1-J(1)} ${tip} ${J(1)} C${20+J(2)} ${w2+J(1)} ${6+J(1.5)} ${w2} -1.4 .8`},lg);
      const rib=mk('path',{class:'rib',d:`M2 ${J(.4)} Q${15+J(2)} ${J(1.6)} ${tip-5} ${J(.5)}`},lg);
      pen(leaf);pen(rib);leaf.style.strokeWidth=.7+rng()*.3;
      gsap.set(lg,{x:P.x,y:P.y,rotation:P.ang+side*(50+J(5)),scale:size,transformOrigin:'0% 50%'});
      gsap.set(leaf,{fillOpacity:0});
      const t=tS(s)+.1*k;
      tl.to(leaf,{strokeDashoffset:0,duration:.6*k,ease:'sine.inOut'},t)
        .to(rib,{strokeDashoffset:0,duration:.35*k,ease:'sine.inOut'},t+.4*k)
        .to(leaf,{fillOpacity:1,duration:.5*k,ease:'sine.out'},t+.45*k);
    }

    /* blossom: five outer + five inner hand-inked petals, stamens in the heart */
    function blossom(cx,cy,sc,rot,t){
      const b=mk('g',{},g);gsap.set(b,{x:cx,y:cy,scale:sc,rotation:rot});
      const petal=(len,w,a,delay)=>{
        const p=mk('path',{class:'petal',d:`M0 0 C${len*.2} ${-w} ${len*.72+J(1)} ${-w*1.12} ${len} ${J(.9)} C${len*.78} ${w*1.05+J(1)} ${len*.25} ${w*.9} -.8 .5`},b);
        pen(p);gsap.set(p,{rotation:a-16,scale:.2,fillOpacity:0,transformOrigin:'0% 50%'});
        tl.to(p,{rotation:a,scale:1,duration:.6*k,ease:'power2.out'},t+delay)
          .to(p,{strokeDashoffset:0,duration:.55*k,ease:'sine.inOut'},t+delay)
          .to(p,{fillOpacity:1,duration:.4*k},t+delay+.25*k);
      };
      for(let i=0;i<5;i++)petal(20,8,i*72+J(4),i*.05*k);
      for(let i=0;i<5;i++)petal(12.5,5.5,i*72+36+J(4),(.28+i*.05)*k);
      const c=mk('g',{},b);gsap.set(c,{opacity:0});
      for(let i=0;i<5;i++){const a=(i*72+18+J(6))*Math.PI/180,l=6+J(1);
        mk('path',{class:'stamen',d:`M0 0 L${Math.cos(a)*l} ${Math.sin(a)*l}`},c);mk('circle',{cx:Math.cos(a)*(l+.8),cy:Math.sin(a)*(l+.8),r:.8},c);}
      mk('circle',{cx:0,cy:0,r:1.5},c);
      tl.to(c,{opacity:1,duration:.4*k},t+.5*k);
    }
    /* two small side blossoms on short twigs, then the crown at the tip */
    [[.7,1,.5,12],[.84,-1,.42,-10]].forEach(([s,side,sc,rot])=>{
      const P=at(s),a=(P.ang+side*40)*Math.PI/180,ex=P.x+Math.cos(a)*24,ey=P.y+Math.sin(a)*24;
      const tw=mk('path',{class:'twig',d:`M${P.x} ${P.y} Q${P.x+Math.cos(a)*10+side*3} ${P.y+Math.sin(a)*14} ${ex} ${ey}`},g);pen(tw);
      tl.to(tw,{strokeDashoffset:0,duration:.35*k,ease:'sine.inOut'},tS(s)+.1*k);
      blossom(ex,ey,sc,rot,tS(s)+.38*k);
    });
    const T=at(1);blossom(T.x,T.y,1,6,tS(1)+.05*k);

    /* a few petals let go and drift down, slowly */
    falling.forEach(f=>f.kill());falling=[];
    [[-22,-1],[10,1],[-8,-1],[26,1],[0,-1]].forEach(([dx,dir],i)=>{
      const p=mk('path',{class:'petal',d:'M0 0 C2 -4 9 -5 12 0 C9 4 2 4 0 0Z'},g);
      gsap.set(p,{x:T.x+dx*.4,y:T.y+4,opacity:0,rotation:i*60,scale:.8,transformOrigin:'0% 50%'});
      const d=3.8+i*.25,delay=1.7*k+i*.55;
      falling.push(gsap.to(p,{y:T.y+175,x:'+='+(dir*(18+i*5)),rotation:'+='+(dir*150),duration:d,delay,ease:'sine.inOut',repeat:-1}));
      falling.push(gsap.to(p,{keyframes:{'0%':{opacity:0},'18%':{opacity:.85},'72%':{opacity:.8},'100%':{opacity:0}},duration:d,delay,ease:'none',repeat:-1}));
    });
  }

  function reset(){
    minTime=false;
    released=false;
    heroReady=Boolean(heroReadySignaled);
    const introEl=document.getElementById('al-intro');
    if(introEl){introEl.style.display='flex';introEl.style.opacity='1';}
    gsap.set('#al-plant',{rotation:0});
    gsap.set('#al-word',{opacity:0,letterSpacing:'.46em'});
    gsap.set('#al-sun',{opacity:0});

    const isMobile=window.innerWidth<=760;
    const cw=window.innerWidth, ch=window.innerHeight;
    const cardW=isMobile?cw*0.88:cw*0.62;
    const cardH=isMobile?cw*0.495:cw*0.34875;
    const startX=(cw/2)-(cardW*0.09);
    const startY=(ch/2)-(cardH*0.04);
    const startR=isMobile?6:8;

    const heroViewport=document.getElementById('heroViewport');
    const heroAperture=document.getElementById('heroAperture');
    const heroMediaWrap=document.getElementById('heroMediaWrap');

    if(heroViewport){
      heroViewport.style.clipPath=`inset(${startY.toFixed(1)}px ${startX.toFixed(1)}px ${startY.toFixed(1)}px ${startX.toFixed(1)}px round ${startR}px)`;
      gsap.set(heroViewport,{opacity:0});
    }
    if(heroAperture){
      heroAperture.style.top=`${startY.toFixed(1)}px`;
      heroAperture.style.bottom=`${startY.toFixed(1)}px`;
      heroAperture.style.left=`${startX.toFixed(1)}px`;
      heroAperture.style.right=`${startX.toFixed(1)}px`;
      heroAperture.style.borderRadius=`${startR}px`;
      gsap.set(heroAperture,{opacity:0});
    }
    if(heroMediaWrap){
      gsap.set(heroMediaWrap,{scale:1.07,transformOrigin:'50% 50%'});
    }
    gsap.set('#hh',{opacity:0,y:10});
    gsap.set('#intro',{opacity:0});
  }

  function release(){
    if(released||!heroReady||!minTime)return;
    released=true;

    const isMobile=window.innerWidth<=760;
    const cw=window.innerWidth, ch=window.innerHeight;
    const cardW=isMobile?cw*0.88:cw*0.62;
    const cardH=isMobile?cw*0.495:cw*0.34875;
    const startX=(cw/2)-(cardW*0.09);
    const startY=(ch/2)-(cardH*0.04);
    const targetX=(cw-cardW)/2;
    const targetY=(ch-cardH)/2;
    const startR=isMobile?6:8;
    const targetR=isMobile?6:8;

    const heroViewport=document.getElementById('heroViewport');
    const heroAperture=document.getElementById('heroAperture');
    const heroMediaWrap=document.getElementById('heroMediaWrap');

    const openProxy={p:0};

    const releaseTL=gsap.timeline({
      onComplete:()=>{
        falling.forEach(f=>f.kill());
        sway&&sway.kill();
        tl&&tl.kill();

        if(heroViewport){
          if(isMobile){
            heroViewport.style.clipPath='inset(calc((100vh - 49.5vw)/2) 6vw calc((100vh - 49.5vw)/2) 6vw round 6px)';
          }else{
            heroViewport.style.clipPath='inset(calc((100vh - 34.875vw)/2) 19vw calc((100vh - 34.875vw)/2) 19vw round 8px)';
          }
        }
        if(heroAperture){
          if(isMobile){
            heroAperture.style.top='calc((100vh - 49.5vw)/2)';
            heroAperture.style.bottom='calc((100vh - 49.5vw)/2)';
            heroAperture.style.left='6vw';
            heroAperture.style.right='6vw';
            heroAperture.style.borderRadius='6px';
          }else{
            heroAperture.style.top='calc((100vh - 34.875vw)/2)';
            heroAperture.style.bottom='calc((100vh - 34.875vw)/2)';
            heroAperture.style.left='19vw';
            heroAperture.style.right='19vw';
            heroAperture.style.borderRadius='8px';
          }
          heroAperture.style.opacity='1';
        }
        if(heroMediaWrap){
          gsap.set(heroMediaWrap,{scale:1});
        }

        window.dispatchEvent(new CustomEvent('aurelia:loader-done'));
      }
    });

    releaseTL.to('#al-intro',{opacity:0,duration:.7*k,ease:'sine.inOut'},0);
    if(heroViewport){
      releaseTL.to(heroViewport,{opacity:1,duration:.5*k,ease:'sine.out'},.25*k);
    }
    if(heroAperture){
      releaseTL.to(heroAperture,{opacity:1,duration:1.0*k,ease:'sine.out'},.35*k);
    }
    releaseTL.to(openProxy,{
      p:1,
      duration:1.1*k,
      ease:'power3.inOut',
      onUpdate:()=>{
        const p=openProxy.p;
        const curX=startX+(targetX-startX)*p;
        const curY=startY+(targetY-startY)*p;
        const curR=startR+(targetR-startR)*p;
        if(heroViewport){
          heroViewport.style.clipPath=`inset(${curY.toFixed(1)}px ${curX.toFixed(1)}px ${curY.toFixed(1)}px ${curX.toFixed(1)}px round ${curR.toFixed(1)}px)`;
        }
        if(heroAperture){
          heroAperture.style.top=`${curY.toFixed(1)}px`;
          heroAperture.style.bottom=`${curY.toFixed(1)}px`;
          heroAperture.style.left=`${curX.toFixed(1)}px`;
          heroAperture.style.right=`${curX.toFixed(1)}px`;
          heroAperture.style.borderRadius=`${curR.toFixed(1)}px`;
        }
      }
    },.3*k);

    if(heroMediaWrap){
      releaseTL.to(heroMediaWrap,{scale:1,duration:1.6*k,ease:'power2.out'},.3*k);
    }
    releaseTL.to('#hh',{opacity:1,y:0,duration:.9*k,ease:'expo.out'},1.0*k);
    releaseTL.to('#intro',{opacity:1,duration:.9*k,ease:'power2.out'},1.0*k);
  }

  function play(){
    tl&&tl.kill();sway&&sway.kill();falling.forEach(f=>f.kill());reset();build();
    tl.to('#al-sun',{opacity:1,duration:1.8*k,ease:'sine.inOut'},0)
      .to('#al-word',{opacity:1,duration:.9*k,ease:'sine.out'},.9*k)
      .to('#al-word',{letterSpacing:'.34em',duration:1.2*k,ease:'power2.out'},.9*k)
      .to({},{duration:.01},2.0*k);
    sway=gsap.to('#al-plant',{rotation:.8,duration:3,ease:'sine.inOut',yoyo:true,repeat:-1});
  }

  const ready=()=>{heroReady=true;release();};
  return{play,ready};
})();
window.AureliaLoader=AureliaLoader;


const heroInitStill = (heroOpeningMode === 'night' && heroStillNight) ? heroStillNight : heroStillLight;
if(heroInitStill){
  if(heroInitStill.complete&&heroInitStill.naturalWidth>0){
    signalHeroReady();
  }else{
    heroInitStill.addEventListener('load',()=>signalHeroReady(),{once:true});
    heroInitStill.addEventListener('error',()=>signalHeroReady(),{once:true});
  }
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',()=>AureliaLoader.play());
}else{
  AureliaLoader.play();
}

const HERO_CONFIG={
  frameCount:192,
  lerp:0.15,
  concurrency:6,
  lookahead:6,
  maxDpr:2
};

const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)');
let isReducedMotion=prefersReduced.matches;

const heroImagesLight=new Array(HERO_CONFIG.frameCount+1);
const heroImagesNight=new Array(HERO_CONFIG.frameCount+1);

let heroTargetIdx=1;
let heroCurIdx=1;
let heroLastDrawn=null;
let heroIsTicking=false;
let heroLastScrollY=window.scrollY;
let heroScrollDir=1;
let currentTime=0;

function pad4(n){
  return String(n).padStart(4,'0');
}

function loadHeroFrame(idx,isNight=false){
  if(idx<1||idx>HERO_CONFIG.frameCount)return;
  const store=isNight?heroImagesNight:heroImagesLight;
  if(store[idx])return;

  const folder=isNight?'frames-night':'frames';
  const img=new Image();
  img.decoding='async';
  img.src=`${folder}/frame_${pad4(idx)}.webp`;
  store[idx]=img;

  img.onload=()=>{
    const isCurNight=heroOpeningMode==='night';
    if(idx===1){
      signalHeroReady();
    }
    if((isNight&&isCurNight)||(!isNight&&!isCurNight)){
      if(Math.abs(heroCurIdx-idx)<=2){
        heroLastDrawn=null;
        scheduleHeroTick();
      }
    }
    if(isNight&&idx===1){
      drawHeroFrame(1,'night');
    } else if(!isNight&&idx===1){
      drawHeroFrame(1,'day');
    }
  };
}

let heroPreloadQueue=[];
let heroInFlight=0;

function pumpHeroQueue(){
  while(heroInFlight<HERO_CONFIG.concurrency&&heroPreloadQueue.length>0){
    const item=heroPreloadQueue.shift();
    const store=item.isNight?heroImagesNight:heroImagesLight;
    if(store[item.idx])continue;
    heroInFlight++;
    const folder=item.isNight?'frames-night':'frames';
    const img=new Image();
    img.decoding='async';
    img.src=`${folder}/frame_${pad4(item.idx)}.webp`;
    store[item.idx]=img;

    const done=()=>{
      heroInFlight--;
      const isCurNight=heroOpeningMode==='night';
      if(((item.isNight&&isCurNight)||(!item.isNight&&!isCurNight))&&Math.abs(heroCurIdx-item.idx)<=2){
        heroLastDrawn=null;
        scheduleHeroTick();
      }
      pumpHeroQueue();
    };
    img.onload=done;
    img.onerror=done;
  }
}

function preloadHeroSequence(){
  const isNight = heroOpeningMode === 'night';
  const primaryCount = Math.min(12, HERO_CONFIG.frameCount);
  const secondaryCount = Math.min(6, HERO_CONFIG.frameCount);

  if (isNight) {
    for(let i=1; i<=primaryCount; i++) loadHeroFrame(i, true);
    for(let i=1; i<=secondaryCount; i++) loadHeroFrame(i, false);
    for(let i=primaryCount+1; i<=HERO_CONFIG.frameCount; i++) heroPreloadQueue.push({idx:i, isNight:true});
    for(let i=secondaryCount+1; i<=HERO_CONFIG.frameCount; i++) heroPreloadQueue.push({idx:i, isNight:false});
  } else {
    for(let i=1; i<=primaryCount; i++) loadHeroFrame(i, false);
    for(let i=1; i<=secondaryCount; i++) loadHeroFrame(i, true);
    for(let i=primaryCount+1; i<=HERO_CONFIG.frameCount; i++) heroPreloadQueue.push({idx:i, isNight:false});
    for(let i=secondaryCount+1; i<=HERO_CONFIG.frameCount; i++) heroPreloadQueue.push({idx:i, isNight:true});
  }
  pumpHeroQueue();
}

function decodeHeroAhead(idx){
  const store=heroOpeningMode==='night'?heroImagesNight:heroImagesLight;
  for(let step=1;step<=HERO_CONFIG.lookahead;step++){
    const target=idx+step*heroScrollDir;
    if(target<1||target>HERO_CONFIG.frameCount)continue;
    const img=store[target];
    if(img&&img.complete&&img.naturalWidth&&!img._decoded&&img.decode){
      img._decoded=true;
      img.decode().catch(()=>{});
    }
  }
}

function nearestHeroLoaded(idx,forceNight=null){
  const isNight=(forceNight!==null)?forceNight:(heroOpeningMode==='night');
  const store=isNight?heroImagesNight:heroImagesLight;
  if(store[idx]&&store[idx].complete&&store[idx].naturalWidth)return idx;
  for(let offset=1;offset<HERO_CONFIG.frameCount;offset++){
    const down=idx-offset;
    if(down>=1&&store[down]&&store[down].complete&&store[down].naturalWidth)return down;
    const up=idx+offset;
    if(up<=HERO_CONFIG.frameCount&&store[up]&&store[up].complete&&store[up].naturalWidth)return up;
  }
  return null;
}

function resizeHeroCanvas(){
  const dpr=Math.min(window.devicePixelRatio||1,HERO_CONFIG.maxDpr);
  const refCanvas=heroCanvasLight||heroCanvasNight;
  const w=(refCanvas&&refCanvas.clientWidth)||innerWidth;
  const h=(refCanvas&&refCanvas.clientHeight)||innerHeight;
  const targetW=Math.floor(w*dpr);
  const targetH=Math.floor(h*dpr);

  [heroCanvasLight,heroCanvasNight].forEach(canvas=>{
    if(canvas&&(canvas.width!==targetW||canvas.height!==targetH)){
      canvas.width=targetW;
      canvas.height=targetH;
    }
  });

  heroLastDrawn=null;
  drawHeroFrame(Math.round(heroCurIdx));
}

function drawHeroFrame(idx,forceMode=null){
  if(isReducedMotion)return;
  const mode=forceMode||heroOpeningMode;
  const isNight=mode==='night';
  const canvas=isNight?heroCanvasNight:heroCanvasLight;
  const ctx=isNight?heroCtxNight:heroCtxLight;
  if(!canvas||!ctx)return;

  const resolved=nearestHeroLoaded(idx,isNight);
  if(resolved===null)return;
  if(!forceMode&&resolved===heroLastDrawn)return;

  const store=isNight?heroImagesNight:heroImagesLight;
  const img=store[resolved];
  if(!img||!img.complete||!img.naturalWidth)return;

  const cw=canvas.width;
  const ch=canvas.height;
  const iw=img.naturalWidth;
  const ih=img.naturalHeight;

  const scale=Math.max(cw/iw,ch/ih);
  const sw=iw*scale;
  const sh=ih*scale;
  const dx=(cw-sw)/2;
  const dy=(ch-sh)/2;

  ctx.imageSmoothingEnabled=true;
  ctx.imageSmoothingQuality='high';
  ctx.drawImage(img,dx,dy,sw,sh);
  if(!forceMode)heroLastDrawn=resolved;
}

function heroTick(){
  if(isReducedMotion){
    heroIsTicking=false;
    return;
  }
  const diff=heroTargetIdx-heroCurIdx;
  if(Math.abs(diff)<0.02){
    heroCurIdx=heroTargetIdx;
    drawHeroFrame(Math.round(heroCurIdx));
    heroIsTicking=false;
    return;
  }
  heroCurIdx+=diff*HERO_CONFIG.lerp;
  drawHeroFrame(Math.round(heroCurIdx));
  decodeHeroAhead(Math.round(heroCurIdx));
  requestAnimationFrame(heroTick);
}

function scheduleHeroTick(){
  if(!heroIsTicking&&!isReducedMotion){
    heroIsTicking=true;
    requestAnimationFrame(heroTick);
  }
}

function updateHeroFrameProgress(p){
  if(isReducedMotion)return;
  const idx=1+cl(Math.round(p*(HERO_CONFIG.frameCount-1)),0,HERO_CONFIG.frameCount-1);
  const curY=window.scrollY;
  heroScrollDir=curY>=heroLastScrollY?1:-1;
  heroLastScrollY=curY;
  heroTargetIdx=idx;
  scheduleHeroTick();
}

window.addEventListener('resize',resizeHeroCanvas,{passive:true});
resizeHeroCanvas();
preloadHeroSequence();

class VideoScrubber{
  constructor(videoElement,options={}){
    this.video=videoElement;this.minDiff=options.minDiff||0.008;this.isSeeking=false;this.targetTime=0;this.isReady=false;this.init();
  }
  init(){
    if(!this.video)return;
    this.video.muted=true;this.video.playsInline=true;
    this.video.addEventListener('loadedmetadata',()=>{this.isReady=true;});
    this.video.addEventListener('seeking',()=>{this.isSeeking=true;});
    this.video.addEventListener('seeked',()=>{this.isSeeking=false;this.flush();});
  }
  seek(targetTime){
    if(!this.video||!this.video.duration||this.video.readyState<2)return;
    this.targetTime=cl(targetTime,0,Math.max(0,this.video.duration-0.04));
    this.flush();
  }
  flush(){
    if(!this.video||this.video.readyState<2||this.isSeeking)return;
    if(Math.abs(this.video.currentTime-this.targetTime)>this.minDiff){
      this.isSeeking=true;
      this.video.currentTime=this.targetTime;
    }
  }
}

const scrubberLight=new VideoScrubber(heroVidLight);
const scrubberNight=new VideoScrubber(heroVidNight);
function getActiveVid(){return heroOpeningMode==='night'?heroVidNight:heroVidLight}
function getActiveScrubber(){return heroOpeningMode==='night'?scrubberNight:scrubberLight}

function applyReducedMotionState(){
  if(isReducedMotion){
    heroIsTicking=false;
    if(heroCanvasLight)heroCanvasLight.style.display='none';
    if(heroCanvasNight)heroCanvasNight.style.display='none';
    const activeVid=getActiveVid();
    if(activeVid){
      activeVid.style.display='block';
      activeVid.classList.add('is-active');
      activeVid.preload='auto';
      activeVid.play().catch(()=>{});
    }
  }else{
    if(heroCanvasLight)heroCanvasLight.style.display='block';
    if(heroCanvasNight)heroCanvasNight.style.display='block';
    if(heroVidLight){heroVidLight.style.display='none';heroVidLight.classList.remove('is-active');heroVidLight.pause();}
    if(heroVidNight){heroVidNight.style.display='none';heroVidNight.classList.remove('is-active');heroVidNight.pause();}
    heroLastDrawn=null;
    resizeHeroCanvas();
    scheduleHeroTick();
  }
}

prefersReduced.addEventListener('change',(e)=>{
  isReducedMotion=e.matches;
  applyReducedMotionState();
});
if(isReducedMotion)applyReducedMotionState();

// Master Hero Timeline with GSAP ScrollTrigger
let heroTL=null;
function initHeroScroll(){
  if(heroTL)return;
  if(typeof gsap==='undefined'||typeof ScrollTrigger==='undefined')return;
  const apertureProxy={p:0};
  const heroViewport=$('heroViewport')||$('stageFrame');
  const heroAperture=$('heroAperture');
  const isMobile=innerWidth<=760;

  heroTL=gsap.timeline({
    scrollTrigger:{
      id:'heroTrigger',
      trigger:'#hero',
      start:'top top',
      end:'bottom bottom',
      scrub:0.6,
      onUpdate:(self)=>{
        const prog=self.progress;
        if(prog<=0.002){
          heroBaseProgress=0;
        }
        let effectiveProg=prog;
        if(heroBaseProgress>0&&heroBaseProgress<0.98){
          if(prog>=heroBaseProgress){
            effectiveProg=(prog-heroBaseProgress)/(1-heroBaseProgress);
          }else{
            effectiveProg=0;
          }
        }
        effectiveProg=cl(effectiveProg,0,1);

        if(effectiveProg>0.003){
          if(heroStillLight&&heroStillLight.style.opacity!=='0')heroStillLight.style.opacity='0';
          if(heroStillNight&&heroStillNight.style.opacity!=='0')heroStillNight.style.opacity='0';
        }
        if(!isReducedMotion){
          updateHeroFrameProgress(effectiveProg);
        }else{
          const vid=getActiveVid();
          if(vid&&vid.duration&&vid.readyState>=2){
            const targetTime=cl(effectiveProg*vid.duration,0,Math.max(0,vid.duration-0.04));
            currentTime=targetTime;
            getActiveScrubber().seek(targetTime);
          }
        }
      }
    }
  });

  // 1. Hero typography quietly disappears (0.0 to 0.12)
  if($('hh')){
    heroTL.to('#hh',{opacity:0,ease:'power2.out',duration:0.12},0);
  }

  // 2. Gentle aperture expansion (0.0 to 0.28)
  heroTL.to(apertureProxy, {
    p: 1,
    duration: 0.28,
    ease: 'power2.out',
    onUpdate: () => {
      const p = apertureProxy.p;
      if (!heroViewport) return;
      if (p >= 0.999) {
        heroViewport.style.clipPath = 'none';
        if (heroAperture) {
          heroAperture.style.opacity = '0';
          heroAperture.style.visibility = 'hidden';
        }
      } else {
        const initialClipX = isMobile ? innerWidth * 0.06 : innerWidth * 0.19;
        const initialClipY = isMobile
          ? Math.max(0, (innerHeight - innerWidth * 0.495) / 2)
          : Math.max(0, (innerHeight - innerWidth * 0.34875) / 2);
        const curX = Math.max(0, (1 - p) * initialClipX);
        const curY = Math.max(0, (1 - p) * initialClipY);
        const curR = Math.max(0, (1 - p) * (isMobile ? 6 : 8));

        heroViewport.style.clipPath = `inset(${curY.toFixed(1)}px ${curX.toFixed(1)}px ${curY.toFixed(1)}px ${curX.toFixed(1)}px round ${curR.toFixed(1)}px)`;
        if (heroAperture) {
          heroAperture.style.visibility = 'visible';
          heroAperture.style.opacity = String(Math.max(0, 1 - p * 2.2));
          heroAperture.style.top = `${curY.toFixed(1)}px`;
          heroAperture.style.bottom = `${curY.toFixed(1)}px`;
          heroAperture.style.left = `${curX.toFixed(1)}px`;
          heroAperture.style.right = `${curX.toFixed(1)}px`;
          heroAperture.style.borderRadius = `${curR.toFixed(1)}px`;
        }
      }
    }
  }, 0);

  // 3. Arrival room welcome softly emerges (0.80 to 0.96)
  if (room) {
    heroTL.fromTo(room, { opacity: 0 }, { opacity: 1, duration: 0.16, ease: 'power2.out' }, 0.80);
  }
}

window.addEventListener('aurelia:loader-done',()=>{
  const introEl=document.getElementById('al-intro');
  if(introEl)introEl.remove();

  document.documentElement.classList.remove('al-loading');
  document.body.classList.remove('al-loading');

  const header=document.getElementById('intro');
  if(header){
    header.style.opacity='';
    header.style.pointerEvents='auto';
  }

  const hh=document.getElementById('hh');
  if(hh){
    hh.style.opacity='1';
    hh.style.transform='none';
  }

  initHeroScroll();
  if(typeof ScrollTrigger!=='undefined'){
    ScrollTrigger.refresh();
  }
},{once:true});

/* ========================================================
   EDITORIAL ARCHITECTURAL MATERIALS SCROLL SYSTEM (GSAP)
   ======================================================== */
const mats=$('mats'),ms=$('ms'),mt=$('mt');
const mCurNum=$('m-cur-num'),mCurName=$('m-cur-name'),mCurBar=$('m-cur-bar');
const MAT_DATA=[
  {num:'OVERVIEW',name:'HOW WE BUILD IT'},
  {num:'01 / 07',name:'TRAVERTINE LIMESTONE'},
  {num:'02 / 07',name:'ARCHITECTURAL TEAK / DARK OAK'},
  {num:'03 / 07',name:'ULTRA-CLEAR STRUCTURAL GLASS'},
  {num:'04 / 07',name:'SCULPTURAL ARCHITECTURAL CONCRETE'},
  {num:'05 / 07',name:'PATINATED ARCHITECTURAL BRONZE'},
  {num:'06 / 07',name:'NATURAL LIME PLASTER'},
  {num:'07 / 07',name:'LIVING BOTANICAL & WATER'}
];
let lastMatIdx=-1;

if(innerWidth>760&&mats&&mt&&typeof gsap!=='undefined'){
  const panels=document.querySelectorAll('.mp');
  const totalPanels=panels.length;
  
  function updateMatsIndicator(p){
    if(mCurBar)mCurBar.style.width=(p*100).toFixed(2)+'%';
    const activeIdx=Math.min(MAT_DATA.length-1,Math.max(0,Math.round(p*(totalPanels-1))));
    if(activeIdx!==lastMatIdx){
      lastMatIdx=activeIdx;
      if(mCurNum&&mCurName&&MAT_DATA[activeIdx]){
        mCurNum.textContent=MAT_DATA[activeIdx].num;
        mCurName.textContent=MAT_DATA[activeIdx].name;
      }
    }
    panels.forEach((panel,i)=>{
      const visual=panel.querySelector('.m-visual');
      if(visual){
        const diff=p*(totalPanels-1)-i;
        visual.style.transform=`translate3d(${(diff*35).toFixed(1)}px,0,0)`;
      }
    });
  }

  const matsTL=gsap.timeline({
    scrollTrigger:{
      trigger:'#mats',
      pin:'#ms',
      start:'top top',
      end:'bottom bottom',
      scrub:0.6
    },
    onUpdate:function(){
      updateMatsIndicator(this.progress());
    }
  });

  matsTL.to(mt,{
    x:()=>`-${(totalPanels-1)*100}vw`,
    ease:'none',
    duration:1
  },0);
}

/* ========================================================
   EDITORIAL ARCHITECTURAL AMENITIES & TOUR SCRUB SYSTEM
   ======================================================== */
/* ========================================================
   CINEMATIC AMENITY SCROLL-SCRUBBED FRAME SEQUENCES
   ======================================================== */
const pad = (n) => String(n).padStart(4, '0');

/* Single Canonical Source of Truth for Amenities */
const AMENITIES_DATA = [
  {
    index: 0,
    num: '01',
    id: 'pool',
    title: 'Infinity Hot Pool',
    phrase: 'Staircase · pool · forest',
    detail: 'Travertine Monolith · 38°C Heated Spring · Forest Horizon',
    image: 'amenity-01-pool.jpg',
    baseRot: -0.8,
    baseOffset: 0,
    frameCount: 192,
    fps: 24,
    captions: [
      { start: 0.08, end: 0.30, title: 'Infinity Hot Pool', sub: 'Staircase descending through living mist.' },
      { start: 0.40, end: 0.65, title: 'Thermal Sanctuary', sub: 'A heated monolithic pool carved into stone.' },
      { start: 0.75, end: 0.95, title: 'Horizon Line', sub: 'Water meets tree canopy and silent sky.' }
    ]
  },
  {
    index: 1,
    num: '02',
    id: 'garden',
    title: 'Biophilic Garden',
    phrase: 'Garden pathway · layered landscape',
    detail: 'Endemic Mediterranean Flora · Microclimate Canopy · Shaded Walks',
    image: 'amenity-02-garden.jpg',
    baseRot: 0.6,
    baseOffset: 2,
    frameCount: 192,
    fps: 24,
    captions: [
      { start: 0.08, end: 0.30, title: 'Biophilic Garden', sub: 'Winding volcanic pathways through lush shade.' },
      { start: 0.40, end: 0.65, title: 'Microclimate Canopy', sub: 'Layered microclimates and fragrant botanicals.' },
      { start: 0.75, end: 0.95, title: 'Filtered Light', sub: 'Sunlight breaking quietly through ancient canopy.' }
    ]
  },
  {
    index: 2,
    num: '03',
    id: 'gym',
    title: 'Private Wellness Gym',
    phrase: 'Sculptural entrance · sanctuary · interior',
    detail: 'Monolithic Travertine Rotunda · Open Sky Oculi · Thermal Channels',
    image: 'amenity-03-gym.jpg',
    baseRot: 0.0,
    baseOffset: -1,
    frameCount: 192,
    fps: 24,
    captions: [
      { start: 0.08, end: 0.30, title: 'Private Wellness Gym', sub: 'Monolithic archway framing quiet strength.' },
      { start: 0.40, end: 0.65, title: 'Sky Oculi', sub: 'Sunlight pouring through circular sky oculi.' },
      { start: 0.75, end: 0.95, title: 'Thermal Movement', sub: 'Movement in rhythm with stone and living air.' }
    ]
  },
  {
    index: 3,
    num: '04',
    id: 'sunset',
    title: 'Sunset Lounge & Dining',
    phrase: 'Terrace · golden hour · open sky',
    detail: 'Cantilevered Stone Deck · Teak Banquet · Unobstructed West Horizon',
    image: 'amenity-04-sunset.jpg',
    baseRot: 0.8,
    baseOffset: 3,
    frameCount: 192,
    fps: 24,
    captions: [
      { start: 0.08, end: 0.30, title: 'Sunset Lounge & Dining', sub: 'Approaching the open-air terrace in golden light.' },
      { start: 0.40, end: 0.65, title: 'Teak Banquet', sub: 'Solid teak banquet beneath swaying palms.' },
      { start: 0.75, end: 0.95, title: 'Dusk Horizon', sub: 'Dusk settles slowly across the horizon.' }
    ]
  },
  {
    index: 4,
    num: '05',
    id: 'observatory',
    title: 'Private Observatory',
    phrase: 'Night garden · telescope · cosmos',
    detail: 'High-Elevation Optical Mounts · Celestial Orientation · Zero Light-Spill',
    image: 'amenity-05-observatory.jpg',
    baseRot: -0.6,
    baseOffset: 0,
    frameCount: 192,
    fps: 24,
    captions: [
      { start: 0.08, end: 0.30, title: 'Private Observatory', sub: 'Night stone path under soft ground illumination.' },
      { start: 0.40, end: 0.65, title: 'Celestial Mounts', sub: 'The celestial terrace opens to the cosmos.' },
      { start: 0.75, end: 0.95, title: 'Ancient Starlight', sub: 'Observing ancient starlight in silence.' }
    ]
  }
];

const framePath = (id, n) => `frames/${id}/frame_${pad(n)}.webp`;

const am = $('am');
if (am) {
  am.innerHTML = '';
  AMENITIES_DATA.forEach((a) => {
    const col = document.createElement('div');
    col.className = 'am-col';
    col.dataset.index = a.index;
    col.dataset.amenity = a.id;
    col.tabIndex = 0;
    col.setAttribute('role', 'button');
    col.setAttribute('aria-label', `Explore ${a.title}`);
    col.innerHTML = `
      <div class="am-item">
        <div class="am-img-wrap">
          <img class="am-img" src="${a.image}" alt="${a.title}" loading="lazy">
        </div>
        <div class="am-overlay"></div>
        <div class="am-top">
          <span class="am-num">${a.num}</span>
          <span class="am-explore">ENTER SPACE →</span>
        </div>
        <div class="am-meta">
          <h3 class="am-title">${a.title}</h3>
          <p class="am-phrase">${a.phrase}</p>
          <div class="am-detail"><span>EXPERIENCE ${a.num}</span><span>${a.detail.split('·')[0].trim()}</span></div>
        </div>
      </div>
      <div class="am-col-foot">
        <p class="am-scroll-hint">Scroll to view</p>
      </div>
    `;
    am.append(col);
  });
}

let activeAmenityIndex = 0;

function updateAmenityActiveState(activeIndex) {
  if (activeIndex === activeAmenityIndex && am && am.children[activeIndex]?.classList.contains('is-active')) return;
  activeAmenityIndex = activeIndex;
  if (!am) return;
  [...am.children].forEach((col, i) => {
    col.classList.toggle('is-active', i === activeIndex);
  });
}

function updateAmenityCurve() {
  if (!am || !am.children.length) return;
  const isDesktop = innerWidth > 760;

  if (!isDesktop) {
    const viewportCenter = innerHeight / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    [...am.children].forEach((item, i) => {
      const rect = item.getBoundingClientRect();
      const itemCenter = rect.top + rect.height / 2;
      const dist = Math.abs(itemCenter - viewportCenter);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }
      item.style.transform = '';
      item.style.opacity = '';
      item.style.zIndex = '';
      const itemInner = item.querySelector('.am-item');
      if (itemInner) itemInner.classList.remove('is-dimmed');
    });

    updateAmenityActiveState(closestIndex);
    return;
  }

  const c = innerWidth / 2;
  const items = [...am.children];
  let closestIndex = 0;
  let minDistance = Infinity;

  items.forEach((item, i) => {
    const r = item.getBoundingClientRect();
    const itemCenter = r.left + r.width / 2;
    const d = (itemCenter - c) / innerWidth;
    const absD = Math.abs(d);

    if (absD < minDistance) {
      minDistance = absD;
      closestIndex = i;
    }

    const data = AMENITIES_DATA[i] || {};
    const bRot = data.baseRot || 0;
    const bOff = data.baseOffset || 0;

    const translateY = (d * d * 40) + (bOff * 2);
    const rotate = bRot + (d * 2.2);
    const scale = 1 - Math.min(0.08, absD * 0.10);
    const opacity = Math.max(0.85, 1 - absD * 0.25);
    const zIndex = Math.round((1 - absD) * 10);

    item.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0) rotate(${rotate.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
    item.style.opacity = opacity.toFixed(3);
    item.style.zIndex = zIndex;

    const itemInner = item.querySelector('.am-item');
    if (itemInner) {
      itemInner.classList.toggle('is-dimmed', absD > 0.42);
    }
  });

  updateAmenityActiveState(closestIndex);
}

let drag = 0, dx = 0, sx = 0, isPointerDown = 0;
if (am) {
  am.addEventListener('scroll', updateAmenityCurve, { passive: true });
}
window.addEventListener('scroll', updateAmenityCurve, { passive: true });
window.addEventListener('resize', updateAmenityCurve, { passive: true });
updateAmenityCurve();

/* Unified editorial scroll scrubbing for amenities matching home page (GSAP ScrollTrigger scrub: 0.6) */
let haveTL = null;
if (innerWidth > 760 && $('have') && $('have-stage') && am && typeof gsap !== 'undefined') {
  const getAmMaxScroll = () => Math.max(0, am.scrollWidth - am.clientWidth);
  const amScrollProxy = { p: 0 };

  haveTL = gsap.timeline({
    scrollTrigger: {
      trigger: '#have',
      pin: '#have-stage',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6
    }
  });

  haveTL.to(amScrollProxy, {
    p: 1,
    ease: 'none',
    duration: 1,
    onUpdate: () => {
      am.scrollLeft = amScrollProxy.p * getAmMaxScroll();
      updateAmenityCurve();
    }
  });

  window.addEventListener('resize', () => {
    if (innerWidth > 760) {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      updateAmenityCurve();
    }
  }, { passive: true });
}

if (am) {
  am.addEventListener('pointerdown', e => {
    isPointerDown = 1;
    dx = e.clientX;
    sx = am.scrollLeft;
    drag = 0;
  });
  window.addEventListener('pointerup', () => {
    isPointerDown = 0;
    setTimeout(() => { drag = 0; }, 80);
  });
  window.addEventListener('pointermove', e => {
    if (isPointerDown && Math.abs(e.clientX - dx) > 8) {
      drag = 1;
      am.scrollLeft = sx - (e.clientX - dx);
    }
  });
}

/* ========================================================
   SCRUBBER ENGINE (FACTORY, ONE INSTANCE PER OPEN, DESTROYED ON CLOSE)
   ======================================================== */
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function createScrubber({ scroller, track, canvas, count, pathFor, captionEls,
                          lerp = 0.15, concurrency = 6, lookahead = 6, maxDpr = 2 }) {
  const ctx = canvas.getContext('2d');
  const frames = new Array(count);
  const loading = new Set();
  let cw = 0, ch = 0, target = 0, current = 0, last = null, dir = 1;
  let running = false, dead = false, rafId = null;

  function loadFrame(i) {
    if (dead || i < 0 || i >= count || frames[i] || loading.has(i)) return;
    loading.add(i);
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      loading.delete(i);
      if (!dead) {
        frames[i] = img;
        if (Math.abs(i - Math.round(current)) <= 2) {
          schedule();
        }
      }
    };
    img.onerror = () => {
      loading.delete(i);
    };
    img.src = pathFor(i + 1);
  }

  function preloadAnchors() {
    const anchors = [0, Math.floor(count * 0.25), Math.floor(count * 0.5), Math.floor(count * 0.75), count - 1];
    anchors.forEach(loadFrame);
  }

  function requestNeighborhood(centerIdx) {
    if (dead) return;
    const windowRadius = 8;
    for (let offset = 0; offset <= windowRadius; offset++) {
      if (centerIdx + offset < count) loadFrame(centerIdx + offset);
      if (centerIdx - offset >= 0) loadFrame(centerIdx - offset);
    }
  }

  async function preloadRest() {
    let next = 1;
    while (!dead && next < count) {
      if (loading.size < concurrency) {
        loadFrame(next++);
      }
      await new Promise(r => setTimeout(r, 16));
    }
  }

  function nearest(idx) {
    if (frames[idx]) return frames[idx];
    const maxSearch = 18;
    for (let d = 1; d <= maxSearch; d++) {
      if (idx - d >= 0 && frames[idx - d]) return frames[idx - d];
      if (idx + d < count && frames[idx + d]) return frames[idx + d];
    }
    return last || frames[0] || null;
  }

  function decodeAhead(idx) {
    for (let k = 1; k <= lookahead; k++) {
      const targetIdx = clamp(idx + k * dir, 0, count - 1);
      const img = frames[targetIdx];
      if (img && !img._decoded && img.decode) {
        img._decoded = true;
        img.decode().catch(() => {});
      }
    }
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    cw = Math.round(scroller.clientWidth * dpr);
    ch = Math.round(scroller.clientHeight * dpr);
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
    }
    ctx.imageSmoothingQuality = 'high';
    last = null;
    schedule();
  }

  function draw(idx) {
    const img = nearest(idx);
    if (!img) return;
    if (img === last && canvas.width === cw && canvas.height === ch) return;
    const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    last = img;
  }

  function progress() {
    const maxScroll = scroller.scrollHeight - scroller.clientHeight;
    return maxScroll > 0 ? clamp(scroller.scrollTop / maxScroll, 0, 1) : 0;
  }

  function updateCaptions(p) {
    const ramp = 0.04;
    for (const c of captionEls) {
      const o = clamp(Math.min((p - c.start) / ramp, (c.end - p) / ramp), 0, 1);
      c.el.style.opacity = o.toFixed(3);
      c.el.style.visibility = o > 0 ? 'visible' : 'hidden';
      c.el.style.transform = `translateY(${((1 - o) * 14).toFixed(1)}px)`;
    }
  }

  function tick() {
    if (dead) return;
    const p = progress();
    target = p * (count - 1);
    updateCaptions(p);

    const tourHint = $('tourScrollHint');
    if (tourHint) {
      const hintOp = clamp(1 - p * 6, 0, 1);
      tourHint.style.opacity = hintOp.toFixed(3);
    }

    const diff = target - current;
    if (Math.abs(diff) > 0.001) dir = diff > 0 ? 1 : -1;
    current += diff * lerp;
    const settled = Math.abs(target - current) < 0.02;
    if (settled) current = target;

    const idx = clamp(Math.round(current), 0, count - 1);
    requestNeighborhood(idx);
    draw(idx);
    decodeAhead(idx);

    if (settled) {
      running = false;
      rafId = null;
    } else {
      rafId = requestAnimationFrame(tick);
    }
  }

  function schedule() {
    if (!dead && !running) {
      running = true;
      rafId = requestAnimationFrame(tick);
    }
  }

  scroller.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', resize, { passive: true });

  return {
    start() {
      resize();
      loadFrame(0);
      preloadAnchors();
      preloadRest();
      schedule();
    },
    destroy() {
      dead = true;
      if (rafId) cancelAnimationFrame(rafId);
      scroller.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', resize);
      frames.length = 0;
      loading.clear();
      canvas.width = canvas.height = 0;
    }
  };
}

/* ========================================================
   OPEN / CLOSE CONTROLLER
   ======================================================== */
const tour = document.getElementById('tour');
const scroller = document.getElementById('tourScroller');
const track = document.getElementById('tourTrack');
const canvas = document.getElementById('tourCanvas');
const capHost = document.getElementById('tourCaptions');
const backBtn = document.getElementById('tourBack');
const tourReduced = document.getElementById('tourReduced');
let scrubber = null, trigger = null;

function showReduced(a) {
  if (!tourReduced) return;
  tourReduced.hidden = false;
  track.style.display = 'none';
  tourReduced.innerHTML = `
    <video class="tour__reduced-video" src="videos/${a.id}.mp4" muted loop playsinline controls autoplay></video>
    <div class="tour__reduced-captions">
      <h3>${a.title}</h3>
      ${a.captions.map(c => `
        <div class="tour__reduced-item">
          <strong>${c.title}</strong>
          <p>${c.sub}</p>
        </div>
      `).join('')}
    </div>
  `;
  const tourHint = $('tourScrollHint');
  if (tourHint) tourHint.style.display = 'none';
  backBtn.focus();
}

function openTour(id, triggerEl) {
  const a = AMENITIES_DATA.find((x) => x.id === id);
  if (!a) return;
  trigger = triggerEl;
  tour.setAttribute('aria-label', a.title);
  tour.hidden = false;
  const tourHint = $('tourScrollHint');
  if (tourHint) {
    tourHint.style.opacity = '1';
    tourHint.style.display = '';
  }
  document.body.style.overflow = 'hidden';
  scroller.scrollTop = 0;
  track.style.height = clamp((a.frameCount / a.fps) * 60, 300, 800) + 'vh';

  capHost.innerHTML = '';
  const captionEls = a.captions.map((c) => {
    const el = document.createElement('div');
    el.className = 'caption';
    el.innerHTML = `<h2></h2><p></p>`;
    el.querySelector('h2').textContent = c.title;
    el.querySelector('p').textContent = c.sub;
    capHost.appendChild(el);
    return { el, start: c.start, end: c.end };
  });

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    showReduced(a);
    return;
  }

  scrubber = createScrubber({
    scroller,
    track,
    canvas,
    count: a.frameCount,
    pathFor: (n) => framePath(a.id, n),
    captionEls
  });
  scrubber.start();
  backBtn.focus();
}

function closeTour() {
  if (scrubber) { scrubber.destroy(); scrubber = null; }
  if (tourReduced) {
    tourReduced.hidden = true;
    tourReduced.innerHTML = '';
  }
  const tourHint = $('tourScrollHint');
  if (tourHint) {
    tourHint.style.opacity = '1';
    tourHint.style.display = '';
  }
  track.style.display = '';
  tour.hidden = true;
  document.body.style.overflow = '';
  if (trigger) trigger.focus();
}

if (backBtn) backBtn.addEventListener('click', closeTour);
window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !tour.hidden) closeTour(); });

// Grid wiring: each card needs data-amenity="<id>"
document.querySelectorAll('[data-amenity]').forEach((card) => {
  card.addEventListener('click', () => {
    if (!drag) openTour(card.dataset.amenity, card);
  });
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openTour(card.dataset.amenity, card);
    }
  });
  // warm the HTTP cache so the tour opens instantly
  const warm = () => {
    const a = AMENITIES_DATA.find(x => x.id === card.dataset.amenity);
    if (!a) return;
    for (let i = 1; i <= 12; i++) new Image().src = framePath(a.id, i);
  };
  card.addEventListener('pointerenter', warm, { once: true });
  card.addEventListener('focus', warm, { once: true });
});

/* ========================================================
   QUIET ARCHITECTURAL INQUIRY FOLIO SUBMIT
   ======================================================== */
const sendBtn = $('send');
if (sendBtn) {
  sendBtn.addEventListener('click', e => {
    e.preventDefault();
    const lf = $('lf');
    if (!lf) return;
    if (typeof gsap !== 'undefined') {
      gsap.to(lf, {
        opacity: 0,
        y: -10,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          lf.innerHTML = `
            <div style="padding: 24px 0 16px;">
              <p class="serif" style="font-size: clamp(26px, 3.2vw, 38px); line-height: 1.2; margin-bottom: 14px; color: var(--ink);">Thank you.</p>
              <p style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(17px, 1.8vw, 22px); font-style: italic; color: var(--brass); margin-bottom: 24px; line-height: 1.35;">
                Your inquiry has been received. Our concierge will attend to your request privately.
              </p>
              <p style="font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase; color: var(--ink); opacity: 0.45;">
                AURELIA PRIVATE RESIDENCES · ARCHIVES
              </p>
            </div>
          `;
          gsap.fromTo(lf, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' });
        }
      });
    } else {
      lf.innerHTML = `
        <div style="padding: 24px 0 16px;">
          <p class="serif" style="font-size: clamp(26px, 3.2vw, 38px); line-height: 1.2; margin-bottom: 14px; color: var(--ink);">Thank you.</p>
          <p style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(17px, 1.8vw, 22px); font-style: italic; color: var(--brass); margin-bottom: 24px; line-height: 1.35;">
            Your inquiry has been received. Our concierge will attend to your request privately.
          </p>
          <p style="font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase; color: var(--ink); opacity: 0.45;">
            AURELIA PRIVATE RESIDENCES · ARCHIVES
          </p>
        </div>
      `;
    }
  });
}

const enterCta = $('enterCta') || $('bk');
if (enterCta) {
  enterCta.onclick = e => {
    e.preventDefault();
    const mats = $('mats') || $('have') || $('touch');
    if (mats) mats.scrollIntoView({ behavior: 'smooth' });
  };
}
const introEl = $('intro');
function updateHeaderOnScroll() {
  if (!introEl) return;
  const isPastHero = window.scrollY > window.innerHeight * 0.75;
  introEl.classList.toggle('scrolled', isPastHero);
}
window.addEventListener('scroll', updateHeaderOnScroll, { passive: true });
updateHeaderOnScroll();
const footerBackTop = $('footerBackTop');
if (footerBackTop) {
  footerBackTop.onclick = e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
}

/* ========================================================
   EDITORIAL TYPOGRAPHY REVEAL (GSAP WORD STAGGER)
   ======================================================== */
function initTypography() {
  if (typeof gsap === 'undefined') return;
  const headings = document.querySelectorAll('h2, .tag');
  headings.forEach(el => {
    if (el.closest('#hh, #room, #tour, #intro, #mats, #m-indicator')) return;
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = 'true';

    const childNodes = Array.from(el.childNodes);
    el.innerHTML = '';
    const words = [];

    childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const textWords = node.textContent.split(/(\s+)/);
        textWords.forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            el.appendChild(document.createTextNode(part));
          } else {
            const span = document.createElement('span');
            span.className = 'tw-word';
            span.style.display = 'inline-block';
            span.style.willChange = 'transform, opacity';
            span.textContent = part;
            el.appendChild(span);
            words.push(span);
          }
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const span = document.createElement(node.tagName.toLowerCase());
        Array.from(node.attributes).forEach(attr => span.setAttribute(attr.name, attr.value));
        span.className = (node.className ? node.className + ' ' : '') + 'tw-word';
        span.style.display = 'inline-block';
        span.style.willChange = 'transform, opacity';
        span.textContent = node.textContent;
        el.appendChild(span);
        words.push(span);
      }
    });

    if (words.length > 0) {
      gsap.fromTo(words, 
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          stagger: 0.035,
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    }
  });
}
initTypography();

/* Architectural feature ticker */
const mq='Underfloor heating · Smart lock access · Climate automation · Electric shutters · Optional private jacuzzi · EV-ready parking · Solar-ready · ';
$('mqt').textContent=mq+mq;

/* Number counting stats */
const cio=new IntersectionObserver(e=>e.forEach(x=>{
  if(!x.isIntersecting)return;
  cio.unobserve(x.target);
  const b=x.target,n=+b.dataset.n,t0=performance.now();
  (function f(t){
    const k=cl((t-t0)/1600);
    b.textContent=Math.round(n*(1-Math.pow(1-k,3)));
    k<1&&requestAnimationFrame(f);
  })(t0);
}),{threshold:.2});
document.querySelectorAll('.stats b').forEach(b=>cio.observe(b));

/* ========================================================
   CINEMATIC ALTERNATE OPENING & SITE THEME SYSTEM
   ======================================================== */
function setSiteTheme(mode, persist = true) {
  heroOpeningMode = mode;
  const isNight = (mode === 'night');
  
  // 1. Synchronize HTML document theme token attribute
  document.documentElement.setAttribute('data-theme', isNight ? 'dark' : 'light');

  // 2. Persist to localStorage if explicitly requested
  if (persist) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (e) {}
  }

  // 3. Update theme-color meta tags
  const metaThemes = document.querySelectorAll('meta[name="theme-color"]');
  metaThemes.forEach(m => {
    m.removeAttribute('media');
    m.setAttribute('content', isNight ? '#15110d' : '#fbf9f6');
  });

  // 4. Update Day/Night button state and accessibility labels
  const dnBtn = $('dn');
  if (dnBtn) {
    dnBtn.classList.toggle('is-night', isNight);
    dnBtn.classList.toggle('is-day', !isNight);
    dnBtn.setAttribute('aria-label', isNight ? 'Switch to Day opening' : 'Switch to Night opening');
    dnBtn.setAttribute('title', isNight ? 'Night active · Click for Day opening' : 'Day active · Click for Night opening');
  }

  // 5. Update stage and still image elements
  const stageEl = $('stage');
  if (stageEl) {
    stageEl.classList.toggle('is-night', isNight);
  }

  if (heroStillNight && heroStillLight) {
    heroStillNight.classList.toggle('is-active', isNight);
    heroStillLight.classList.toggle('is-active', !isNight);
  }

  // 6. Reset hero frame scrub state to frame 1
  heroCurIdx = 1;
  heroTargetIdx = 1;
  heroLastDrawn = null;

  if (typeof ScrollTrigger !== 'undefined') {
    const st = ScrollTrigger.getById('heroTrigger');
    if (st) {
      heroBaseProgress = st.progress;
    }
  }

  // 7. Update hero canvas / video layers
  if (!isReducedMotion) {
    if (isNight) {
      drawHeroFrame(1, 'night');
      if (heroCanvasNight) heroCanvasNight.classList.add('is-active');
      if (heroCanvasLight) heroCanvasLight.classList.remove('is-active');
    } else {
      drawHeroFrame(1, 'day');
      if (heroCanvasLight) heroCanvasLight.classList.add('is-active');
      if (heroCanvasNight) heroCanvasNight.classList.remove('is-active');
    }
    decodeHeroAhead(1);
  } else {
    if (isNight) {
      if (heroVidNight) {
        heroVidNight.currentTime = 0;
        heroVidNight.style.display = 'block';
        heroVidNight.classList.add('is-active');
        heroVidNight.play().catch(() => {});
      }
      if (heroVidLight) {
        heroVidLight.classList.remove('is-active');
        heroVidLight.pause();
      }
    } else {
      if (heroVidLight) {
        heroVidLight.currentTime = 0;
        heroVidLight.style.display = 'block';
        heroVidLight.classList.add('is-active');
        heroVidLight.play().catch(() => {});
      }
      if (heroVidNight) {
        heroVidNight.classList.remove('is-active');
        heroVidNight.pause();
      }
    }
  }
}

const dnBtn = $('dn');
if (dnBtn) {
  dnBtn.onclick = () => {
    const nextMode = (heroOpeningMode === 'day') ? 'night' : 'day';
    setSiteTheme(nextMode, true);
  };
}

// System theme changes (prefers-color-scheme)
if (typeof window !== 'undefined' && window.matchMedia) {
  const sysTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const handleSysChange = (e) => {
    try {
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        setSiteTheme(e.matches ? 'night' : 'day', false);
      }
    } catch (err) {}
  };
  if (sysTheme.addEventListener) {
    sysTheme.addEventListener('change', handleSysChange);
  } else if (sysTheme.addListener) {
    sysTheme.addListener(handleSysChange);
  }
}

// Initial synchronization on module execution
setSiteTheme(heroOpeningMode, false);
