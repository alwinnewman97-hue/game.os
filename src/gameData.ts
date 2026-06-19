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
    name: 'Mega-Seed Greenhouse',
    desc: 'A bio-engineered nursery to cultivate psychoactive Mega Seeds.',
    baseCost: { catnip: 15 },
    costRatio: 1.12,
    category: 'production'
  },
  aqueduct: {
    name: 'Portal Irrigation Pipe',
    desc: 'An advanced inter-dimensional hydration array. Boosts passive Mega Seed output by +25% per pipe.',
    baseCost: { catnip: 150, wood: 25 },
    costRatio: 1.15,
    category: 'production'
  },
  pasture: {
    name: 'Morty Play-Pen',
    desc: 'Reduces individual Morty seed consumption rate by -0.15% (up to -50% total) by decreasing their anxiety levels.',
    baseCost: { catnip: 250, wood: 50 },
    costRatio: 1.18,
    category: 'production'
  },
  hut: {
    name: 'Garage Laboratory',
    desc: 'Provides a workbench and standard camping quarters for up to 2 Mortys.',
    baseCost: { wood: 5 },
    costRatio: 2.50,
    category: 'residential'
  },
  logHouse: {
    name: 'Citadel Dormitory',
    desc: 'A high-density capsule accommodation unit providing comfortable lodgings for 1 Morty.',
    baseCost: { wood: 150, minerals: 60 },
    costRatio: 1.15, // standard build ratio
    category: 'residential'
  },
  barn: {
    name: 'Dimension Vault',
    desc: 'Expands maximum containment capacities of Mega Seeds (+5,000), Plutonium (+200), Kalaxian Crystals (+200), and Neutrium (+50).',
    baseCost: { wood: 50 },
    costRatio: 1.75,
    category: 'storage'
  },
  warehouse: {
    name: 'Microverse Depot',
    desc: 'Sub-atomic containment unit. Expands Plutonium (+150), Crystals (+500), and Neutrium (+150). Increases Forbidden Tech capacity (+100).',
    baseCost: { wood: 150, minerals: 100 },
    costRatio: 1.15,
    category: 'storage'
  },
  library: {
    name: "Rick's Cyber-Terminal",
    desc: "A modified terminal linked to Citadel files. Increments Forbidden Tech/Science capacity (+250).",
    baseCost: { wood: 25 },
    costRatio: 1.15,
    category: 'scientific'
  },
  academy: {
    name: 'Morty Academy',
    desc: 'An institute to instruct Mortys. Increases Forbidden Tech limit (+1,000) and boosts scholar Morty productivity (+20% each).',
    baseCost: { wood: 250, minerals: 150, iron: 20 },
    costRatio: 1.15,
    category: 'scientific'
  },
  mine: {
    name: 'Kalaxian Fault',
    desc: 'Harvests crystalline Kalaxian shards from deep meteor fault lines, providing passives & unlocking extraction jobs.',
    baseCost: { wood: 100 },
    costRatio: 1.15,
    category: 'production'
  },
  smelter: {
    name: 'Neutrium Reactor',
    desc: 'Cold-fusion furnace. Consumes -1.0 Plutonium & -10 Kalaxian Crystals/s, but produces +0.18 Neutrium/s.',
    baseCost: { minerals: 200 },
    costRatio: 1.15,
    category: 'production'
  },
  amphitheatre: {
    name: 'Schwifty Stage',
    desc: 'GET SCHWIFTY! Boosts global Morty happiness (+4% each) and dampens population existential dread.',
    baseCost: { wood: 150, minerals: 50, iron: 10 },
    costRatio: 1.15,
    category: 'residential'
  }
};

export const JOBS: Record<JobType, JobDef> = {
  farmer: {
    name: 'Botanist Morty',
    desc: 'Gathers sweet, psychoactive Mega Seeds from the incubator fields.',
    effectsDesc: '+5.0 Mega Seeds/sec',
    icon: 'Leaf'
  },
  woodcutter: {
    name: 'Plutonium Scrapper',
    desc: 'Dredges toxic Plutonium-239 isotopes for generator fuel.',
    effectsDesc: '+0.10 Plutonium/sec',
    icon: 'Trees'
  },
  scholar: {
    name: 'Scholar Morty',
    desc: 'Analyses dark matter configurations and cosmological science.',
    effectsDesc: '+0.25 Technology/sec',
    icon: 'GraduationCap'
  },
  miner: {
    name: 'Crystal Extractor',
    desc: 'Mines subterranean Kalaxian shards and space ores from alien crags.',
    effectsDesc: '+0.18 Crystals/sec',
    icon: 'Pickaxe'
  },
  priest: {
    name: 'Schwifty Musician',
    desc: 'Sings hit songs to get the crowd Schwifty, raising Citadel Vibe.',
    effectsDesc: '+0.15 Vibe/sec',
    icon: 'Flame'
  }
};

