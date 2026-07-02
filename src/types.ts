export type ResourceType = 
  | 'catnip' 
  | 'wood' 
  | 'minerals' 
  | 'iron' 
  | 'science' 
  | 'culture' 
  | 'darkMatter'
  | 'portalFluid'
  | 'flurbo';

export type BuildingType = 
  | 'catnipField' 
  | 'aqueduct' 
  | 'pasture' 
  | 'hut' 
  | 'logHouse' 
  | 'mansion' 
  | 'barn' 
  | 'warehouse' 
  | 'library' 
  | 'academy' 
  | 'mine' 
  | 'smelter' 
  | 'amphitheatre'
  | 'darkMatterExtractor'
  | 'cloningVat'
  | 'portalGenerator';

export type JobType = 
  | 'farmer' 
  | 'woodcutter' 
  | 'scholar' 
  | 'miner' 
  | 'priest'
  | 'darkMatterScientist'
  | 'fluidEngineer';

export type ScienceType = 
  | 'calendar' 
  | 'agriculture' 
  | 'woodworking' 
  | 'mining' 
  | 'metalworking' 
  | 'theology' 
  | 'writing'
  | 'darkMatterPhysics'
  | 'fluidDynamics';

export type UpgradeType = 
  | 'mineralAxes' 
  | 'ironAxes' 
  | 'catnipSilos' 
  | 'reinforcedBarns' 
  | 'expandedStorage'
  | 'portalHeaters'
  | 'darkMatterContainment'
  | 'fluidTanks'
  | 'autoRefineWood'
  | 'autoRefineMinerals';

export type PortalUpgradeType = 
  | 'dimensionalAmplifier' 
  | 'quantumResonator' 
  | 'fluxAccelerator'
  | 'chronalDilator';

export type DimensionType = 'EarthC137' | 'Froopyland' | 'Citadel' | 'Gazorpazorp' | 'Cronenberg';

export interface Kitten {
  id: string;
  name: string;
  surname: string;
  job: JobType | 'unemployed';
  trait: string;
  level: number;
  exp: number;
  skillBonus: string;
}

export interface GameLogMessage {
  id: string;
  time: string;
  text: string;
  type: 'info' | 'success' | 'warn' | 'dimension' | 'death';
}

export interface ActiveCertificateBoost {
  id: string;
  certificateType: 'bronze' | 'silver' | 'gold' | 'infinite';
  name: string;
  timeRemaining: number; // in seconds
  totalDuration: number; // original duration in seconds
  boostPercent: number; // e.g. 0.15 for 15%
}

export interface LifetimeStats {
  totalTimePlayed: number; // in seconds
  totalMortysBorn: number;
  totalResourcesHarvested: number;
}

export interface GameState {
  // Lifetime stats
  lifetimeStats?: LifetimeStats;

  // Resources
  resources: Record<ResourceType, { amount: number; max: number }>;
  
  // Buildings counts
  buildings: Record<BuildingType, number>;
  
  // Research state
  researched: Record<ScienceType, boolean>;
  
  // Upgrade state
  upgrades: Record<UpgradeType, boolean>;
  
  // Village / Kittens
  village: {
    kittens: Kitten[];
    maxKittens: number;
    happiness: number; // percentage (e.g. 100)
  };
  
  // Current dimension for hopping
  currentDimension: DimensionType;
  
  // Seasonal Calendar System
  year: number;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  day: number;
  dayProgress: number;

  // Portal Crafting & Morty Certificates
  activeCertificates?: ActiveCertificateBoost[];
  craftedCertificatesCount?: Record<string, number>;
  achievements?: Record<string, boolean>;
  portalFlux: number;

  // Progression unlocks
  unlocks: {
    wood: boolean;
    minerals: boolean;
    iron: boolean;
    science: boolean;
    village: boolean;
    workshop: boolean;
    culture: boolean;
    darkMatter: boolean;
    fluid: boolean;
  };
  
  // Game settings
  gameSpeed: number; // 0 (paused), 1, 5, 10
  soundEnabled: boolean;
  lastTick: number;
  logs: GameLogMessage[];
  theme: 'dark' | 'light' | 'trevor';
  buyMultiplier: 1 | 5 | 'max';
  insaneMode: boolean;
  density: 'compact' | 'relaxed';
  activeAnomaly: {
    id: string;
    type: 'fluid_leak' | 'fed_raid' | 'cromulon' | 'microverse_decay';
    name: string;
    desc: string;
    durationLeft: number;
    clicksRequired: number;
    clicksMade: number;
  } | null;
  autoBuild: {
    pasture: boolean;
    barn: boolean;
    catnipField: boolean;
  };
  
  // Prestige
  dimensionEnterTime: number;
  portalResets: number;
  prestigeMultiplier: number;

  // QoL settings
  essentialJobs: Record<JobType, boolean>;
  smartAssignRatios: Record<JobType, number>;
  smartAssignMode: 'dynamic' | 'custom';
  jobPresets: Record<string, Record<JobType, number>>;

  // Portal Upgrades state
  portalUpgrades: Record<PortalUpgradeType, number>;

  // Actions
  tick: (deltaSeconds: number) => void;
  gatherCatnip: (multiplier?: number) => void;
  buyBuilding: (type: BuildingType, quantity?: number | 'max') => void;
  assignJob: (kittenId: string, job: JobType | 'unemployed') => void;
  assignJobsMultiple: (kittenIds: string[], job: JobType | 'unemployed') => void;
  autoAssignAll: (job: JobType) => void;
  unassignAll: () => void;
  researchScience: (type: ScienceType) => void;
  buyUpgrade: (type: UpgradeType) => void;
  buyPortalUpgrade: (type: PortalUpgradeType) => void;
  forceAddKitten: () => void;
  portalReset: () => void;
  addLog: (text: string, type?: GameLogMessage['type']) => void;
  hardReset: () => void;
  setGameSpeed: (speed: number) => void;
  toggleSound: () => void;
  setTheme: (theme: 'dark' | 'light' | 'trevor') => void;
  setBuyMultiplier: (multiplier: 1 | 5 | 'max') => void;
  synthesizeCertificate: (certificateType: 'bronze' | 'silver' | 'gold' | 'infinite') => void;
  toggleInsaneMode: () => void;
  setDensity: (density: 'compact' | 'relaxed') => void;
  defuseAnomalyClick: () => void;
  defuseAnomalyInstant: () => void;
  toggleAutoBuild: (type: 'pasture' | 'barn' | 'catnipField') => void;
  toggleEssentialJob: (job: JobType) => void;
  setSmartAssignRatio: (job: JobType, ratio: number) => void;
  setSmartAssignMode: (mode: 'dynamic' | 'custom') => void;
  saveJobPreset: (name: string) => void;
  loadJobPreset: (name: string) => void;
  deleteJobPreset: (name: string) => void;
  loadCloudState: (cloudState: any) => void;
}
