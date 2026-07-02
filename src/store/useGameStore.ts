import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  GameState, 
  ResourceType, 
  BuildingType, 
  JobType, 
  ScienceType, 
  UpgradeType, 
  PortalUpgradeType,
  DimensionType, 
  Kitten, 
  GameLogMessage,
  ActiveCertificateBoost
} from '../types';
import { BUILDINGS, SCIENCES, JOBS, UPGRADES, PORTAL_UPGRADES, DIMENSIONS_DATA, generateRandomKitten } from '../gameData';
import { ACHIEVEMENTS } from '../utils/achievements';
import { playClickSound } from '../utils/audio';

export interface CertificateDef {
  id: 'bronze' | 'silver' | 'gold' | 'infinite';
  name: string;
  desc: string;
  boostPercent: number; // 0.15 = 15%
  duration: number; // in seconds (e.g. 180)
  costs: {
    science?: number;
    culture?: number;
    wood?: number;
    minerals?: number;
    iron?: number;
  };
}

export const CERTIFICATES: Record<string, CertificateDef> = {
  bronze: {
    id: 'bronze',
    name: 'Citadel Class-C Morty Certificate',
    desc: 'Authorized clone registry form. Temporarily boosts all job productivity by +15% for 3 minutes.',
    boostPercent: 0.15,
    duration: 180,
    costs: {
      science: 500,
      wood: 2500,
      minerals: 2500,
    }
  },
  silver: {
    id: 'silver',
    name: 'Interdimensional Class-B Morty Certificate',
    desc: 'Approved space-time travel clearance document. Temporarily boosts all job productivity by +30% for 6 minutes.',
    boostPercent: 0.30,
    duration: 360,
    costs: {
      science: 2500,
      wood: 5000,
      iron: 3000,
    }
  },
  gold: {
    id: 'gold',
    name: 'Galactic Federation Class-A Morty Certificate',
    desc: 'Premium administrative exemption permit. Temporarily boosts all job productivity by +60% for 12 minutes.',
    boostPercent: 0.60,
    duration: 720,
    costs: {
      culture: 1000,
      minerals: 10000,
      iron: 6000,
      science: 10000,
    }
  },
  infinite: {
    id: 'infinite',
    name: 'Council of Ricks Multiversal Sovereign Stamp',
    desc: 'Sub-space supreme identification passport. Temporarily doubles all job productivity (+100%) for 20 minutes.',
    boostPercent: 1.00,
    duration: 1200,
    costs: {
      culture: 5000,
      wood: 25000,
      minerals: 25000,
      iron: 15000,
      science: 25000,
    }
  }
};

export const DAY_DURATION_IN_GAME_SEC = 5; // 1 in-game day = 5 real-life seconds

const BASE_RESOURCES: Record<ResourceType, { amount: number; max: number }> = {
  catnip: { amount: 50, max: 2000 },
  wood: { amount: 0, max: 200 },
  minerals: { amount: 0, max: 0 },
  iron: { amount: 0, max: 0 },
  science: { amount: 0, max: 0 },
  culture: { amount: 0, max: 0 },
  darkMatter: { amount: 0, max: 0 },
  portalFluid: { amount: 0, max: 0 },
  flurbo: { amount: 0, max: 1000 }
};

const BASE_BUILDINGS: Record<BuildingType, number> = {
  catnipField: 0,
  aqueduct: 0,
  pasture: 0,
  hut: 0,
  logHouse: 0,
  mansion: 0,
  barn: 0,
  warehouse: 0,
  library: 0,
  academy: 0,
  mine: 0,
  smelter: 0,
  amphitheatre: 0,
  darkMatterExtractor: 0,
  cloningVat: 0,
  portalGenerator: 0
};

const BASE_RESEARCHED: Record<ScienceType, boolean> = {
  calendar: false,
  agriculture: false,
  woodworking: false,
  mining: false,
  metalworking: false,
  writing: false,
  theology: false,
  darkMatterPhysics: false,
  fluidDynamics: false
};

const BASE_UPGRADES: Record<UpgradeType, boolean> = {
  mineralAxes: false,
  ironAxes: false,
  catnipSilos: false,
  reinforcedBarns: false,
  expandedStorage: false,
  portalHeaters: false,
  darkMatterContainment: false,
  fluidTanks: false,
  autoRefineWood: false,
  autoRefineMinerals: false
};

const BASE_ESSENTIAL_JOBS: Record<JobType, boolean> = {
  farmer: false,
  woodcutter: false,
  scholar: false,
  miner: false,
  priest: false,
  darkMatterScientist: false,
  fluidEngineer: false
};

const BASE_SMART_ASSIGN_RATIOS: Record<JobType, number> = {
  farmer: 1,
  woodcutter: 1,
  scholar: 1,
  miner: 1,
  priest: 1,
  darkMatterScientist: 1,
  fluidEngineer: 1
};

export const calculateCost = (baseCost: number, ratio: number, amount: number) => {
  return baseCost * Math.pow(ratio, amount);
};

export function calculateJobStrengths(kittens: Kitten[]): Record<JobType, number> {
  const strengths: Record<JobType, number> = {
    farmer: 0,
    woodcutter: 0,
    scholar: 0,
    miner: 0,
    priest: 0,
    darkMatterScientist: 0,
    fluidEngineer: 0
  };

  if (!Array.isArray(kittens)) return strengths;

  kittens.forEach(k => {
    if (k.job !== 'unemployed' && strengths[k.job] !== undefined) {
      // Base strength is 1.0. Plus 5% per level above 1
      let multiplier = 1 + (k.level - 1) * 0.05;

      // Trait-specific bonuses (+10%)
      if (k.trait) {
        if (k.job === 'farmer' && k.trait.includes('High Anxiety')) {
          multiplier += 0.10;
        } else if (k.job === 'woodcutter' && k.trait.includes('Adrenaline Rush')) {
          multiplier += 0.10;
        } else if (k.job === 'scholar' && k.trait.includes('Wubba Lubba')) {
          multiplier += 0.10;
        } else if (k.job === 'miner' && k.trait.includes('Sub-atomic')) {
          multiplier += 0.10;
        } else if (k.job === 'priest' && k.trait.includes('Ultra-Schwifty')) {
          multiplier += 0.10;
        }
      }

      strengths[k.job] += multiplier;
    }
  });

  return strengths;
}

