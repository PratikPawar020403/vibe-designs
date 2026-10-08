export interface MenuBackItem {
  name: string;
  description: string;
  price: string;
}

export interface MenuCardConfig {
  id: string;
  number: string; // e.g. "01"
  edition: string; // e.g. "MENU / 01"
  title: string; // e.g. "COFFEE"
  descriptor: string; // e.g. "Bold flavors. Smooth moments."
  theme: 'cream' | 'taupe';
  image: string; // e.g. "/images/menu/coffee.webp"
  imageAlt: string;
  imageShape: 'round' | 'soft';
  hasStackedBacking?: 'left' | 'right';
  offsetY: number; // e.g. 10
  rotationDeg: number; // e.g. -1.2
  height: number;
  width: number;
  backItems: MenuBackItem[];
}

export const MENU_CARDS: MenuCardConfig[] = [
  {
    id: 'coffee',
    number: '01',
    edition: 'MENU / 01',
    title: 'COFFEE',
    descriptor: 'Bold flavors. Smooth moments.',
    theme: 'cream',
    image: '/images/menu/coffee.webp',
    imageAlt: 'Top-down freshly prepared cappuccino in ceramic cup with rosette latte art',
    imageShape: 'round',
    hasStackedBacking: 'left',
    offsetY: 10,
    rotationDeg: -1.2,
    height: 485,
    width: 325,
    backItems: [
      {
        name: 'ESPRESSO',
        description: 'Rich · intense double extraction',
        price: '₹180',
      },
      {
        name: 'AMERICANO',
        description: 'Bold · smooth hot or iced spring water',
        price: '₹220',
      },
      {
        name: 'CAPPUCCINO',
        description: 'Velvety · balanced dark cacao notes',
        price: '₹280',
      },
      {
        name: 'FLAT WHITE',
        description: 'Silky · rich double ristretto microfoam',
        price: '₹290',
      },
      {
        name: 'LATTE',
        description: 'Smooth · creamy steamed oat or farm milk',
        price: '₹300',
      },
      {
        name: 'POUR OVER',
        description: 'Single-estate harvest brewed at 93°C',
        price: '₹340',
      },
    ],
  },
  {
    id: 'signatures',
    number: '02',
    edition: 'MENU / 02',
    title: 'SIGNATURES',
    descriptor: 'Curated recipes. Unique flavors.',
    theme: 'taupe',
    image: '/images/menu/signatures.webp',
    imageAlt: 'Hero glass of MEGTIK layered iced signature latte with condensation and espresso',
    imageShape: 'soft',
    offsetY: -14,
    rotationDeg: 0.5,
    height: 505,
    width: 335,
    backItems: [
      {
        name: 'MEGTIK SIGNATURE LATTE',
        description: 'Espresso · steamed milk · vanilla',
        price: '₹320',
      },
      {
        name: 'ICED CARAMEL LATTE',
        description: 'Espresso · caramel · cold milk',
        price: '₹340',
      },
      {
        name: 'COLD BREW',
        description: 'Slow steeped · smooth · bold',
        price: '₹300',
      },
      {
        name: 'CARDAMOM CORTADO',
        description: 'Single-origin espresso · cardamom · warm milk',
        price: '₹330',
      },
      {
        name: 'VANILLA TONIC',
        description: 'Tonic · Madagascar vanilla · double float',
        price: '₹350',
      },
    ],
  },
  {
    id: 'bites',
    number: '03',
    edition: 'MENU / 03',
    title: 'BITES',
    descriptor: 'Small bites. Big happiness.',
    theme: 'cream',
    image: '/images/menu/bites.webp',
    imageAlt: 'Golden flaky French croissant on ceramic stone plate with crumbs',
    imageShape: 'round',
    hasStackedBacking: 'right',
    offsetY: 8,
    rotationDeg: -0.8,
    height: 485,
    width: 325,
    backItems: [
      {
        name: 'BUTTER CROISSANT',
        description: 'Flaky · buttery · fresh 72-layer laminated pastry',
        price: '₹180',
      },
      {
        name: 'CHOCOLATE COOKIE',
        description: 'Warm · rich · crisp Valrhona dark chocolate',
        price: '₹120',
      },
      {
        name: 'SEASONAL CAKE',
        description: "Chef's daily selection · almond & Persian rose",
        price: '₹220',
      },
      {
        name: 'PASTRY OF THE DAY',
        description: 'Fresh from the oven · twice-baked brioche',
        price: '₹160',
      },
      {
        name: 'RICOTTA TARTINE',
        description: 'Warm sourdough · whipped ricotta · figs · thyme honey',
        price: '₹280',
      },
    ],
  },
];
