import { 
  BuildingType, 
  JobType, 
  ScienceType, 
  UpgradeType, 
  SeasonType, 
  ResourceType 
} from './types';

export interface BuildingDef {
  name: string;
  desc: string;
  baseCost: Partial<Record<ResourceType, number>>;
  costRatio: number;
  category: 'production' | 'storage' | 'residential' | 'scientific';
}

export interface JobDef {
  name: string;
  desc: string;
  effectsDesc: string;
  icon: string;
}

export interface ScienceDef {
  name: string;
  desc: string;
  cost: Partial<Record<ResourceType, number>>;
  effectsDesc: string;
}

export interface UpgradeDef {
  name: string;
  desc: string;
  cost: Partial<Record<ResourceType, number>>;
  effectsDesc: string;
}

export const BUILDINGS: Record<BuildingType, BuildingDef> = {
  catnipField: {
    name: 'Catnip Field',
    desc: 'An agricultural field for farming fresh catnip.',
    baseCost: { catnip: 15 },
    costRatio: 1.12,
    category: 'production'
  },
  aqueduct: {
    name: 'Aqueduct',
    desc: 'An advanced irrigation system. Boosts passive catnip output by +25% per aqueduct.',
    baseCost: { catnip: 150, wood: 25 },
    costRatio: 1.15,
    category: 'production'
  },
  pasture: {
    name: 'Pasture',
    desc: 'Reduces individual kitten food consumption by -0.15% (up to -50% total) and acts as a minor catnip reserve.',
    baseCost: { catnip: 250, wood: 50 },
    costRatio: 1.18,
    category: 'production'
  },
  hut: {
    name: 'Hut',
    desc: 'A basic shelter providing a cozy hearth for 2 kittens.',
    baseCost: { wood: 5 },
    costRatio: 2.50,
    category: 'residential'
  },
  logHouse: {
    name: 'Log House',
    desc: 'A solid, heat-retaining oak house providing rooms for 1 kitten.',
    baseCost: { wood: 150, minerals: 60 },
    costRatio: 1.15, // standard build ratio
    category: 'residential'
  },
  barn: {
    name: 'Barn',
    desc: 'Expands maximum storage capacities of Catnip (+5,000), Wood (+200), Minerals (+200), Iron (+50).',
    baseCost: { wood: 50 },
    costRatio: 1.75,
    category: 'storage'
  },
  warehouse: {
    name: 'Warehouse',
    desc: 'Professional stone vault. Expands Wood (+150), Minerals (+500), Iron (+150). Increases Science capacity (+100).',
    baseCost: { wood: 150, minerals: 100 },
    costRatio: 1.15,
    category: 'storage'
  },
  library: {
    name: 'Library',
    desc: 'A structure full of ancient kitten scrolls. Increments Science capacity (+250).',
    baseCost: { wood: 25 },
    costRatio: 1.15,
    category: 'scientific'
  },
  academy: {
    name: 'Academy',
    desc: 'A gorgeous high-rise institute. +1,000 Science limit and boosts scholar productivity (+20% per academy).',
    baseCost: { wood: 250, minerals: 150, iron: 20 },
    costRatio: 1.15,
    category: 'scientific'
  },
  mine: {
    name: 'Mine',
    desc: 'Allows mining of slate ore, which provides a passive mineral rate & unlocks Miner jobs.',
    baseCost: { wood: 100 },
    costRatio: 1.15,
    category: 'production'
  },
  smelter: {
    name: 'Smelter',
    desc: 'Passive brick furnace. Consumes -1.0 Wood & -10 Minerals/s, but smelts +0.15 Iron/s.',
    baseCost: { minerals: 200 },
    costRatio: 1.15,
    category: 'production'
  },
  amphitheatre: {
    name: 'Amphitheatre',
    desc: 'Entertain your kittens! Boosts global happiness (+4% each) and dampens population stress.',
    baseCost: { wood: 150, minerals: 50, iron: 10 },
    costRatio: 1.15,
    category: 'residential'
  }
};