const initialLogs: GameLogMessage[] = [
  {
    id: 'initial',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    text: "Rick's portal scanner online. Cultivate Mega Seeds, engineer Laboratories, and gather alternative Mortys.",
    type: 'success'
  }
];

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      resources: BASE_RESOURCES,
      buildings: BASE_BUILDINGS,
      researched: BASE_RESEARCHED,
      upgrades: BASE_UPGRADES,
      essentialJobs: BASE_ESSENTIAL_JOBS,
      smartAssignRatios: BASE_SMART_ASSIGN_RATIOS,
      smartAssignMode: 'dynamic',
      village: {
        kittens: [],
        maxKittens: 0,
        happiness: 100,
      },
      activeCertificates: [],
      craftedCertificatesCount: { bronze: 0, silver: 0, gold: 0, infinite: 0 },
      achievements: {},
      portalFlux: 0,
      currentDimension: 'EarthC137',
      year: 1,
      season: 'spring',
      day: 1,
      dayProgress: 0,
      unlocks: {
        wood: false,
        minerals: false,
        iron: false,
        science: false,
        village: false,
        workshop: false,
        culture: false,
        darkMatter: false,
        fluid: false,
      },
      gameSpeed: 1,
      soundEnabled: true,
      lastTick: Date.now(),
      logs: initialLogs,
      theme: 'dark',
      buyMultiplier: 1,
      insaneMode: true,
      density: 'relaxed',
      activeAnomaly: null,
      autoBuild: {
        pasture: false,
        barn: false,
        catnipField: false,
      },
      portalResets: 0,
      prestigeMultiplier: 1.0,
      portalUpgrades: {
        dimensionalAmplifier: 0,
        quantumResonator: 0,
        fluxAccelerator: 0,
        chronalDilator: 0,
      },
      jobPresets: {},

      addLog: (text: string, type: GameLogMessage['type'] = 'info') => {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const newMsg: GameLogMessage = {
          id: Math.random().toString(),
          time: timeStr,
          text,
          type
        };
        set(state => ({
          logs: [newMsg, ...state.logs].slice(0, 80) // keep last 80 messages for high performance
        }));
      },

      toggleAutoBuild: (type: 'pasture' | 'barn' | 'catnipField') => set(state => ({
        autoBuild: {
          ...state.autoBuild,
          [type]: !state.autoBuild[type]
        }
      })),

      setGameSpeed: (speed: number) => set({ gameSpeed: speed }),
      toggleSound: () => set(state => ({ soundEnabled: !state.soundEnabled })),
      setTheme: (theme: 'dark' | 'light' | 'trevor') => set({ theme }),
      setBuyMultiplier: (multiplier: 1 | 5 | 'max') => set({ buyMultiplier: multiplier }),

      tick: (deltaSeconds: number) => {
        let state = get();
        
        // Dynamic state correction: Self-heal if village structure is outdated or corrupt
        if (!state.village || !Array.isArray(state.village.kittens)) {
          const prevKittensCount = (state.village && typeof state.village.kittens === 'number') 
            ? (state.village.kittens as number) 
            : 0;
            
          const maxKittens = (state.buildings?.hut * 2) + (state.buildings?.logHouse * 1) + (state.buildings?.mansion * 4) || 0;
          const healedKittens: Kitten[] = [];
          
          // Limit to physical capacity
          const countToCreate = Math.min(prevKittensCount > 0 ? prevKittensCount : 0, maxKittens);
          for (let i = 0; i < countToCreate; i++) {
            healedKittens.push(generateRandomKitten());
          }
          
          set({
            village: {
              kittens: healedKittens,
              maxKittens: maxKittens,
              happiness: (state.village && typeof state.village.happiness === 'number') ? state.village.happiness : 100,
            }
          });
          state = get(); // retrieve healed state
        }

        if (state.gameSpeed === 0) return; // paused

        // Incorporate game speed and portal upgrades multipliers
        const chronalDilatorLevel = state.portalUpgrades?.chronalDilator ?? 0;
        const chronalMultiplier = 1 + (chronalDilatorLevel * 0.10);
        const effectiveDelta = deltaSeconds * state.gameSpeed * 1 * chronalMultiplier; // 1x time multiplier for accurate feel
        const now = Date.now();

        // ----------------------------------------
        // SEASONAL CALENDAR SYSTEM (GMT SYNCED)
        // ----------------------------------------
        const nowMs = Date.now();
        const totalRealSeconds = Math.floor(nowMs / 1000);
        const dayDuration = DAY_DURATION_IN_GAME_SEC;
        const totalInGameDays = Math.floor(totalRealSeconds / dayDuration);
        
        const newYear = Math.floor(totalInGameDays / 160) + 1;
        const seasonSequence: ('spring' | 'summer' | 'autumn' | 'winter')[] = ['spring', 'summer', 'autumn', 'winter'];
        const newSeasonIdx = Math.floor((totalInGameDays % 160) / 40);
        const newSeason = seasonSequence[newSeasonIdx];
        const newDay = (totalInGameDays % 40) + 1;
        const newDayProgress = (nowMs % (dayDuration * 1000)) / 1000;

        const seasonalLogs: GameLogMessage[] = [];
        
        // Detect transitions to add logs
        if (state.day !== undefined && (state.day !== newDay || state.season !== newSeason || state.year !== newYear)) {
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          
          if (state.year !== undefined && newYear !== state.year) {
            seasonalLogs.push({
              id: `season-spring-${newYear}-${Math.random()}`,
              time: timeStr,
              text: `🎉 Happy New Year! Welcome to Year ${newYear} in the Citadel of Ricks!`,
              type: 'success'
            });
          } else if (state.season !== undefined && newSeason !== state.season) {
            const seasonNames = {
              spring: '🌱 Spring (Vernal Equinox)',
              summer: '☀️ Summer (Solar Zenith)',
              autumn: '🍁 Autumn (Golden Harvest)',
              winter: '❄️ Winter (Cryo-Frost)'
            };
            seasonalLogs.push({
              id: `season-trans-${newSeason}-${newYear}-${Math.random()}`,
              time: timeStr,
              text: `🍂 The season has transitioned to ${seasonNames[newSeason]}. Adapt your laboratories!`,
              type: 'info'
            });
          }

          // Seasonal festival / event triggers
          if (newSeason === 'spring' && newDay === 10) {
            seasonalLogs.push({
              id: `fest-spring-start-${Math.random()}`,
              time: timeStr,
              text: `🌸 Festival Started: "Citadel Spring Break"! Mortys are ecstatic! (+20% Happiness, +15% Job Speed for 5 days)`,
              type: 'success'
            });
          } else if (newSeason === 'spring' && newDay === 15) {
            seasonalLogs.push({
              id: `fest-spring-end-${Math.random()}`,
              time: timeStr,
              text: `🌸 "Citadel Spring Break" festival has ended. Back to research!`,
              type: 'info'
            });
          } else if (newSeason === 'summer' && newDay === 20) {
            seasonalLogs.push({
              id: `fest-summer-start-${Math.random()}`,
              time: timeStr,
              text: `🔥 Event Started: "Solar Purge"! Intense radiation doubles Plutonium scrap yield, but warning of spatial anomalies!`,
              type: 'warn'
            });
          } else if (newSeason === 'summer' && newDay === 23) {
            seasonalLogs.push({
              id: `fest-summer-end-${Math.random()}`,
              time: timeStr,
              text: `🔥 "Solar Purge" radiation has subsided. Plutonium scrap rates return to normal.`,
              type: 'info'
            });
          } else if (newSeason === 'autumn' && newDay === 15) {
            seasonalLogs.push({
              id: `fest-autumn-start-${Math.random()}`,
              time: timeStr,
              text: `🍁 Event Started: "The Great Seed Harvest"! Botanical clones gather +50% extra Mega Seeds!`,
              type: 'success'
            });
          } else if (newSeason === 'autumn' && newDay === 20) {
            seasonalLogs.push({
              id: `fest-autumn-end-${Math.random()}`,
              time: timeStr,
              text: `🍁 "The Great Seed Harvest" has concluded.`,
              type: 'info'
            });
          } else if (newSeason === 'winter' && newDay === 25) {
            seasonalLogs.push({
              id: `fest-winter-start-${Math.random()}`,
              time: timeStr,
              text: `🎁 Holiday Event: "Cromulon Gift-giving"! The giant heads are pleased. +30% Science and Culture generation!`,
              type: 'success'
            });
          } else if (newSeason === 'winter' && newDay === 30) {
            seasonalLogs.push({
              id: `fest-winter-end-${Math.random()}`,
              time: timeStr,
              text: `🎁 "Cromulon Gift-giving" event has ended.`,
              type: 'info'
            });
          }
        }

        let dayProgress = newDayProgress;
        let day = newDay;
        let season = newSeason;
        let year = newYear;

        // Active event helpers
        const isSpringBreak = season === 'spring' && day >= 10 && day < 15;
        const isSolarPurge = season === 'summer' && day >= 20 && day < 23;
        const isSeedHarvest = season === 'autumn' && day >= 15 && day < 20;
        const isCromulonGifts = season === 'winter' && day >= 25 && day < 30;

        // Count down active certificates
        let updatedActive = (state.activeCertificates || []).map(cert => ({
          ...cert,
          timeRemaining: cert.timeRemaining - effectiveDelta
        })).filter(cert => cert.timeRemaining > 0);

        // Log expiration
        const prevActive = state.activeCertificates || [];
        if (prevActive.length > updatedActive.length) {
          prevActive.forEach(p => {
            const hasExpired = !updatedActive.some(u => u.id === p.id);
            if (hasExpired) {
              state.addLog(`Booster expired: ${p.name}'s production multiplier is deactivated.`, 'info');
            }
          });
        }

        const totalBoost = updatedActive.reduce((acc, cert) => acc + cert.boostPercent, 0);
        const certificateMultiplier = 1 + totalBoost;
        const portalFluxMultiplier = 1 + (state.portalFlux * 0.1);
        const dimAmplifierLevel = state.portalUpgrades?.dimensionalAmplifier ?? 0;
        const dimensionalMultiplier = 1 + (dimAmplifierLevel * 0.15);
        let productionMultiplier = certificateMultiplier * portalFluxMultiplier * dimensionalMultiplier * 1; // 1x base production multiplier

        // Anomaly tracking and processing
        let activeAnomaly = state.activeAnomaly ? { ...state.activeAnomaly } : null;
        let customCatnipDrain = 0;
        let customWoodDrain = 0;
        let customCultureDrain = 0;
        let microverseDecayActive = false;
        let federationRaidActive = false;
        let applyExplosionPenalty: string | null = null;

        if (activeAnomaly) {
          activeAnomaly.durationLeft -= effectiveDelta;
          
          if (activeAnomaly.durationLeft <= 0) {
            applyExplosionPenalty = activeAnomaly.type;
            let logMsg = '';
            
            if (applyExplosionPenalty === 'fluid_leak') {
              logMsg = '🚨 CRITICAL FAULT: Portal fluid rupture flooded the crops! 40% of Mega Seed and 20% of Plutonium reserves dissolved in sub-space acid!';
            } else if (applyExplosionPenalty === 'fed_raid') {
              logMsg = '🚨 CITADEL RAID: Galactic Federation hit squads breached the Clone Bay! Snatched 50% of your Crystals/Neutrium and captured 1 Morty!';
            } else if (applyExplosionPenalty === 'cromulon') {
              logMsg = '🚨 CROMULON REJECTION: The Giant Cosmic Head yelled DISQUALIFIED! Vibe down 50% and local morale is devastated.';
            } else if (applyExplosionPenalty === 'microverse_decay') {
              logMsg = '🚨 MICROVERSE COLLAPSE: A pocket reality collapsed, scattering 30% of stored raw materials into outer voids!';
            }
            
            state.addLog(logMsg, 'death');
            activeAnomaly = null;
          } else {
            if (activeAnomaly.type === 'fluid_leak') {
              customCatnipDrain = 8.0;
              customWoodDrain = 1.2;
            } else if (activeAnomaly.type === 'cromulon') {
              customCultureDrain = 4.0;
            } else if (activeAnomaly.type === 'microverse_decay') {
              microverseDecayActive = true;
            } else if (activeAnomaly.type === 'fed_raid') {
              federationRaidActive = true;
            }
          }
        } else if (state.insaneMode) {
          // Dimensional Anomalies occur only later once Laser Fault-Drilling (mining) is researched, the clone base size is >= 6, and at a much lower rate (over 13x lower probability)
          if (state.researched.mining && state.village.kittens.length >= 6 && Math.random() < 0.0006 * effectiveDelta) {
            const types = ['fluid_leak', 'fed_raid', 'cromulon', 'microverse_decay'] as const;
            const chosenType = types[Math.floor(Math.random() * types.length)];
            
            let name = '';
            let desc = '';
            if (chosenType === 'fluid_leak') {
              name = 'Portal Acid Geyser';
              desc = 'Toxic fluid leaking. Drains Mega Seeds and Plutonium passively. Resolve before detritus floods!';
            } else if (chosenType === 'fed_raid') {
              name = 'Galactic Fed Patrol';
              desc = 'Interdimensional spies sniffing. Reduces general production by 50%. Resolve or they storm the gates!';
            } else if (chosenType === 'cromulon') {
              name = 'Displeased Cosmic Cromulon';
              desc = 'Giant cosmic head demands song. Steals Schwifty Vibes. Resolve or happiness crashes!';
            } else if (chosenType === 'microverse_decay') {
              name = 'Microverse Pocket Compression';
              desc = 'Reality bounds shrinking. Halves all storage facilities. Resolve or elements collapse!';
            }

            activeAnomaly = {
              id: Math.random().toString(),
              type: chosenType,
              name,
              desc,
              durationLeft: 20,
              clicksRequired: 10,
              clicksMade: 0
            };
            
            state.addLog(`🚨 WARNING: Dimensional Anomaly [${name}] detected! Resolve in the Portal Stabilizer immediately!`, 'warn');
          }
        }

        if (state.insaneMode) {
          productionMultiplier *= 0.65;
        }
        if (federationRaidActive) {
          productionMultiplier *= 0.50;
        }

        // 1. Storage upgrade ratios
        const barnMultiplier = state.upgrades.reinforcedBarns ? 1.4 : 1.0;
        const warehouseMultiplier = state.upgrades.expandedStorage ? 1.35 : 1.0;

        // Space calculations from buildings
        let maxCatnip = 2000 + (state.buildings.pasture * 500) + (state.buildings.barn * 2500 * barnMultiplier);
        if (state.upgrades.catnipSilos) maxCatnip *= 1.5;

        let maxWood = 200 + (state.buildings.barn * 200 * barnMultiplier) + (state.buildings.warehouse * 150 * warehouseMultiplier);
        let maxMinerals = (state.buildings.barn * 250 * barnMultiplier) + (state.buildings.warehouse * 500 * warehouseMultiplier);
        let maxIron = (state.buildings.barn * 50 * barnMultiplier) + (state.buildings.warehouse * 150 * warehouseMultiplier);
        let maxScience = (state.buildings.library * 250) + (state.buildings.academy * 1000) + (state.buildings.warehouse * 100 * warehouseMultiplier);
        
        let maxDarkMatter = 0 + (state.upgrades.darkMatterContainment ? 500 : 0);
        let maxPortalFluid = 0 + (state.upgrades.fluidTanks ? 250 : 0);

        const fluxAcceleratorLevel = state.portalUpgrades?.fluxAccelerator ?? 0;
        const storageMultiplier = 1 + (fluxAcceleratorLevel * 0.20);
        maxCatnip *= storageMultiplier;
        maxWood *= storageMultiplier;
        maxMinerals *= storageMultiplier;
        maxIron *= storageMultiplier;
        maxScience *= storageMultiplier;
        maxDarkMatter *= storageMultiplier;
        maxPortalFluid *= storageMultiplier;

        if (microverseDecayActive) {
          maxCatnip *= 0.5;
          maxWood *= 0.5;
          maxMinerals *= 0.5;
          maxIron *= 0.5;
          maxScience *= 0.5;
          maxDarkMatter *= 0.5;
          maxPortalFluid *= 0.5;
        }
        
        // Max housing space
        const maxKittens = (state.buildings.hut * 2) + (state.buildings.logHouse * 1) + (state.buildings.mansion * 4) + (state.buildings.cloningVat * 50);

        // 2. Dimension Logic
        let currentDimension = state.currentDimension;

        // 3. Happiness Calculations
        // Base is 100%. If population > 5, each extra kitten causes -2% crowding stress.
        // Amphitheatres reduce stress or boost happiness directly by +4% each.
        // Dimension travelers boost happiness by +5% each.
        const kittenCount = state.village.kittens.length;
        let crowdingPenalty = 0;
        if (kittenCount > 5) {
          crowdingPenalty = (kittenCount - 5) * 2;
        }
        let travelerHappinessBoost = 0;
        state.village.kittens.forEach(k => {
          if (k.trait && k.trait.includes('Dimension traveler')) {
            travelerHappinessBoost += 5;
          }
        });
        const amphitheatreBoost = state.buildings.amphitheatre * 4;
        
        let seasonHappinessModifier = 0;
        if (isSpringBreak) {
          seasonHappinessModifier += 20;
        }
        if (season === 'winter' && !state.upgrades.portalHeaters) {
          seasonHappinessModifier -= 10;
        }
        
        let finalHappiness = Math.min(150, Math.max(10, 100 - crowdingPenalty + amphitheatreBoost + travelerHappinessBoost + seasonHappinessModifier));

        // 4. Job Production rates per second
        // Check kitten count in each job and calculate level plus trait adjusted job strengths
        const jobCounts: Record<JobType, number> = {
          farmer: 0,
          woodcutter: 0,
          scholar: 0,
          miner: 0,
          priest: 0,
          darkMatterScientist: 0,
          fluidEngineer: 0
        };
        state.village.kittens.forEach(k => {
          if (k.job !== 'unemployed') {
            jobCounts[k.job]++;
          }
        });
        const jobStrengths = calculateJobStrengths(state.village.kittens);

        // FARMING: boost from agriculture, season modifier, and aqueduct multiplier
        const farmerEffBonus = state.researched.agriculture ? 1.20 : 1.0;
        const agricultureGreenhouseBonus = state.researched.agriculture ? 1.25 : 1.0;
        let dimensionModifier = DIMENSIONS_DATA[currentDimension].catnipModifier;
        
        if (state.insaneMode && currentDimension === 'Froopyland') {
          dimensionModifier = state.upgrades.portalHeaters ? 0.35 : 0.05;
        } else if (state.upgrades.portalHeaters && currentDimension === 'Froopyland') {
          dimensionModifier = Math.max(dimensionModifier, 0.55);
        }
        
        const aqueductBoost = 1 + (state.buildings.aqueduct * 0.15); // +15% passive production per aqueduct

        // Seasonal Farming effects
        let seasonCropMultiplier = 1.0;
        if (season === 'spring') seasonCropMultiplier = 1.25;
        else if (season === 'summer') seasonCropMultiplier = 1.0;
        else if (season === 'autumn') seasonCropMultiplier = isSeedHarvest ? 1.50 : 0.75;
        else if (season === 'winter') {
          seasonCropMultiplier = state.upgrades.portalHeaters ? 0.65 : 0.20;
        }

        // Base field production is passive
        const fieldsPassiveRate = state.buildings.catnipField * 0.63 * dimensionModifier * aqueductBoost * agricultureGreenhouseBonus * seasonCropMultiplier * dimensionalMultiplier * portalFluxMultiplier;
        const farmerRate = jobStrengths.farmer * 5.0 * farmerEffBonus * dimensionModifier * productionMultiplier * seasonCropMultiplier;
        let catnipRate = fieldsPassiveRate + farmerRate;

        // KITTEN STARVATION: Each kitten consumes more under strain (hard mode)
        // Pasture reduces food intake by 1.5% each, up to 50% max reduction
        const pastureIntakeReduction = Math.max(0.50, 1 - (state.buildings.pasture * 0.015));
        const baseFoodDemandPerMorty = state.insaneMode ? 5.50 : 4.25;
        let totalFoodDemand = 0;
        state.village.kittens.forEach(k => {
          let multiplier = 1.0;
          if (k.trait && k.trait.includes('Mega-Seed Tolerant')) {
            multiplier = 0.95;
          }
          totalFoodDemand += baseFoodDemandPerMorty * multiplier;
        });
        const kittenEatsRate = totalFoodDemand * pastureIntakeReduction;
        
        catnipRate -= kittenEatsRate;
        catnipRate -= customCatnipDrain; // Anomaly drain

        // Starving condition
        let catnipAmt = state.resources.catnip.amount + (catnipRate * effectiveDelta);
        let hungerState = false;
        if (catnipAmt < 0) {
          catnipAmt = 0;
          hungerState = true;
          finalHappiness = Math.max(10, finalHappiness - 40); // lose 40% happiness if starving
        }

        // Efficiency modifier from happiness
        const efficiencyFactor = finalHappiness / 100;

        // WOODCUTTER (Plutonium Scrapper) boosted by woodworking research, spring break, and solar purge
        let axeMultiplier = 1.0;
        if (state.upgrades.ironAxes) axeMultiplier = 1.75;
        else if (state.upgrades.mineralAxes) axeMultiplier = 1.25;

        const springBreakFactor = isSpringBreak ? 1.15 : 1.0;
        const solarPurgeFactor = isSolarPurge ? 2.0 : 1.0;
        const cromulonGiftsFactor = isCromulonGifts ? 1.30 : 1.0;

        const woodworkingWoodcutterBonus = state.researched.woodworking ? 1.15 : 1.0;
        const woodcutterBase = jobStrengths.woodcutter * 0.10 * axeMultiplier * efficiencyFactor * productionMultiplier * woodworkingWoodcutterBonus;
        let woodRate = woodcutterBase * springBreakFactor * solarPurgeFactor;

        // SCHOLAR boosted by writing (Interdimensional Cable) research, spring break, and Cromulon gifts
        // Libraries & academies boost scholars
        const academyScholarMod = 1 + (state.buildings.academy * 0.20);
        const writingScholarBonus = state.researched.writing ? 1.25 : 1.0;
        const quantumResonatorLevel = state.portalUpgrades?.quantumResonator ?? 0;
        const scholarResonatorMultiplier = 1 + (quantumResonatorLevel * 0.25);
        let scienceRate = jobStrengths.scholar * 0.25 * academyScholarMod * efficiencyFactor * productionMultiplier * writingScholarBonus * scholarResonatorMultiplier * springBreakFactor * cromulonGiftsFactor;

        // MINER boosted by mining (Laser Fault-Drilling) research and spring break
        const miningMinerBonus = state.researched.mining ? 1.20 : 1.0;
        const minerBase = jobStrengths.miner * 0.18 * efficiencyFactor * productionMultiplier * miningMinerBonus * springBreakFactor;
        // Mine adds slightly passive mineral gain as well
        let mineralsRate = minerBase + (state.buildings.mine * 0.05 * miningMinerBonus * dimensionalMultiplier * portalFluxMultiplier);

        // PRIEST (Schwifty Musician) boosted by theology (Cromulon Reverence) research, spring break, and Cromulon gifts
        const theologyPriestBonus = state.researched.theology ? 1.40 : 1.0;
        let cultureRate = jobStrengths.priest * 0.15 * efficiencyFactor * productionMultiplier * theologyPriestBonus * springBreakFactor * cromulonGiftsFactor;

        // Apply passive anomaly drains
        woodRate -= customWoodDrain;
        cultureRate -= customCultureDrain;

        // SMELTER PASSIVES (boosted by metalworking research)
        // Consumes 1.0 Wood and 10 Minerals to smelt +0.15 Iron per smelter
        const metalworkingSmelterBonus = state.researched.metalworking ? 1.30 : 1.0;
        let ironRate = 0;
        if (state.buildings.smelter > 0) {
          const count = state.buildings.smelter;
          const woodDemand = count * 1.0 * effectiveDelta;
          const minDemand = count * 10.0 * effectiveDelta;
          
          if (state.resources.wood.amount >= woodDemand && state.resources.minerals.amount >= minDemand) {
            // Apply consumption
            woodRate -= count * 1.0;
            mineralsRate -= count * 10.0;
            ironRate += count * 0.18 * metalworkingSmelterBonus * productionMultiplier; // SMELTER affects output with active boosters as well
          }
        }

        // DARK MATTER SCIENTIST and EXTRACTOR
        const darkMatterScientistRate = (jobStrengths.darkMatterScientist || 0) * 0.05 * efficiencyFactor * productionMultiplier;
        const darkMatterExtractorRate = state.buildings.darkMatterExtractor * 0.15 * dimensionalMultiplier * portalFluxMultiplier;
        let darkMatterRate = darkMatterScientistRate + darkMatterExtractorRate;

        // PORTAL FLUID ENGINEER and GENERATOR
        // Consumes 5 dark matter and 10 minerals per tick per generator
        const fluidEngineerRate = (jobStrengths.fluidEngineer || 0) * 0.02 * efficiencyFactor * productionMultiplier;
        let portalFluidRate = fluidEngineerRate;
        if (state.buildings.portalGenerator > 0) {
          const count = state.buildings.portalGenerator;
          const dmDemand = count * 5.0 * effectiveDelta;
          const minDemand = count * 10.0 * effectiveDelta;
          if (state.resources.darkMatter.amount >= dmDemand && state.resources.minerals.amount >= minDemand) {
            darkMatterRate -= count * 5.0;
            mineralsRate -= count * 10.0;
            portalFluidRate += count * 0.08 * productionMultiplier;
          }
        }

        // Apply rates with delta
        let woodAmt = state.resources.wood.amount + (woodRate * effectiveDelta);
        let mineralsAmt = state.resources.minerals.amount + (mineralsRate * effectiveDelta);
        let scienceAmt = state.resources.science.amount + (scienceRate * effectiveDelta);
        let ironAmt = state.resources.iron.amount + (ironRate * effectiveDelta);
        let cultureAmt = state.resources.culture.amount + (cultureRate * effectiveDelta);
        let darkMatterAmt = state.resources.darkMatter.amount + (darkMatterRate * effectiveDelta);
        let portalFluidAmt = state.resources.portalFluid.amount + (portalFluidRate * effectiveDelta);

        // Apply instant disaster explosion impacts (if they go unresolved)
        const updatedKittens = [...state.village.kittens];
        if (applyExplosionPenalty) {
          if (applyExplosionPenalty === 'fluid_leak') {
            catnipAmt *= 0.60;
            woodAmt *= 0.80;
          } else if (applyExplosionPenalty === 'fed_raid') {
            mineralsAmt *= 0.50;
            ironAmt *= 0.50;
            if (updatedKittens.length > 0) {
              const deceased = updatedKittens.pop();
              if (deceased) {
                state.addLog(`💀 DISASTER RAID: Galactic Federation spies captured and liquidated ${deceased.name} ${deceased.surname} in transit!`, 'death');
              }
            }
          } else if (applyExplosionPenalty === 'cromulon') {
            cultureAmt *= 0.50;
            finalHappiness = Math.max(10, finalHappiness - 50);
          } else if (applyExplosionPenalty === 'microverse_decay') {
            catnipAmt *= 0.70;
            woodAmt *= 0.70;
            mineralsAmt *= 0.70;
            ironAmt *= 0.70;
            scienceAmt *= 0.70;
          }
        }

        // Auto-refinement of Plutonium (Wood) and Crystals (Minerals) when reaching 95% of storage limits
        if (state.upgrades.autoRefineWood && woodAmt > maxWood * 0.95) {
          const excessWood = woodAmt - (maxWood * 0.95);
          // Convert excess wood to iron (Ratio: 10 wood -> 1 iron)
          const ironGained = excessWood / 10;
          woodAmt = maxWood * 0.95;
          ironAmt = Math.min(maxIron, ironAmt + ironGained);
        }

        if (mineralsAmt > maxMinerals * 0.95) {
          const excessMinerals = mineralsAmt - (maxMinerals * 0.95);
          if (state.upgrades.autoRefineMinerals) {
            // Priority 1: Convert excess minerals to science (Ratio: 5 minerals -> 1 science)
            const scienceGained = excessMinerals / 5;
            mineralsAmt = maxMinerals * 0.95;
            scienceAmt = Math.min(maxScience, scienceAmt + scienceGained);
          } else if (state.upgrades.autoRefineWood) {
            // Priority 2: Convert excess minerals to iron (Ratio: 10 minerals -> 1 iron)
            const ironGained = excessMinerals / 10;
            mineralsAmt = maxMinerals * 0.95;
            ironAmt = Math.min(maxIron, ironAmt + ironGained);
          }
        }

        // Clamping amounts to max
        catnipAmt = Math.min(catnipAmt, maxCatnip);
        woodAmt = Math.min(woodAmt, maxWood);
        mineralsAmt = Math.min(mineralsAmt, maxMinerals);
        ironAmt = Math.min(ironAmt, maxIron);
        scienceAmt = Math.min(scienceAmt, maxScience);
        darkMatterAmt = Math.min(darkMatterAmt, maxDarkMatter);
        portalFluidAmt = Math.min(portalFluidAmt, maxPortalFluid);
        // Culture does not have a hard ceiling in standard kittens, let's cap at 10000 set in state
        cultureAmt = Math.min(cultureAmt, 100000);

        // Ensure positive bottom values
        if (woodAmt < 0) woodAmt = 0;
        if (mineralsAmt < 0) mineralsAmt = 0;
        if (scienceAmt < 0) scienceAmt = 0;
        if (ironAmt < 0) ironAmt = 0;
        if (cultureAmt < 0) cultureAmt = 0;
        if (darkMatterAmt < 0) darkMatterAmt = 0;
        if (portalFluidAmt < 0) portalFluidAmt = 0;

        // Auto-build
        const updatedBuildings = { ...state.buildings };
        const autoBuildable = ['pasture', 'barn', 'catnipField'] as const;
        autoBuildable.forEach(b => {
          if (state.autoBuild?.[b]) {
            const bDef = BUILDINGS[b];
            while (true) {
              const owned = updatedBuildings[b];
              if (bDef.maxLimit !== undefined && owned >= bDef.maxLimit) break;
              
              let canAfford = true;
              const computedCosts: Record<string, number> = {};
              for (const [resType, baseCost] of Object.entries(bDef.baseCost)) {
                const cost = calculateCost(baseCost, bDef.costRatio, owned);
                computedCosts[resType] = cost;
                
                let curAmt = 0;
                if (resType === 'catnip') curAmt = catnipAmt;
                else if (resType === 'wood') curAmt = woodAmt;
                else if (resType === 'minerals') curAmt = mineralsAmt;
                else if (resType === 'iron') curAmt = ironAmt;
                else if (resType === 'science') curAmt = scienceAmt;
                else if (resType === 'culture') curAmt = cultureAmt;
                
                if (curAmt < cost) {
                  canAfford = false;
                  break;
                }
              }

              if (canAfford) {
                if (computedCosts.catnip) catnipAmt -= computedCosts.catnip;
                if (computedCosts.wood) woodAmt -= computedCosts.wood;
                if (computedCosts.minerals) mineralsAmt -= computedCosts.minerals;
                if (computedCosts.iron) ironAmt -= computedCosts.iron;
                if (computedCosts.science) scienceAmt -= computedCosts.science;
                if (computedCosts.culture) cultureAmt -= computedCosts.culture;
                
                updatedBuildings[b] += 1;
              } else {
                break;
              }
            }
          }
        });

        // 5. Unlocks Checks
        const unlocks = { ...state.unlocks };
        if (!unlocks.wood && (catnipAmt >= 100 || state.buildings.catnipField > 0)) unlocks.wood = true;
        if (!unlocks.minerals && (state.buildings.mine > 0 || mineralsAmt > 5 || state.researched.mining)) unlocks.minerals = true;
        if (!unlocks.iron && (state.buildings.smelter > 0 || ironAmt > 0)) unlocks.iron = true;
        if (!unlocks.science && (state.buildings.library > 0 || scienceAmt > 0)) {
          unlocks.science = true;
          unlocks.workshop = true;
        }
        if (!unlocks.village && maxKittens > 0) {
          unlocks.village = true;
        }
        if (!unlocks.culture && (cultureAmt > 0 || state.researched.theology)) {
          unlocks.culture = true;
        }
        if (!unlocks.darkMatter && (state.buildings.darkMatterExtractor > 0 || darkMatterAmt > 0 || state.researched.darkMatterPhysics)) {
          unlocks.darkMatter = true;
        }
        if (!unlocks.fluid && (state.buildings.portalGenerator > 0 || portalFluidAmt > 0 || state.researched.fluidDynamics)) {
          unlocks.fluid = true;
        }

        //6. Kitten Survival & Recruitment
        
        // Starvation logic checks
        // If hunger and kittens exist, there is a small risk they run away or die! (e.g. 1.2% chance per active starving tick)
        if (hungerState && updatedKittens.length > 0) {
          const baseRisk = state.insaneMode ? 0.15 : 0.05;
          const starvationRisk = baseRisk * effectiveDelta;
          if (Math.random() < starvationRisk) {
            const deceased = updatedKittens.pop();
            if (deceased) {
              state.addLog(
                `Unfortunate tragedy! ${deceased.name} ${deceased.surname} ran dry on seeds and suffered agonizing withdrawal. Cultivate Mega Seeds immediately!`, 
                'death'
              );
            }
          }
        }

        // Recruit new kitten logic (every few seconds, with probability scaled by happiness & free space)
        if (updatedKittens.length < maxKittens && catnipAmt > (maxCatnip * 0.12) && !hungerState) {
          const spawnWeight = 0.02 * (finalHappiness / 100) * effectiveDelta;
          if (Math.random() < spawnWeight) {
            const newKitty = generateRandomKitten();
            updatedKittens.push(newKitty);
            state.addLog(
              `An alternate Morty climbed out of a green portal! Welcome ${newKitty.name} ${newKitty.surname} (${newKitty.trait}).`, 
              'success'
            );
          }
        }

        // Let's increment exp of working kittens slightly for high-quality progression feel!
        updatedKittens.forEach(kitty => {
          if (kitty.job !== 'unemployed') {
            kitty.exp += effectiveDelta * 0.1;
            if (kitty.exp >= kitty.level * 100) {
              kitty.exp = 0;
              kitty.level += 1;
              state.addLog(
                `${kitty.name} ${kitty.surname} leveled up! Level ${kitty.level} ${kitty.job}. Output efficiency increased.`, 
                'success'
              );
            }
          }
        });

        // Assess live achievement milestones
        const currentAchievements = state.achievements || {};
        const updatedAchievements = { ...currentAchievements };
        const tempState: GameState = {
          ...state,
          resources: {
            catnip: { amount: catnipAmt, max: maxCatnip },
            wood: { amount: woodAmt, max: maxWood },
            minerals: { amount: mineralsAmt, max: maxMinerals },
            iron: { amount: ironAmt, max: maxIron },
            science: { amount: scienceAmt, max: maxScience },
            culture: { amount: cultureAmt, max: 100000 },
            darkMatter: { amount: darkMatterAmt, max: maxDarkMatter },
            portalFluid: { amount: portalFluidAmt, max: maxPortalFluid },
            flurbo: { amount: state.resources.flurbo.amount, max: state.resources.flurbo.max }
          },
          village: {
            kittens: updatedKittens,
            maxKittens,
            happiness: finalHappiness
          },
          unlocks,
          buildings: updatedBuildings,
          researched: state.researched,
          upgrades: state.upgrades,
          craftedCertificatesCount: state.craftedCertificatesCount || { bronze: 0, silver: 0, gold: 0, infinite: 0 }
        } as any;

        const logsToAppend: GameLogMessage[] = [...seasonalLogs];
        let playAchievementSound = false;
        ACHIEVEMENTS.forEach(ach => {
          if (!updatedAchievements[ach.id] && ach.check(tempState)) {
            updatedAchievements[ach.id] = true;
            playAchievementSound = true;
            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            logsToAppend.push({
              id: `ach-${ach.id}-${Math.random()}`,
              time: timeStr,
              text: `🏆 Achievement Unlocked: ${ach.name}! "${ach.quote}"`,
              type: 'success'
            });
          }
        });

        if (playAchievementSound && state.soundEnabled) {
          playClickSound('achievement');
        }

        let finalLogs = state.logs;
        if (logsToAppend.length > 0) {
          finalLogs = [...logsToAppend, ...state.logs].slice(0, 80);
        }

        set({
          lastTick: now,
          activeCertificates: updatedActive,
          achievements: updatedAchievements,
          logs: finalLogs,
          currentDimension,
          year,
          season,
          day,
          dayProgress,
          resources: {
            catnip: { amount: catnipAmt, max: maxCatnip },
            wood: { amount: woodAmt, max: maxWood },
            minerals: { amount: mineralsAmt, max: maxMinerals },
            iron: { amount: ironAmt, max: maxIron },
            science: { amount: scienceAmt, max: maxScience },
            culture: { amount: cultureAmt, max: 100000 },
            darkMatter: { amount: darkMatterAmt, max: maxDarkMatter },
            portalFluid: { amount: portalFluidAmt, max: maxPortalFluid },
            flurbo: { amount: state.resources.flurbo.amount, max: state.resources.flurbo.max }
          },
          village: {
            kittens: updatedKittens,
            maxKittens,
            happiness: finalHappiness
          },
          buildings: updatedBuildings,
          unlocks,
          activeAnomaly
        });
      },

      gatherCatnip: (multiplier: number = 1) => set(state => {
        // Gathering catnip manually is highly customizable, and is boosted by portal flux and dimensional upgrades!
        const portalFluxMultiplier = 1 + (state.portalFlux * 0.1);
        const dimAmplifierLevel = state.portalUpgrades?.dimensionalAmplifier ?? 0;
        const dimensionalMultiplier = 1 + (dimAmplifierLevel * 0.15);
        const finalMultiplier = multiplier * portalFluxMultiplier * dimensionalMultiplier;
        const gainedAmount = Math.max(1, Math.round(1 * finalMultiplier));

        const amt = Math.min(
          state.resources.catnip.amount + gainedAmount, 
          state.resources.catnip.max
        );
        const unlocks = { ...state.unlocks };
        if (amt >= 100) unlocks.wood = true;
        return {
          resources: {
            ...state.resources,
            catnip: { ...state.resources.catnip, amount: amt }
          },
          unlocks
        };
      }),

      buyBuilding: (type, quantity = 1) => set(state => {
        const bDef = BUILDINGS[type];
        const owned = state.buildings[type];
        
        let actualQuantity = typeof quantity === 'number' ? quantity : 0;
        const res = JSON.parse(JSON.stringify(state.resources)) as GameState['resources'];
        
        if (quantity === 'max') {
          let canAffordMore = true;
          let testQuantity = 0;
          
          while (canAffordMore) {
            if (bDef.maxLimit !== undefined && owned + testQuantity >= bDef.maxLimit) {
              break;
            }
            
            let affordable = true;
            for (const [resType, baseCost] of Object.entries(bDef.baseCost)) {
              let totalCost = 0;
              for (let i = 0; i <= testQuantity; i++) {
                totalCost += calculateCost(baseCost, bDef.costRatio, owned + i);
              }
              const currentRes = res[resType as ResourceType];
              if (!currentRes || currentRes.amount < totalCost) {
                affordable = false;
                break;
              }
            }
            
            if (affordable) {
              testQuantity++;
            } else {
              canAffordMore = false;
            }
          }
          actualQuantity = testQuantity;
        }

        if (actualQuantity <= 0) {
          if (quantity === 'max') {
             state.addLog(`Cannot afford any more ${bDef.name}.`, 'warn');
          } else if (bDef.maxLimit !== undefined && owned + actualQuantity > bDef.maxLimit) {
            state.addLog(`Access Denied! Capacity reached for ${bDef.name} (${owned}/${bDef.maxLimit}).`, 'warn');
          }
          return state;
        }

        if (bDef.maxLimit !== undefined && owned + actualQuantity > bDef.maxLimit) {
          state.addLog(`Access Denied! Capacity reached for ${bDef.name} (${owned}/${bDef.maxLimit}).`, 'warn');
          return state;
        }
        
        let canAfford = true;
        
        // evaluate costs
        const computedCosts: Record<string, number> = {};
        for (const [resType, baseCost] of Object.entries(bDef.baseCost)) {
          let totalCost = 0;
          for (let i = 0; i < actualQuantity; i++) {
            totalCost += calculateCost(baseCost, bDef.costRatio, owned + i);
          }
          computedCosts[resType] = totalCost;
          
          const currentRes = res[resType as ResourceType];
          if (!currentRes || currentRes.amount < totalCost) {
            canAfford = false;
            break;
          }
        }

        if (canAfford) {
          // deduct
          for (const [resType, costVal] of Object.entries(computedCosts)) {
            res[resType as ResourceType].amount -= costVal;
          }
          
          const qtyText = actualQuantity === 1 ? 'one' : `${actualQuantity}x`;
          state.addLog(`Built ${qtyText} ${bDef.name} for the Citadel.`, 'success');
          
          return {
            resources: res,
            buildings: {
              ...state.buildings,
              [type]: owned + actualQuantity
            }
          };
        }
        return state;
      }),

      assignJob: (kittenId, job) => set(state => {
        const kittensList = Array.isArray(state.village?.kittens) ? state.village.kittens : [];
        const kittens = kittensList.map(k => {
          if (k.id === kittenId) {
            return { ...k, job };
          }
          return k;
        });
        
        const unlocks = { ...state.unlocks };
        kittens.forEach(k => {
          if (k.job === 'woodcutter') unlocks.wood = true;
          if (k.job === 'miner') unlocks.minerals = true;
          if (k.job === 'scholar') {
            unlocks.science = true;
            unlocks.workshop = true;
          }
          if (k.job === 'priest') unlocks.culture = true;
        });

        return {
          village: {
            ...state.village,
            kittens
          },
          unlocks
        };
      }),

      assignJobsMultiple: (kittenIds, job) => set(state => {
        const kittensList = Array.isArray(state.village?.kittens) ? state.village.kittens : [];
        const idSet = new Set(kittenIds);
        const kittens = kittensList.map(k => {
          if (idSet.has(k.id)) {
            return { ...k, job };
          }
          return k;
        });
        
        const unlocks = { ...state.unlocks };
        kittens.forEach(k => {
          if (k.job === 'woodcutter') unlocks.wood = true;
          if (k.job === 'miner') unlocks.minerals = true;
          if (k.job === 'scholar') {
            unlocks.science = true;
            unlocks.workshop = true;
          }
          if (k.job === 'priest') unlocks.culture = true;
        });

        return {
          village: {
            ...state.village,
            kittens
          },
          unlocks
        };
      }),

      autoAssignAll: (job) => set(state => {
        const kittensList = Array.isArray(state.village?.kittens) ? state.village.kittens : [];
        const kittens = kittensList.map(k => {
          if (k.job === 'unemployed') {
            return { ...k, job };
          }
          return k;
        });

        const unlocks = { ...state.unlocks };
        kittens.forEach(k => {
          if (k.job === 'woodcutter') unlocks.wood = true;
          if (k.job === 'miner') unlocks.minerals = true;
          if (k.job === 'scholar') {
            unlocks.science = true;
            unlocks.workshop = true;
          }
          if (k.job === 'priest') unlocks.culture = true;
        });

        return {
          village: {
            ...state.village,
            kittens
          },
          unlocks
        };
      }),

      unassignAll: () => set(state => {
        const kittensList = Array.isArray(state.village?.kittens) ? state.village.kittens : [];
        const essentialJobs = state.essentialJobs || BASE_ESSENTIAL_JOBS;
        const kittens = kittensList.map(k => {
          if (k.job !== 'unemployed' && essentialJobs[k.job]) {
            return k; // Protect essential jobs from being unassigned
          }
          return { ...k, job: 'unemployed' as const };
        });
        return {
          village: {
            ...state.village,
            kittens
          }
        };
      }),

      researchScience: (type) => set(state => {
        if (state.researched[type]) return state;
        const def = SCIENCES[type];
        
        const res = JSON.parse(JSON.stringify(state.resources)) as GameState['resources'];
        let canAfford = true;

        for (const [resType, cost] of Object.entries(def.cost)) {
          const currentRes = res[resType as ResourceType];
          if (!currentRes || currentRes.amount < cost) {
            canAfford = false;
            break;
          }
        }

        if (canAfford) {
          for (const [resType, cost] of Object.entries(def.cost)) {
            res[resType as ResourceType].amount -= cost;
          }

          state.addLog(`Technology Researched: ${def.name}! ${def.effectsDesc}`, 'success');

          return {
            resources: res,
            researched: {
              ...state.researched,
              [type]: true
            }
          };
        }
        return state;
      }),

      buyUpgrade: (type) => set(state => {
        if (state.upgrades[type]) return state;
        const def = UPGRADES[type];

        const res = JSON.parse(JSON.stringify(state.resources)) as GameState['resources'];
        let canAfford = true;

        for (const [resType, cost] of Object.entries(def.cost)) {
          const currentRes = res[resType as ResourceType];
          if (!currentRes || currentRes.amount < cost) {
            canAfford = false;
            break;
          }
        }

        if (canAfford) {
          for (const [resType, cost] of Object.entries(def.cost)) {
            res[resType as ResourceType].amount -= cost;
          }

          state.addLog(`Upgrade Purchased: ${def.name}! ${def.effectsDesc}`, 'success');

          return {
            resources: res,
            upgrades: {
              ...state.upgrades,
              [type]: true
            }
          };
        }
        return state;
      }),

      buyPortalUpgrade: (type) => set(state => {
        const portalUpgrades = state.portalUpgrades || {
          dimensionalAmplifier: 0,
          quantumResonator: 0,
          fluxAccelerator: 0,
          chronalDilator: 0,
        };
        const currentLevel = portalUpgrades[type] ?? 0;
        const def = PORTAL_UPGRADES[type];
        if (!def) return state;

        const cost = Math.floor(def.baseCost * Math.pow(def.costRatio, currentLevel));
        const currentScience = state.resources.science.amount;

        if (currentScience >= cost) {
          const res = JSON.parse(JSON.stringify(state.resources)) as GameState['resources'];
          res.science.amount -= cost;

          state.addLog(`Portal Upgrade Calibrated: ${def.name} reached Level ${currentLevel + 1}!`, 'success');

          return {
            resources: res,
            portalUpgrades: {
              ...portalUpgrades,
              [type]: currentLevel + 1
            }
          };
        } else {
          state.addLog(`Insufficient Portal Tech! Required: ${cost.toLocaleString()} to upgrade ${def.name}.`, 'warn');
        }
        return state;
      }),

      forceAddKitten: () => set(state => {
         // cheat / manual recruiter
         const maxKittens = (state.buildings.hut * 2) + (state.buildings.logHouse * 1) + (state.buildings.mansion * 4);
         const kittensList = Array.isArray(state.village?.kittens) ? state.village.kittens : [];
         if (kittensList.length < maxKittens) {
            const extra = generateRandomKitten();
            state.addLog(`A stray Morty wanders out of space-time: ${extra.name} ${extra.surname}.`, 'success');
            return {
              village: {
                ...state.village,
                kittens: [...kittensList, extra]
              }
            };
         }
         return state;
      }),

      portalReset: () => {
        const state = get();
        // Calculate flux from progress (total buildings + kittens)
        const totalBuildings = Object.values(state.buildings).reduce((a, b) => a + b, 0);
        const totalKittens = state.village.kittens.length;
        // Super incremental: much more generous flux gain
        const fluxEarned = Math.floor(Math.sqrt((totalBuildings * 2 + totalKittens * 5 + 1) / 2));

        const dimensions: DimensionType[] = ['EarthC137', 'Froopyland', 'Citadel', 'Gazorpazorp', 'Cronenberg'];
        const currentIndex = dimensions.indexOf(state.currentDimension);
        const nextDimension = dimensions[(currentIndex + 1) % dimensions.length];
        
        // Ensure portal upgrades persist (prestige values)
        const preservedUpgrades = JSON.parse(JSON.stringify(state.portalUpgrades || {}));

        set({
          resources: JSON.parse(JSON.stringify(BASE_RESOURCES)),
          buildings: JSON.parse(JSON.stringify(BASE_BUILDINGS)),
          researched: JSON.parse(JSON.stringify(BASE_RESEARCHED)),
          upgrades: JSON.parse(JSON.stringify(BASE_UPGRADES)),
          year: 1,
          season: 'spring',
          day: 1,
          dayProgress: 0,
          unlocks: {
            wood: false,
            minerals: false,
            iron: false,
            science: false,
            village: false,
            workshop: false,
            culture: false,
            darkMatter: false,
            fluid: false,
          },
          village: {
            kittens: [],
            maxKittens: 0,
            happiness: 100,
          },
          autoBuild: {
            pasture: false,
            barn: false,
            catnipField: false,
          },
          activeCertificates: [],
          craftedCertificatesCount: { bronze: 0, silver: 0, gold: 0, infinite: 0 },
          currentDimension: nextDimension,
          portalUpgrades: preservedUpgrades,
          logs: [
            {
              id: 'reset',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              text: `Portal Reset complete! You acquired ${fluxEarned} Portal Flux points. Welcome to a new dimension: ${DIMENSIONS_DATA[nextDimension].name}. Portal Upgrades Preserved (Amplifier Lv. ${preservedUpgrades.dimensionalAmplifier || 0}).`,
              type: 'success'
            }
          ],
          portalResets: state.portalResets + 1,
          portalFlux: state.portalFlux + fluxEarned,
          lastTick: Date.now()
        });
      },

      synthesizeCertificate: (certificateType: 'bronze' | 'silver' | 'gold' | 'infinite') => {
        const state = get();
        const def = CERTIFICATES[certificateType];
        if (!def) return;

        // Check costs
        let canAfford = true;
        const res = JSON.parse(JSON.stringify(state.resources)) as GameState['resources'];

        if (def.costs.science && (!res.science || res.science.amount < def.costs.science)) {
          canAfford = false;
        }

        const resCosts: { key: ResourceType; amount: number }[] = [];
        if (def.costs.wood) resCosts.push({ key: 'wood', amount: def.costs.wood });
        if (def.costs.minerals) resCosts.push({ key: 'minerals', amount: def.costs.minerals });
        if (def.costs.iron) resCosts.push({ key: 'iron', amount: def.costs.iron });
        if (def.costs.culture) resCosts.push({ key: 'culture', amount: def.costs.culture });

        for (const costItem of resCosts) {
          if (!res[costItem.key] || res[costItem.key].amount < costItem.amount) {
            canAfford = false;
          }
        }

        if (!canAfford) {
          state.addLog(`Cannot synthesize ${def.name}. Insufficient materials!`, 'warn');
          return;
        }

        // Deduct
        if (def.costs.science) {
          res.science.amount -= def.costs.science;
        }
        for (const costItem of resCosts) {
          res[costItem.key].amount -= costItem.amount;
        }

        // Add active certificate
        const newActive: ActiveCertificateBoost = {
          id: Math.random().toString(),
          certificateType,
          name: def.name,
          timeRemaining: def.duration,
          totalDuration: def.duration,
          boostPercent: def.boostPercent
        };

        const currentActive = state.activeCertificates || [];
        const currentCount = state.craftedCertificatesCount || { bronze: 0, silver: 0, gold: 0, infinite: 0 };
        const updatedCount = {
          ...currentCount,
          [certificateType]: (currentCount[certificateType] || 0) + 1
        };

        set({
          resources: res,
          activeCertificates: [...currentActive, newActive],
          craftedCertificatesCount: updatedCount
        });

        state.addLog(`Portal synthesizer online! Synthesised ${def.name}. Productivity boost activated!`, 'success');
      },

      toggleInsaneMode: () => set(state => {
        const nextInsane = !state.insaneMode;
        const msg = nextInsane 
          ? "🔴 Insane Multiverse Matrix ACTIVATED. Global production is penalized by 35%. Winter is lethal. Dangerous Dimensional Anomalies will strike!" 
          : "🟢 Insane Multiverse Matrix deactivated. Returning to safe, cushy dimensions.";
        state.addLog(msg, nextInsane ? 'warn' : 'info');
        return { 
          insaneMode: nextInsane,
          activeAnomaly: null
        };
      }),

      defuseAnomalyClick: () => set(state => {
        if (!state.activeAnomaly) return state;
        const current = { ...state.activeAnomaly };
        current.clicksMade += 1;
        if (current.clicksMade >= current.clicksRequired) {
          state.addLog(`🛡️ Matrix Stabilized! Manual core dampening neutralized: ${current.name}.`, 'success');
          return { activeAnomaly: null };
        }
        return { activeAnomaly: current };
      }),

      defuseAnomalyInstant: () => set(state => {
        if (!state.activeAnomaly) return state;
        const name = state.activeAnomaly.name;
        if (state.resources.wood.amount >= 40) {
          const res = { ...state.resources };
          res.wood.amount -= 40;
          state.addLog(`🛡️ Stabilizer Shield Deployed! Spent 40 Plutonium fuel to instantly dissolve: ${name}.`, 'success');
          return {
            resources: res,
            activeAnomaly: null
          };
        } else {
          state.addLog(`Access Denied! Core shields require at least 40 Plutonium fuel.`, 'warn');
          return state;
        }
      }),

      hardReset: () => {
        try {
          localStorage.removeItem('rick-and-morty-incremental-storage');
        } catch (e) {
          console.error(e);
        }
        
        set({
          resources: BASE_RESOURCES,
          buildings: BASE_BUILDINGS,
          researched: BASE_RESEARCHED,
          upgrades: BASE_UPGRADES,
          essentialJobs: BASE_ESSENTIAL_JOBS,
          smartAssignRatios: BASE_SMART_ASSIGN_RATIOS,
          smartAssignMode: 'dynamic',
          jobPresets: {},
          village: {
            kittens: [],
            maxKittens: 0,
            happiness: 100,
          },
          activeCertificates: [],
          craftedCertificatesCount: { bronze: 0, silver: 0, gold: 0, infinite: 0 },
          achievements: {},
          unlocks: {
            wood: false,
            minerals: false,
            iron: false,
            science: false,
            village: false,
            workshop: false,
            culture: false,
            darkMatter: false,
            fluid: false
          },
          autoBuild: {
            hut: false,
            logHouse: false,
            mansion: false,
            pasture: false,
            barn: false,
            warehouse: false,
            port: false,
            catnipField: false,
          } as any,
          currentDimension: 'EarthC137',
          portalResets: 0,
          prestigeMultiplier: 1,
          portalFlux: 0,
          portalUpgrades: { dimensionalAmplifier: 0, quantumResonator: 0, fluxAccelerator: 0, chronalDilator: 0 },
          gameSpeed: 1,
          soundEnabled: true,
          theme: 'dark',
          buyMultiplier: 1,
          insaneMode: false,
          density: 'relaxed',
          activeAnomaly: null,
          year: 1,
          season: 'spring',
          day: 1,
          dayProgress: 0,
          logs: [{ id: 'init', time: new Date().toLocaleTimeString(), text: "Rick's portal scanner online. Hard reset completed.", type: 'success' }],
          lastTick: Date.now()
        });

        try {
          window.location.reload();
        } catch(e) {
          console.error("Failed to reload", e);
        }
      },

      setDensity: (density: 'compact' | 'relaxed') => set({ density }),

      toggleEssentialJob: (job) => set(state => {
        const essentialJobs = state.essentialJobs || BASE_ESSENTIAL_JOBS;
        return {
          essentialJobs: {
            ...essentialJobs,
            [job]: !essentialJobs[job]
          }
        };
      }),

      setSmartAssignRatio: (job, ratio) => set(state => {
        const smartAssignRatios = state.smartAssignRatios || BASE_SMART_ASSIGN_RATIOS;
        return {
          smartAssignRatios: {
            ...smartAssignRatios,
            [job]: ratio
          }
        };
      }),

      setSmartAssignMode: (mode) => set({ smartAssignMode: mode }),

      saveJobPreset: (name: string) => set(state => {
        const ratios = { ...state.smartAssignRatios };
        state.addLog(`Configuration saved: "${name}" Job Preset.`, 'success');
        return {
          jobPresets: {
            ...state.jobPresets,
            [name]: ratios
          }
        };
      }),

      loadJobPreset: (name: string) => set(state => {
        const preset = state.jobPresets[name];
        if (!preset) return state;
        state.addLog(`Configuration loaded: "${name}" Job Preset. Mode set to Custom Ratios.`, 'success');
        return {
          smartAssignRatios: { ...preset },
          smartAssignMode: 'custom'
        };
      }),

      deleteJobPreset: (name: string) => set(state => {
        const presets = { ...state.jobPresets };
        delete presets[name];
        state.addLog(`Preset "${name}" has been purged from memory.`, 'info');
        return { jobPresets: presets };
      })
    }),
    {
      name: 'rick-and-morty-incremental-storage',
      merge: (persistedState: any, currentState: GameState) => {
        if (!persistedState) return currentState;

        // Merge resources safely
        const mergedResources = { ...currentState.resources };
        if (persistedState.resources) {
          for (const key in currentState.resources) {
            const resKey = key as ResourceType;
            if (persistedState.resources[resKey]) {
              mergedResources[resKey] = {
                amount: typeof persistedState.resources[resKey].amount === 'number'
                  ? persistedState.resources[resKey].amount
                  : currentState.resources[resKey].amount,
                max: typeof persistedState.resources[resKey].max === 'number'
                  ? persistedState.resources[resKey].max
                  : currentState.resources[resKey].max
              };
            }
          }
        }

        // Merge buildings safely
        const mergedBuildings = { ...currentState.buildings };
        if (persistedState.buildings) {
          for (const key in currentState.buildings) {
            const bKey = key as BuildingType;
            if (typeof persistedState.buildings[bKey] === 'number') {
              mergedBuildings[bKey] = persistedState.buildings[bKey];
            }
          }
        }

        // Merge researched upgrades safely
        const mergedResearched = { ...currentState.researched };
        if (persistedState.researched) {
          for (const key in currentState.researched) {
            const sKey = key as ScienceType;
            if (typeof persistedState.researched[sKey] === 'boolean') {
              mergedResearched[sKey] = persistedState.researched[sKey];
            }
          }
        }

        // Merge tool/workshop upgrades safely
        const mergedUpgrades = { ...currentState.upgrades };
        if (persistedState.upgrades) {
          for (const key in currentState.upgrades) {
            const uKey = key as UpgradeType;
            if (typeof persistedState.upgrades[uKey] === 'boolean') {
              mergedUpgrades[uKey] = persistedState.upgrades[uKey];
            }
          }
        }

        // Merge autoBuild state safely
        const mergedAutoBuild = { ...currentState.autoBuild };
        if (persistedState.autoBuild) {
          for (const key in currentState.autoBuild) {
            const abKey = key as keyof typeof currentState.autoBuild;
            if (typeof persistedState.autoBuild[abKey] === 'boolean') {
              mergedAutoBuild[abKey] = persistedState.autoBuild[abKey];
            }
          }
        }

        // Merge unlocks state safely
        const mergedUnlocks = { ...currentState.unlocks };
        if (persistedState.unlocks) {
          for (const key in currentState.unlocks) {
            const uKey = key as keyof typeof currentState.unlocks;
            if (typeof persistedState.unlocks[uKey] === 'boolean') {
              mergedUnlocks[uKey] = persistedState.unlocks[uKey];
            }
          }
        }

        // Merge town & kitten colony
        let mergedVillage = { ...currentState.village };
        if (persistedState.village) {
          const maxKittens = (mergedBuildings.hut * 2) + (mergedBuildings.logHouse * 1) + (mergedBuildings.mansion * 4);
          const kitList = Array.isArray(persistedState.village.kittens) ? persistedState.village.kittens : [];
          
          mergedVillage = {
            kittens: kitList,
            maxKittens: maxKittens,
            happiness: typeof persistedState.village.happiness === 'number' ? persistedState.village.happiness : 100
          };
        }

        const mergedActiveCertificates = Array.isArray(persistedState.activeCertificates)
          ? persistedState.activeCertificates
          : [];
        const mergedCraftedCertificatesCount = persistedState.craftedCertificatesCount || { bronze: 0, silver: 0, gold: 0, infinite: 0 };
        const mergedAchievements = persistedState.achievements || {};

        const mergedEssentialJobs = {
          ...BASE_ESSENTIAL_JOBS,
          ...(persistedState.essentialJobs || {})
        };

        const mergedSmartAssignRatios = {
          ...BASE_SMART_ASSIGN_RATIOS,
          ...(persistedState.smartAssignRatios || {})
        };

        const mergedPortalUpgrades = {
          dimensionalAmplifier: 0,
          quantumResonator: 0,
          fluxAccelerator: 0,
          chronalDilator: 0,
          ...(persistedState.portalUpgrades || {})
        };

        const mergedJobPresets = persistedState.jobPresets || {};

        return {
          ...currentState,
          ...persistedState,
          resources: mergedResources,
          buildings: mergedBuildings,
          researched: mergedResearched,
          upgrades: mergedUpgrades,
          autoBuild: mergedAutoBuild,
          unlocks: mergedUnlocks,
          village: mergedVillage,
          essentialJobs: mergedEssentialJobs,
          smartAssignRatios: mergedSmartAssignRatios,
          smartAssignMode: persistedState.smartAssignMode === 'custom' ? 'custom' : 'dynamic',
          activeCertificates: mergedActiveCertificates,
          craftedCertificatesCount: mergedCraftedCertificatesCount,
          achievements: mergedAchievements,
          portalUpgrades: mergedPortalUpgrades,
          jobPresets: mergedJobPresets,
          theme: persistedState.theme === 'light' ? 'light' : 'dark',
          density: (persistedState.density === 'compact' || persistedState.density === 'relaxed') ? persistedState.density : 'relaxed',
          buyMultiplier: (persistedState.buyMultiplier === 1 || persistedState.buyMultiplier === 5 || persistedState.buyMultiplier === 'max') 
            ? persistedState.buyMultiplier 
            : 1,
          year: typeof persistedState.year === 'number' ? persistedState.year : currentState.year,
          season: (persistedState.season === 'spring' || persistedState.season === 'summer' || persistedState.season === 'autumn' || persistedState.season === 'winter') ? persistedState.season : currentState.season,
          day: typeof persistedState.day === 'number' ? persistedState.day : currentState.day,
          dayProgress: typeof persistedState.dayProgress === 'number' ? persistedState.dayProgress : currentState.dayProgress,
        } as GameState;
      }
    }
  )
);
