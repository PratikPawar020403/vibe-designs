// Stage 09 Content Contract: Enforcing strict schema requirements.

export type LifecycleState = 'COMING_SOON' | 'ACTIVE' | 'SOLD_OUT' | 'ARCHIVED';
export type CommerceAction = 'BUY' | 'FIND_RETAILER' | 'NONE';

export interface TicketSpecs {
  abv: string; // Stored as string to allow '5.4%' or '[VERIFIED CONTENT REQUIRED]'
  ibu: string;
  ingredients: string[];
  tastingNotes?: string[];
}

export interface CommerceCapability {
  actionType: CommerceAction;
  target?: string;
  price?: string;
}

export interface Product {
  id: string;
  name: string;
  type: string; // e.g., 'Core', 'Experimental', 'Editorial'
  lifecycleState: LifecycleState;
  
  // The primary visual representing the product
  primaryVisual: string;
  
  // Gallery visuals for exploration
  secondaryVisuals?: string[];
  
  // Optional narrative
  description?: string;
  
  // The Ticket Module Data
  specs?: TicketSpecs;
  
  // Optional Commerce layer (Decoupled from specs)
  commerce?: CommerceCapability;
  
  // Chronological placement (important for the Experimental Archive)
  releaseDate?: string;

  // For complex editorial journeys
  editorialSteps?: { title: string, text: string, visual: string }[];

  // Horizontal Scroll Video Journey
  videoJourney?: VideoJourneyConfig;
}

export interface VideoChapter {
  step: string;
  label: string;
  targetProgress?: number;
}

export interface VideoJourneyConfig {
  src: string;
  mobileSrc?: string;
  fallbackSrc?: string;
  poster: string;
  maxTime?: number;
  trackLabel?: string;
  chapters?: VideoChapter[];
}

// MOCK DATASET
// Implementing 'Zero Fabrication' rule - using literal placeholders where data is unknown.

export const MOCK_CORE_COLLECTION: Product[] = [
  {
    id: "core-01",
    name: "Bengal Tiger NEIPA", 
    type: "Core",
    lifecycleState: "ACTIVE",
    primaryVisual: "/bengal-tiger-poster.jpg",
    secondaryVisuals: [
      "/mockup.jpg",
      "/difference.jpg"
    ],
    videoJourney: {
      src: "/bengal-tiger-desktop.mp4",
      mobileSrc: "/bengal-tiger-mobile.mp4",
      fallbackSrc: "/bengal-tiger-desktop.mp4",
      poster: "/bengal-tiger-poster.jpg",
      trackLabel: "TIGER EXPEDITION",
      chapters: [
        { step: "01", label: "JUNGLE WILD", targetProgress: 0.05 },
        { step: "02", label: "THE APPROACH", targetProgress: 0.45 },
        { step: "03", label: "BENGAL TIGER CAN", targetProgress: 0.92 },
      ]
    },
    description: "Our flagship New England IPA. A juicy, hops-driven manifestation of the Kinetic Bazaar. Scroll horizontally to journey from the wild jungle clearing through the tiger's approach to the Bengal Tiger can.",
    specs: {
      abv: "6.8%",
      ibu: "[VERIFIED IBU REQUIRED]",
      ingredients: ["Water", "Malt", "Hops", "Yeast"],
    }
  },
  {
    id: "core-02",
    name: "Bombay Brew IPA",
    type: "Core",
    lifecycleState: "ACTIVE",
    primaryVisual: "/ipa.jpg",
    secondaryVisuals: [
      "/experimental_bottle.jpg"
    ],
    videoJourney: {
      src: "/bombay-brew-desktop.mp4",
      mobileSrc: "/bombay-brew-mobile.mp4",
      fallbackSrc: "/bombay-brew-desktop.mp4",
      poster: "/bombay-brew-poster.jpg",
      maxTime: 7.60,
      trackLabel: "MUMBAI ART JOURNEY",
      chapters: [
        { step: "01", label: "TRAIN", targetProgress: 0.05 },
        { step: "02", label: "AUTO", targetProgress: 0.45 },
        { step: "03", label: "BOMBAY BREW", targetProgress: 0.92 },
      ]
    },
    description: "Classic IPA heavily infused with vibrant local street art culture. Scroll horizontally to journey from the Mumbai local train through street art auto-rickshaws to the Bombay Brew can.",
    specs: {
      abv: "7.2%",
      ibu: "65",
      ingredients: ["Water", "Malt", "Citra Hops", "Yeast"],
    }
  }
];

