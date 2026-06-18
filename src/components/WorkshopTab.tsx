import React from 'react';
import { GameState, UpgradeType, ResourceType } from '../types';
import { UPGRADES } from '../gameData';
import { playClickSound } from '../utils/audio';
import { 
  Hammer, 
  Settings, 
  Check, 
  ArrowRight, 
  Layers, 
  Milestone, 
  Scroll, 
  PackageCheck
} from 'lucide-react';

interface WorkshopTabProps {
  store: GameState;
}

export default function WorkshopTab({ store }: WorkshopTabProps) {

  const handleBuyUpgrade = (id: UpgradeType) => {
    store.buyUpgrade(id);
    if (store.soundEnabled) playClickSound('research');
  };

  const handleRefine = (craftType: 'wood' | 'beam' | 'slab' | 'plate' | 'parchment', amount: number) => {
    store.refineResource(craftType, amount);
    if (store.soundEnabled) playClickSound('wood');
  };

  const multiplier = store.buyMultiplier || 1;

  // Evaluate crafts list without verbose details
  const craftsList: {
    id: 'wood' | 'beam' | 'slab' | 'plate' | 'parchment';
    label: string;
    costsDesc: string;
    canCraft: boolean;
    hasUnlocked: boolean;
  }[] = [
    {
      id: 'wood',
      label: 'Wood',
      costsDesc: '100 Catnip',
      canCraft: store.resources.catnip.amount >= 100,
      hasUnlocked: store.unlocks.wood,
    },
    {
      id: 'beam',
      label: 'Beam',
      costsDesc: '175 Wood',
      canCraft: store.resources.wood.amount >= 175,
      hasUnlocked: store.researched.woodworking,
    },
    {
      id: 'slab',
      label: 'Slab',
      costsDesc: '250 Minerals',
      canCraft: store.resources.minerals.amount >= 250,
      hasUnlocked: store.researched.mining,
    },
    {
      id: 'plate',
      label: 'Plate',
      costsDesc: '150 Iron',
      canCraft: store.resources.iron.amount >= 150,
      hasUnlocked: store.researched.metalworking,
    },
    {
      id: 'parchment',
      label: 'Parchment',
      costsDesc: '175 Science, 5 Culture',
      canCraft: store.resources.science.amount >= 175 && store.resources.culture.amount >= 5,
      hasUnlocked: store.researched.writing,
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto">
      
      {/* SECTION HEADER */}
      <div className="flex justify-between items-center pb-2 border-b theme-border">
        <span className="text-[10px] uppercase font-black theme-text-muted tracking-widest">Workshop Refining & Forge</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: HIGH-DENSITY REFINING FORGE */}
        <div className="lg:col-span-4 flex flex-col gap-2.5">
          <span className="text-[10px] uppercase font-black theme-text-muted">Crafter Line</span>
          <div className="space-y-1.5">
            {craftsList.map((craft) => {
              if (!craft.hasUnlocked) return null;

              return (
                <div 
                  key={craft.id}
                  className="theme-bg-card border theme-border p-2.5 rounded-xl flex items-center justify-between gap-4 hover:theme-border-active transition-all shadow-sm"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-xs theme-text-main block">
                      {craft.id === 'wood' ? '🪵' : craft.id === 'beam' ? '🧳' : craft.id === 'slab' ? '🧱' : craft.id === 'plate' ? '⚙️' : '📜'} {craft.label}
                    </span>
                    <span className="text-[10px] theme-text-muted block mt-0.5">Deducts: {craft.costsDesc}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleRefine(craft.id, 1)}
                      disabled={!craft.canCraft}
                      className="px-2 py-1 text-[10px] uppercase font-bold theme-text-main border theme-border hover:theme-bg-panel disabled:opacity-25 rounded-md cursor-pointer transition-colors"
                    >
                      Craft +1
                    </button>
                    {multiplier > 1 && (
                      <button
                        onClick={() => handleRefine(craft.id, multiplier)}
                        disabled={!craft.canCraft}
                        className="px-2.5 py-1 text-[10px] uppercase font-extrabold bg-amber-400 text-neutral-900 shadow hover:bg-amber-300 disabled:opacity-25 rounded-md cursor-pointer transition-colors"
                      >
                        +{multiplier}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: PERMANENT UPGRADES & SCHEMATICS */}
        <div className="lg:col-span-8 flex flex-col gap-2.5">
          <span className="text-[10px] uppercase font-black theme-text-muted">Permanent Upgrades</span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(Object.entries(UPGRADES) as [UpgradeType, typeof UPGRADES[UpgradeType]][]).map(([id, u]) => {
              const isOwned = store.upgrades[id];

              // Pre-requisites to prevent spam
              if (id === 'ironAxes' && !store.upgrades.mineralAxes) return null;
              if (id === 'reinforcedBarns' && !store.researched.mining) return null;
              if (id === 'expandedStorage' && !store.researched.metalworking) return null;

              // Cost evaluation
              let canAfford = true;
              const costsList = Object.entries(u.cost).map(([res, costVal]) => {
                const isAffordable = store.resources[res as ResourceType]?.amount >= (costVal as number);
                if (!isAffordable) canAfford = false;
                return (
                  <span 
                    key={res} 
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      isAffordable 
                        ? 'theme-bg-panel theme-text-sec border-neutral-700' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}
                  >
                    <span className="capitalize font-sans mr-1">{res}:</span>
                    {(costVal as number).toLocaleString()}
                  </span>
                );
              });

              return (
                <div 
                  key={id}
                  className={`border rounded-xl p-3 flex items-center justify-between gap-4 transition-all duration-150 shadow-sm ${
                    isOwned 
                      ? 'border-neutral-500/10 bg-neutral-500/5 opacity-70' 
                      : canAfford 
                        ? 'border-amber-500/20 theme-bg-card hover:border-amber-500/40 active:scale-[0.99]' 
                        : 'theme-border theme-bg-card opacity-80'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs sm:text-sm theme-text-main truncate">{u.name}</h4>
                      {isOwned && (
                        <span className="px-1 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-bold rounded">
                          Forged
                        </span>
                      )}
                    </div>
                    
                    <p className="text-[10px] theme-text-sec mt-1 truncate">{u.effectsDesc}</p>

                    {/* Inline Costs */}
                    {!isOwned && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {costsList}
                      </div>
                    )}
                  </div>

                  {!isOwned && (
                    <button
                      onClick={() => handleBuyUpgrade(id)}
                      disabled={!canAfford}
                      className={`shrink-0 h-9 px-3.5 text-[10px] uppercase font-extrabold tracking-wider border rounded-lg transition-all flex items-center justify-center gap-1 active:scale-[0.98] cursor-pointer ${
                        canAfford 
                          ? 'theme-accent-bg border-transparent shadow shadow-amber-400/10' 
                          : 'bg-transparent border-gray-800 theme-text-muted disabled:cursor-not-allowed disabled:opacity-40'
                      }`}
                    >
                      Forge
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