export const JOBS: Record<JobType, JobDef> = {
  farmer: {
    name: 'Farmer',
    desc: 'Gathers sweet, delicious catnip from the fields.',
    effectsDesc: '+5.0 Catnip/sec',
    icon: 'Leaf'
  },
  woodcutter: {
    name: 'Woodcutter',
    desc: 'Fells nearby tall spruce trees for lumber.',
    effectsDesc: '+0.10 Wood/sec',
    icon: 'Trees'
  },
  scholar: {
    name: 'Scholar',
    desc: 'Studies cosmological phenomena and mechanics.',
    effectsDesc: '+0.25 Science/sec',
    icon: 'GraduationCap'
  },
  miner: {
    name: 'Miner',
    desc: 'Mines subterranean minerals and clay.',
    effectsDesc: '+0.18 Minerals/sec',
    icon: 'Pickaxe'
  },
  priest: {
    name: 'Priest',
    desc: 'Contemplates divinity, raising village culture.',
    effectsDesc: '+0.15 Culture/sec',
    icon: 'Flame'
  }
};

export const SCIENCES: Record<ScienceType, ScienceDef> = {
  calendar: {
    name: 'Calendar',
    desc: 'The study of temporal cycles, seasons, and stellar progression.',
    cost: { science: 25 },
    effectsDesc: 'Unlocks Seasonal Cycles (Spring, Summer, Autumn, Winter)'
  },
  agriculture: {
    name: 'Agriculture',
    desc: 'Development of advanced catnip breeding, hoes, and soil rotation.',
    cost: { science: 100 },
    effectsDesc: 'Unlocks Aqueducts building and boosts Farmer production by +20%'
  },
  woodworking: {
    name: 'Woodworking',
    desc: 'Techniques for building complex timber trusses and multi-floor huts.',
    cost: { science: 150 },
    effectsDesc: 'Unlocks Log Houses and allows crafting of Beams'
  },
  mining: {
    name: 'Mining',
    desc: 'The discovery of deep underground ores, pickaxe craft, and slate breaking.',
    cost: { science: 250 },
    effectsDesc: 'Unlocks Mines, miner jobs, and allows crafting of Slabs'
  },
  metalworking: {
    name: 'Metalworking',
    desc: 'The extraction of high-grade copper and iron ore from underground slate.',
    cost: { science: 500, minerals: 100 }, // We can use minerals
    effectsDesc: 'Unlocks Smelters and allows crafting of iron Plates'
  },
  writing: {
    name: 'Writing',
    desc: 'Using charcoal ink on catnip fibers to preserve kitten achievements across generations.',
    cost: { science: 750 },
    effectsDesc: 'Unlocks Academies and allows crafting of Parchment scrolls via Culture'
  },
  theology: {
    name: 'Theology',
    desc: 'Deep contemplation of ancient celestial kitten deities, cathedrals, and spirits.',
    cost: { science: 1250, catnip: 5000 },
    effectsDesc: 'Unlocks Priest job, Temples/Amphitheatres and Culture resource'
  }
};

export const UPGRADES: Record<UpgradeType, UpgradeDef> = {
  mineralAxes: {
    name: 'Mineral Axes',
    desc: 'Hard flint blades that fell timber with astonishing ease.',
    cost: { science: 100, minerals: 200 },
    effectsDesc: 'Permanently increases Woodcutter job efficiency by +25%'
  },
  ironAxes: {
    name: 'Iron Axes',
    desc: 'Tempered forged iron pickaxes and saws for swift lumber logging.',
    cost: { science: 400, iron: 40 },
    effectsDesc: 'Permanently increases Woodcutter job efficiency by +50%'
  },
  catnipSilos: {
    name: 'Catnip Catacombs',
    desc: 'Ventilated underground storage cellars to keep catnip dry and fresh.',
    cost: { science: 200, wood: 100 },
    effectsDesc: 'Amplifies all Catnip maximum storage caps by +50%'
  },
  reinforcedBarns: {
    name: 'Steel Truss Barns',
    desc: 'Barns reinforced with premium crossbars and timber anchors.',
    cost: { science: 500, iron: 75 },
    effectsDesc: 'Increases Wood and Mineral storage limits by +40%'
  },
  expandedStorage: {
    name: 'Compartment Vaults',
    desc: 'Intelligent cataloguing and spatial arrangement in Warehouses.',
    cost: { science: 800, iron: 120, wood: 500 },
    effectsDesc: 'Increases Warehouse capacity for all resources by +35%'
  }
};