export const MOCK_EXPERIMENTAL_ARCHIVE: Product[] = [
  {
    id: "exp-01",
    name: "Kinetic Brew IPA",
    type: "Experimental",
    lifecycleState: "ACTIVE",
    releaseDate: "2026-Q3",
    primaryVisual: "/kinetic-poster.jpg",
    secondaryVisuals: [
      "/kinetic-bottle.jpg"
    ],
    videoJourney: {
      src: "/kinetic-desktop.mp4",
      mobileSrc: "/kinetic-mobile.mp4",
      fallbackSrc: "/kinetic-desktop.mp4",
      poster: "/kinetic-poster.jpg",
      maxTime: 6.30,
      trackLabel: "KINETIC JOURNEY",
      chapters: [
        { step: "01", label: "VILLAGE HARVEST", targetProgress: 0.05 },
        { step: "02", label: "THE CART", targetProgress: 0.45 },
        { step: "03", label: "KINETIC BOTTLE", targetProgress: 0.90 },
      ]
    },
    description: "A limited run exploring kinetic motion and raw harvest botanicals. Scroll horizontally to journey from the village fields and bullock cart to the Kinetic Brew IPA bottle.",
    specs: {
      abv: "5.8%",
      ibu: "45",
      ingredients: ["Water", "Malt", "Hops", "Yeast"],
    }
  },
  {
    id: "exp-02",
    name: "Nightfall Imperial Stout",
    type: "Experimental",
    lifecycleState: "ACTIVE",
    releaseDate: "2026-Q2",
    primaryVisual: "/past_release.jpg",
    secondaryVisuals: [
      "/past_release.jpg"
    ],
    videoJourney: {
      src: "/nightfall-stout-desktop.mp4",
      mobileSrc: "/nightfall-stout-mobile.mp4",
      fallbackSrc: "/nightfall-stout-desktop.mp4",
      poster: "/nightfall-stout-poster.jpg",
      maxTime: 5.3,
      trackLabel: "NIGHTFALL JOURNEY",
      chapters: [
        { step: "01", label: "SKYLINE", targetProgress: 0.05 },
        { step: "02", label: "ROOFTOP", targetProgress: 0.50 },
        { step: "03", label: "NIGHTFALL STOUT", targetProgress: 0.95 },
      ]
    },
    description: "Our darkest experiment. Brewing notes suggest heavy chocolate and roasted coffee malt. Scroll horizontally to journey through nighttime skyline rooftops to the Nightfall Stout bottle.",
    specs: {
      abv: "11.2%",
      ibu: "30",
      ingredients: ["Water", "Roasted Malt", "Hops", "Yeast"],
    }
  }
];

export const MOCK_EDITORIAL_CONTENT: Product[] = [
  {
    id: "story-01",
    name: "The Process [STORY]",
    type: "Editorial",
    lifecycleState: "ACTIVE",
    primaryVisual: "/process-story-poster.jpg",
    secondaryVisuals: [
      "/process-phase-1.jpg",
      "/process-phase-2.jpg",
      "/process-phase-3.jpg",
      "/process-phase-4.jpg"
    ],
    videoJourney: {
      src: "/process-story-desktop.mp4",
      mobileSrc: "/process-story-mobile.mp4",
      fallbackSrc: "/process-story-desktop.mp4",
      poster: "/process-story-poster.jpg",
      trackLabel: "BREWING PROCESS",
      chapters: [
        { step: "01", label: "RAW BOTANICALS", targetProgress: 0.05 },
        { step: "02", label: "KETTLE & HOPS", targetProgress: 0.35 },
        { step: "03", label: "FERMENTATION", targetProgress: 0.65 },
        { step: "04", label: "THE FINISHED POUR", targetProgress: 0.92 },
      ]
    },
    description: "Follow the journey from raw chaos to refined structure across 4 distinct brewing phases.",
    editorialSteps: [
      {
        title: "01 / RAW BOTANICALS",
        text: "A chaotic bazaar of raw spices, grains, star anise, cinnamon, and hyper-local botanicals.",
        visual: "/process-phase-1.jpg"
      },
      {
        title: "02 / THE KETTLE BOIL",
        text: "The chaos meets the White Cube. Fresh whole-cone hops plunge into boiling wort under strict temperature control.",
        visual: "/process-phase-2.jpg"
      },
      {
        title: "03 / FERMENTATION",
        text: "Active, effervescent transformation where yeasts convert sugars into vibrant hazy carbonation.",
        visual: "/process-phase-3.jpg"
      },
      {
        title: "04 / THE FINISHED POUR",
        text: "The final product is a perfect suspension of energy. Liquid kinetic art, chilled and ready.",
        visual: "/process-phase-4.jpg"
      }
    ]
  }
];
