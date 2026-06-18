import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  GameState, 
  ResourceType, 
  BuildingType, 
  JobType, 
  ScienceType, 
  UpgradeType, 
  SeasonType, 
  Kitten, 
  GameLogMessage 
} from '../types';
import { BUILDINGS, SCIENCES, JOBS, UPGRADES, SEASONS_DATA, generateRandomKitten } from '../gameData';

const BASE_RESOURCES: Record<ResourceType, { amount: number; max: number }> = {
  catnip: { amount: 50, max: 2000 },
  wood: { amount: 0, max: 200 },
  minerals: { amount: 0, max: 0 },
  iron: { amount: 0, max: 0 },
  science: { amount: 0, max: 0 },
  culture: { amount: 0, max: 0 },
  parchment: { amount: 0, max: 100 },
  beam: { amount: 0, max: 100 },
  slab: { amount: 0, max: 100 },
  plate: { amount: 0, max: 100 },
};

const BASE_BUILDINGS: Record<BuildingType, number> = {
  catnipField: 0,
  aqueduct: 0,
  pasture: 0,
  hut: 0,
  logHouse: 0,
  barn: 0,
  warehouse: 0,
  library: 0,
  academy: 0,
  mine: 0,
  smelter: 0,
  amphitheatre: 0
};

const BASE_RESEARCHED: Record<ScienceType, boolean> = {
  calendar: false,
  agriculture: false,
  woodworking: false,
  mining: false,
  metalworking: false,
  writing: false,
  theology: false
};

const BASE_UPGRADES: Record<UpgradeType, boolean> = {
  mineralAxes: false,
  ironAxes: false,
  catnipSilos: false,
  reinforcedBarns: false,
  expandedStorage: false
};

export const calculateCost = (baseCost: number, ratio: number, amount: number) => {
  return baseCost * Math.pow(ratio, amount);
};