// Fun Kitty Name Databases for high-end feel
const KITTEN_NAMES = [
  'Buster', 'Cleo', 'Duffy', 'Gizmo', 'Luna', 'Mimi', 'Nala', 'Oscar', 'Precious', 'Simba', 
  'Ziggy', 'Mittens', 'Sassy', 'Alfie', 'Boots', 'Coco', 'Felix', 'Jasper', 'Lola', 'Milo',
  'Oliver', 'Shadow', 'Whiskey', 'Cinnamon', 'Peanut', 'Casper', 'Barnaby', 'Merlin', 'Pippin',
  'Muffin', 'Waffles', 'Tippy', 'Whiskers', 'Nibbles', 'Bella', 'Smokey', 'Socks', 'Toby'
];

const KITTEN_SURNAMES = [
  'Catnipper', 'Pawsmith', 'Screecher', 'Purrington', 'Tailwagger', 'Whiskerfield', 'Clawson',
  'Pouncey', 'Mouser', 'Scratcher', 'Meowitzer', 'Softpaw', 'Fluffington', 'Warmheart', 'Fishhunter'
];

const KITTEN_TRAITS = [
  'Diligent (+10% Farmer speed)',
  'Stout (+10% Woodcutter output)',
  'Curious (+10% Scientist speed)',
  'Tenurious (+10% Miner speed)',
  'Saintly (+10% Priest speed)',
  'Glutton (Consumes 5% less catnip)',
  'Playful (+5% global happiness modifier)',
  'Sleepy (Slow but adorable)',
  'Charismatic (Increases culture conversion)'
];

export function generateRandomKitten(): {
  id: string;
  name: string;
  surname: string;
  job: JobType | 'unemployed';
  trait: string;
  level: number;
  exp: number;
  skillBonus: string;
} {
  const randName = KITTEN_NAMES[Math.floor(Math.random() * KITTEN_NAMES.length)];
  const randSurname = KITTEN_SURNAMES[Math.floor(Math.random() * KITTEN_SURNAMES.length)];
  const randTrait = KITTEN_TRAITS[Math.floor(Math.random() * KITTEN_TRAITS.length)];
  
  return {
    id: Math.random().toString(36).substring(2, 9),
    name: randName,
    surname: randSurname,
    job: 'unemployed',
    trait: randTrait,
    level: 1,
    exp: 0,
    skillBonus: ''
  };
}

export const SEASONS_DATA: Record<SeasonType, {
  name: string;
  catnipModifier: number; // multiplier on farmer and field production
  desc: string;
  color: string;
}> = {
  Spring: {
    name: 'Spring',
    catnipModifier: 1.50, // crops flourish
    desc: 'The fields melt, and the sweet sun warms the ground. Catnip production is boosted (+50%).',
    color: 'emerald'
  },
  Summer: {
    name: 'Summer',
    catnipModifier: 1.00, // standard rate
    desc: 'The hot solar season is dry and long. Catnip crops grow at normal speed.',
    color: 'amber'
  },
  Autumn: {
    name: 'Autumn',
    catnipModifier: 0.70, // fading crops
    desc: 'Cold winds whistle over dead golden fields. Catnip yields decrease (-30%). Winter is coming.',
    color: 'orange'
  },
  Winter: {
    name: 'Winter',
    catnipModifier: 0.15, // severe penalty
    desc: 'Devastating thick frost blankets the slate block. Catnip fields heavily frozen (-85%)! Kittens rely on reserves.',
    color: 'blue'
  }
};