export const SCIENCES: Record<ScienceType, ScienceDef> = {
  calendar: {
    name: 'Portal Coordinates',
    desc: 'The study of universal navigation, portal formulas, and shift mechanics.',
    cost: { science: 25 },
    effectsDesc: 'Unlocks Dimensional Shifting (C-137, Citadel, Gazorpazorp, Froopyland)'
  },
  agriculture: {
    name: 'Seed Bio-Cloning',
    desc: 'Advanced genetic modifications to engineer extra-absorbent Mega Seed stalks.',
    cost: { science: 100 },
    effectsDesc: 'Unlocks Portal Irrigation Pipes and boosts Botanist production by +20%'
  },
  woodworking: {
    name: 'Plaxian Carpentry',
    desc: 'Architectural designs for high-integrity capsule hulls and workspace frames.',
    cost: { science: 150 },
    effectsDesc: 'Unlocks Citadel Dormitories and allows crafting of Nano-Beams'
  },
  mining: {
    name: 'Laser Fault-Drilling',
    desc: 'Advanced drilling rigs designed to extract deep Kalaxian crystalline veins.',
    cost: { science: 250 },
    effectsDesc: 'Unlocks Kalaxian Faults, crystal miners, and crafting of Magnetic Slabs'
  },
  metalworking: {
    name: 'Neutrium Smelting',
    desc: 'Superconducting thermal arrays to weld rare extra-galactic alloys.',
    cost: { science: 500, minerals: 100 },
    effectsDesc: 'Unlocks Neutrium Reactors and allows crafting of Neutrium Plates'
  },
  writing: {
    name: 'Interdimensional Cable',
    desc: 'Broadcasting brilliant multiversal content to fuel the minds of Scholar Mortys.',
    cost: { science: 750 },
    effectsDesc: 'Unlocks Morty Academies and allows crafting of Portal Formulas via Corporate Vibe'
  },
  theology: {
    name: 'Cromulon Reverence',
    desc: 'Understanding the cosmic heads in the sky. SHOW ME WHAT YOU GOT.',
    cost: { science: 1250, catnip: 5000 },
    effectsDesc: 'Unlocks Schwifty Musician job, Schwifty Stages and Schwifty Vibes'
  }
};

export const UPGRADES: Record<UpgradeType, UpgradeDef> = {
  mineralAxes: {
    name: 'Crystalline Extractors',
    desc: 'Vibro-drill lasers that fragment plutonium isotopes effortlessly.',
    cost: { science: 100, minerals: 200 },
    effectsDesc: 'Permanently increases Plutonium Scrapper speed by +25%'
  },
  ironAxes: {
    name: 'Neutrium Thermal Lasers',
    desc: 'Supercharged laser-axes for high-yield, hyper-fast isotope extraction.',
    cost: { science: 400, iron: 40 },
    effectsDesc: 'Permanently increases Plutonium Scrapper speed by +50%'
  },
  catnipSilos: {
    name: 'Cryogenic Seed Silos',
    desc: 'Thermally isolated vacuum containers that preserve loose seeds indefinitely.',
    cost: { science: 200, wood: 100 },
    effectsDesc: 'Amplifies all Mega Seed maximum capacity ceilings by +50%'
  },
  reinforcedBarns: {
    name: 'Titanium-Mesh Vaults',
    desc: 'Containment vaults insulated with cross-linked titanium girders.',
    cost: { science: 500, iron: 75 },
    effectsDesc: 'Increases Plutonium and Kalaxian Crystal storage limits by +40%'
  },
  expandedStorage: {
    name: 'Spatial Compressors',
    desc: 'Microverse matrix contraction nodes that expand relative interior capacity.',
    cost: { science: 800, iron: 120, wood: 500 },
    effectsDesc: 'Increases Storage Depot capacity across all elements by +35%'
  }
};

// Fun Morty/Rick names database for the Multiverse feel
const KITTEN_NAMES = [
  'Hammer', 'Slick', 'Fat', 'Cop', 'Campaign', 'Lizard', 'Cyclops', 'Cronenberg', 
  'Toxic', 'Tiny', 'President', 'Super', 'Evil', 'Noob-Noob', 'Scary', 'Pickle', 
  'Snuffles', 'Bird', 'Sleepy', 'Muscle', 'Pencilvester', 'Abradolf', 'Krombopulos',
  'Unity', 'Doofus', 'Reverse', 'Glootie', 'Gorgon', 'Mesa', 'Specter', 'Wasp', 'C-137'
];

const KITTEN_SURNAMES = [
  'Morty', 'Rick', 'Sanchez', 'Smith', 'the Squanch', 'Person', 'Meeseeks', 'Lincler',
  'Terry', 'Michael', 'Gear', 'Gary', 'Poopybutthole', 'Tension-Coil', 'the Clone', 'Gromflomite'
];

const KITTEN_TRAITS = [
  'High Anxiety (+10% Harvest speed)',
  'Adrenaline Rush (+10% Plutonium scrapper rate)',
  'Wubba Lubba Dub Dub (+10% Scholar intelligence)',
  'Sub-atomic focus (+10% Crystal miner speed)',
  'Ultra-Schwifty (+10% Musician vibe gain)',
  'Mega-Seed Tolerant (Consumes 5% less resources)',
  'Dimension traveler (+5% global happiness modifier)',
  'Gullible Companion (A bit slow but extremely loyal)',
  'Citadel Diplomat (+5% conversion rates)'
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
    name: 'Citadel of Ricks',
    catnipModifier: 1.50, // crops flourish
    desc: 'Dense technosphere of infinite Ricks and Mortys. Mega Seed cultivation grows beautifully (+50%).',
    color: 'emerald'
  },
  Summer: {
    name: 'Dimension C-137',
    catnipModifier: 1.00, // standard rate
    desc: 'Standard green Earth universe. Mega Seeds grow at perfect baseline rates.',
    color: 'amber'
  },
  Autumn: {
    name: 'Gazorpazorp',
    catnipModifier: 0.70, // fading crops
    desc: 'A scarlet alien land governed by volatile creatures. Cultivation falls off (-30%).',
    color: 'orange'
  },
  Winter: {
    name: 'Froopyland',
    catnipModifier: 0.15, // severe penalty
    desc: 'A candy-coated nightmare dimension frozen by cryogenic rifts. Grenhouses freeze up (-85%)! Rely on vault storage.',
    color: 'blue'
  }
};