const initialLogs: GameLogMessage[] = [
  {
    id: 'initial',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    text: 'Welcome, Elder. Gather catnip, erect huts, and nurture your digital feline colony.',
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
      village: {
        kittens: [],
        maxKittens: 0,
        happiness: 100,
      },
      season: {
        current: 'Spring',
        daysPassed: 0,
        totalDays: 100,
      },
      unlocks: {
        wood: false,
        minerals: false,
        iron: false,
        science: false,
        village: false,
        workshop: false,
        culture: false,
      },
      gameSpeed: 1,
      soundEnabled: true,
      lastTick: Date.now(),
      logs: initialLogs,
      theme: 'dark',
      buyMultiplier: 1,

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

      setGameSpeed: (speed: number) => set({ gameSpeed: speed }),
      toggleSound: () => set(state => ({ soundEnabled: !state.soundEnabled })),
      setTheme: (theme: 'dark' | 'light') => set({ theme }),
      setBuyMultiplier: (multiplier: 1 | 5 | 25) => set({ buyMultiplier: multiplier }),

      tick: (deltaSeconds: number) => {
        let state = get();
        
        // Dynamic state correction: Self-heal if village structure is outdated or corrupt
        if (!state.village || !Array.isArray(state.village.kittens)) {
          const prevKittensCount = (state.village && typeof state.village.kittens === 'number') 
            ? (state.village.kittens as number) 
            : 0;
            
          const maxKittens = (state.buildings?.hut * 2) + (state.buildings?.logHouse * 1) || 0;
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

        // Incorporate game speed multiplier
        const effectiveDelta = deltaSeconds * state.gameSpeed * 1.5; // slight speed-up to make incremental play feel super responsive
        const now = Date.now();

        // 1. Storage upgrade ratios
        const barnMultiplier = state.upgrades.reinforcedBarns ? 1.4 : 1.0;
        const warehouseMultiplier = state.upgrades.expandedStorage ? 1.35 : 1.0;

        // Space calculations from buildings
        let maxCatnip = 2000 + (state.buildings.pasture * 500) + (state.buildings.barn * 2500 * barnMultiplier);
        if (state.upgrades.catnipSilos) maxCatnip *= 1.5;

        const maxWood = 200 + (state.buildings.barn * 200 * barnMultiplier) + (state.buildings.warehouse * 150 * warehouseMultiplier);
        const maxMinerals = (state.buildings.barn * 250 * barnMultiplier) + (state.buildings.warehouse * 500 * warehouseMultiplier);
        const maxIron = (state.buildings.barn * 50 * barnMultiplier) + (state.buildings.warehouse * 150 * warehouseMultiplier);
        const maxScience = (state.buildings.library * 250) + (state.buildings.academy * 1000) + (state.buildings.warehouse * 100 * warehouseMultiplier);
        
        // Max housing space
        const maxKittens = (state.buildings.hut * 2) + (state.buildings.logHouse * 1);

        // 2. Season Progression (2 seconds of tick time = 1 Day!)
        let currentSeason = state.season.current;
        let daysPassed = state.season.daysPassed + (effectiveDelta * 0.5);
        if (daysPassed >= state.season.totalDays) {
          daysPassed = 0;
          const cycle: SeasonType[] = ['Spring', 'Summer', 'Autumn', 'Winter'];
          const currentIndex = cycle.indexOf(currentSeason);
          const nextIndex = (currentIndex + 1) % cycle.length;
          currentSeason = cycle[nextIndex];
          
          state.addLog(
            `A seasonal shift occurs! ${currentSeason} begins: ${SEASONS_DATA[currentSeason].desc}`,
            'season'
          );
        }

        // 3. Happiness Calculations
        // Base is 100%. If population > 5, each extra kitten causes -2% crowding stress.
        // Amphitheatres reduce stress or boost happiness directly by +4% each.
        const kittenCount = state.village.kittens.length;
        let crowdingPenalty = 0;
        if (kittenCount > 5) {
          crowdingPenalty = (kittenCount - 5) * 2;
        }
        const amphitheatreBoost = state.buildings.amphitheatre * 4;
        let finalHappiness = Math.min(150, Math.max(10, 100 - crowdingPenalty + amphitheatreBoost));

        // 4. Job Production rates per second
        // Check kitten count in each job
        const jobCounts: Record<JobType, number> = {
          farmer: 0,
          woodcutter: 0,
          scholar: 0,
          miner: 0,
          priest: 0
        };
        state.village.kittens.forEach(k => {
          if (k.job !== 'unemployed') {
            jobCounts[k.job]++;
          }
        });

        // FARMING: boost from agriculture, season modifier, and aqueduct multiplier
        const farmerEffBonus = state.researched.agriculture ? 1.20 : 1.0;
        const seasonModifier = state.researched.calendar ? SEASONS_DATA[currentSeason].catnipModifier : 1.0;
        const aqueductBoost = 1 + (state.buildings.aqueduct * 0.15); // +15% passive production per aqueduct

        // Base field production is passive
        const fieldsPassiveRate = state.buildings.catnipField * 0.63 * seasonModifier * aqueductBoost;
        const farmerRate = jobCounts.farmer * 5.0 * farmerEffBonus * seasonModifier;
        let catnipRate = fieldsPassiveRate + farmerRate;

        // KITTEN STARVATION: Each kitten consumes 4.25 catnip / sec
        // Pasture reduces food intake by 1.5% each, up to 50% max reduction
        const pastureIntakeReduction = Math.max(0.50, 1 - (state.buildings.pasture * 0.015));
        const kittenEatsRate = kittenCount * 4.25 * pastureIntakeReduction;
        catnipRate -= kittenEatsRate;

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

        // WOODCUTTER
        let axeMultiplier = 1.0;
        if (state.upgrades.ironAxes) axeMultiplier = 1.75;
        else if (state.upgrades.mineralAxes) axeMultiplier = 1.25;

        const woodcutterBase = jobCounts.woodcutter * 0.10 * axeMultiplier * efficiencyFactor;
        let woodRate = woodcutterBase;

        // SCHOLAR
        // Libraries & academies boost scholars
        const academyScholarMod = 1 + (state.buildings.academy * 0.20);
        let scienceRate = jobCounts.scholar * 0.25 * academyScholarMod * efficiencyFactor;

        // MINER
        const minerBase = jobCounts.miner * 0.18 * efficiencyFactor;
        // Mine adds slightly passive mineral gain as well
        let mineralsRate = minerBase + (state.buildings.mine * 0.05);

        // PRIEST
        let cultureRate = jobCounts.priest * 0.15 * efficiencyFactor;

        // SMELTER PASSIVES
        // Consumes 1.0 Wood and 10 Minerals to smelt +0.15 Iron per smelter
        let ironRate = 0;
        if (state.buildings.smelter > 0) {
          const count = state.buildings.smelter;
          const woodDemand = count * 1.0 * effectiveDelta;
          const minDemand = count * 10.0 * effectiveDelta;
          
          if (state.resources.wood.amount >= woodDemand && state.resources.minerals.amount >= minDemand) {
            // Apply consumption
            woodRate -= count * 1.0;
            mineralsRate -= count * 10.0;
            ironRate += count * 0.18;
          }
        }

        // Apply rates with delta
        let woodAmt = state.resources.wood.amount + (woodRate * effectiveDelta);
        let mineralsAmt = state.resources.minerals.amount + (mineralsRate * effectiveDelta);
        let scienceAmt = state.resources.science.amount + (scienceRate * effectiveDelta);
        let ironAmt = state.resources.iron.amount + (ironRate * effectiveDelta);
        let cultureAmt = state.resources.culture.amount + (cultureRate * effectiveDelta);

        // Clamping amounts to max
        catnipAmt = Math.min(catnipAmt, maxCatnip);
        woodAmt = Math.min(woodAmt, maxWood);
        mineralsAmt = Math.min(mineralsAmt, maxMinerals);
        ironAmt = Math.min(ironAmt, maxIron);
        scienceAmt = Math.min(scienceAmt, maxScience);
        // Culture does not have a hard ceiling in standard kittens, let's cap at 100000
        cultureAmt = Math.min(cultureAmt, 100000);

        // Ensure positive bottom values
        if (woodAmt < 0) woodAmt = 0;
        if (mineralsAmt < 0) mineralsAmt = 0;
        if (scienceAmt < 0) scienceAmt = 0;
        if (ironAmt < 0) ironAmt = 0;
        if (cultureAmt < 0) cultureAmt = 0;

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

        //6. Kitten Survival & Recruitment
        const updatedKittens = [...state.village.kittens];
        
        // Starvation logic checks
        // If hunger and kittens exist, there is a small risk they run away or die! (e.g. 1.2% chance per active starving tick)
        if (hungerState && updatedKittens.length > 0) {
          const starvationRisk = 0.05 * effectiveDelta;
          if (Math.random() < starvationRisk) {
            const deceased = updatedKittens.pop();
            if (deceased) {
              state.addLog(
                `Unfortunate tragedy! ${deceased.name} ${deceased.surname} has perished of winter starvation. Harvest catnip immediately!`, 
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
              `A curious stray kitten arrived in town! Say hello to ${newKitty.name} ${newKitty.surname} (${newKitty.trait}).`, 
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

        set({
          lastTick: now,
          season: {
            ...state.season,
            current: currentSeason,
            daysPassed: Math.floor(daysPassed)
          },
          resources: {
            catnip: { amount: catnipAmt, max: maxCatnip },
            wood: { amount: woodAmt, max: maxWood },
            minerals: { amount: mineralsAmt, max: maxMinerals },
            iron: { amount: ironAmt, max: maxIron },
            science: { amount: scienceAmt, max: maxScience },
            culture: { amount: cultureAmt, max: 10000 },
            // Crafted materials can hold up to 10M
            parchment: { amount: state.resources.parchment.amount, max: 5000 },
            beam: { amount: state.resources.beam.amount, max: 5000 },
            slab: { amount: state.resources.slab.amount, max: 5000 },
            plate: { amount: state.resources.plate.amount, max: 5000 },
          },
          village: {
            kittens: updatedKittens,
            maxKittens,
            happiness: finalHappiness
          },
          unlocks
        });
      },

      gatherCatnip: (multiplier: number = 1) => set(state => {
        // Gathering catnip manually is highly customizable
        const amt = Math.min(
          state.resources.catnip.amount + (1 * multiplier), 
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

      refineResource: (craftType, amount = 1) => set(state => {
        const res = JSON.parse(JSON.stringify(state.resources)) as GameState['resources'];
        
        if (craftType === 'wood') {
          // Refine catnip to wood: 100 catnip -> 1 wood
          const catnipCost = 100 * amount;
          if (res.catnip.amount >= catnipCost) {
            res.catnip.amount -= catnipCost;
            res.wood.amount = Math.min(res.wood.max, res.wood.amount + amount);
            // play sound logic
          }
        } 
        else if (craftType === 'beam') {
          // Refine wood -> beam: 175 wood -> 1 beam
          const cost = 175 * amount;
          if (state.researched.woodworking && res.wood.amount >= cost) {
            res.wood.amount -= cost;
            res.beam.amount = Math.min(res.beam.max, res.beam.amount + amount);
          }
        } 
        else if (craftType === 'slab') {
          // Refine minerals -> slab: 250 minerals -> 1 slab
          const cost = 250 * amount;
          if (state.researched.mining && res.minerals.amount >= cost) {
            res.minerals.amount -= cost;
            res.slab.amount = Math.min(res.slab.max, res.slab.amount + amount);
          }
        } 
        else if (craftType === 'plate') {
          // Refine iron -> plate: 150 iron -> 1 plate
          const cost = 150 * amount;
          if (state.researched.metalworking && res.iron.amount >= cost) {
            res.iron.amount -= cost;
            res.plate.amount = Math.min(res.plate.max, res.plate.amount + amount);
          }
        } 
        else if (craftType === 'parchment') {
          // Refine science + culture -> parchment: 175 science + 5 culture -> 1 parchment
          const sciCost = 175 * amount;
          const cultCost = 5 * amount;
          if (state.researched.writing && res.science.amount >= sciCost && res.culture.amount >= cultCost) {
            res.science.amount -= sciCost;
            res.culture.amount -= cultCost;
            res.parchment.amount = Math.min(res.parchment.max, res.parchment.amount + amount);
          }
        }

        return { resources: res };
      }),

      buyBuilding: (type, quantity = 1) => set(state => {
        const bDef = BUILDINGS[type];
        const owned = state.buildings[type];
        
        let canAfford = true;
        const res = JSON.parse(JSON.stringify(state.resources)) as GameState['resources'];
        
        // evaluate costs
        const computedCosts: Record<string, number> = {};
        for (const [resType, baseCost] of Object.entries(bDef.baseCost)) {
          let totalCost = 0;
          for (let i = 0; i < quantity; i++) {
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
          
          const qtyText = quantity === 1 ? 'one' : `${quantity}x`;
          state.addLog(`Built ${qtyText} ${bDef.name} for the village.`, 'success');
          
          return {
            resources: res,
            buildings: {
              ...state.buildings,
              [type]: owned + quantity
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
        
        return {
          village: {
            ...state.village,
            kittens
          }
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
        return {
          village: {
            ...state.village,
            kittens
          }
        };
      }),

      unassignAll: () => set(state => {
        const kittensList = Array.isArray(state.village?.kittens) ? state.village.kittens : [];
        const kittens = kittensList.map(k => ({ ...k, job: 'unemployed' as const }));
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

      forceAddKitten: () => set(state => {
         // cheat / manual recruiter
         const maxKittens = (state.buildings.hut * 2) + (state.buildings.logHouse * 1);
         const kittensList = Array.isArray(state.village?.kittens) ? state.village.kittens : [];
         if (kittensList.length < maxKittens) {
            const extra = generateRandomKitten();
            state.addLog(`A wandering kitten wanders into camp: ${extra.name} ${extra.surname}.`, 'success');
            return {
              village: {
                ...state.village,
                kittens: [...kittensList, extra]
              }
            };
         }
         return state;
      }),

      resetGame: () => {
        // complete wipe
        if (window.confirm("Are you absolutely sure you want to build a new colony? This will delete all current kittens, buildings, and scientific progress.")) {
          set({
            resources: BASE_RESOURCES,
            buildings: BASE_BUILDINGS,
            researched: BASE_RESEARCHED,
            upgrades: BASE_UPGRADES,
            village: {
              kittens: [],
              maxKittens: 0,
              happiness: 100,
            },
            season: {
              current: 'Spring',
              daysPassed: 0,
              totalDays: 100,
            },
            unlocks: {
              wood: false,
              minerals: false,
              iron: false,
              science: false,
              village: false,
              workshop: false,
              culture: false,
            },
            gameSpeed: 1,
            logs: [
              {
                id: 'reset',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                text: 'The slate is cleared. A brand-new kittens civilization begins.',
                type: 'success'
              }
            ],
            lastTick: Date.now()
          });
        }
      }
    }),
    {
      name: 'kittens-incremental-storage',
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
          const maxKittens = (mergedBuildings.hut * 2) + (mergedBuildings.logHouse * 1);
          const kitList = Array.isArray(persistedState.village.kittens) ? persistedState.village.kittens : [];
          
          mergedVillage = {
            kittens: kitList,
            maxKittens: maxKittens,
            happiness: typeof persistedState.village.happiness === 'number' ? persistedState.village.happiness : 100
          };
        }

        return {
          ...currentState,
          ...persistedState,
          resources: mergedResources,
          buildings: mergedBuildings,
          researched: mergedResearched,
          upgrades: mergedUpgrades,
          unlocks: mergedUnlocks,
          village: mergedVillage,
          theme: persistedState.theme === 'light' ? 'light' : 'dark',
          buyMultiplier: (persistedState.buyMultiplier === 1 || persistedState.buyMultiplier === 5 || persistedState.buyMultiplier === 25) 
            ? persistedState.buyMultiplier 
            : 1,
        } as GameState;
      }
    }
  )
);
