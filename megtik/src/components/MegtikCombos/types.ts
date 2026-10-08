export interface ComboItem {
  id: string;
  num: string;
  name: string; // "FIRST LIGHT", "GOLDEN HOUR", etc.
  coffeeName: string;
  coffeeDetail?: string;
  biteName: string;
  biteDetail?: string;
  description: string;
  price: string;
  coffeeImg?: string;
  biteImg?: string;
  tag?: string;
}

export const COMBOS_DATA: ComboItem[] = [
  {
    id: 'combo-01',
    num: '01',
    name: 'FIRST LIGHT',
    coffeeName: 'Flat White',
    coffeeDetail: 'Double ristretto, textured velvety microfoam, golden crema',
    biteName: 'Golden Fold Croissant',
    biteDetail: 'Slow-laminated Normandy butter pastry, flaky honeycomb crumb',
    description: 'Warm pastry. First coffee. No rush.',
    price: '$12.00',
    tag: 'DAWN SPECIAL • PAIR 1-2',
    coffeeImg: '/images/combos/combo-01-coffee.webp',
    biteImg: '/images/combos/combo-01-bite.webp',
  },
  {
    id: 'combo-02',
    num: '02',
    name: 'GOLDEN HOUR',
    coffeeName: 'Bloom Filter Roast',
    coffeeDetail: 'Single-origin bloom pour-over, floral aromatics, crisp finish',
    biteName: 'Warm Pistachio Brioche',
    biteDetail: 'Stone-oven baked brioche, toasted Sicilian pistachios, honey glaze',
    description: 'Sunlight on wood. Rich aroma. Deep clarity.',
    price: '$12.50',
    tag: 'MIDDAY GLOW • PAIR 3-4',
    coffeeImg: '/images/combos/combo-02-coffee.webp',
    biteImg: '/images/combos/combo-02-bite.webp',
  },
  {
    id: 'combo-03',
    num: '03',
    name: 'SWEET ESCAPE',
    coffeeName: 'Signature Swan Latte',
    coffeeDetail: 'Single-origin espresso, warm Madagascar vanilla, artisan swan pour',
    biteName: 'Midnight Melt Cookie',
    biteDetail: '72% dark chocolate core, roasted hazelnuts, flaky sea salt',
    description: 'Fresh coffee. Dark chocolate. No regrets.',
    price: '$13.00',
    tag: 'AFTERNOON COOL • PAIR 5-6',
    coffeeImg: '/images/combos/combo-03-coffee.webp',
    biteImg: '/images/combos/combo-03-bite.webp',
  },
  {
    id: 'combo-04',
    num: '04',
    name: 'LAZY AFTERNOON',
    coffeeName: 'Charging Cold Brew',
    coffeeDetail: '18-hour cold steeped single origin, notes of cacao and stonefruit',
    biteName: 'Velvet Berry Danish',
    biteDetail: 'Crisp pastry leaf, vanilla bean custard, wild blackberry compote',
    description: 'Slow, balanced, and made for lingering.',
    price: '$13.50',
    tag: 'SLOW LIVING • PAIR 7-8',
    coffeeImg: '/images/combos/combo-04-coffee.webp',
    biteImg: '/images/combos/combo-04-bite.webp',
  },
];
