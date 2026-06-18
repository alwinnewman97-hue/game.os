import React, { useState } from 'react';
import { GameState, BuildingType, ResourceType } from '../types';
import { BUILDINGS } from '../gameData';
import { calculateCost } from '../store/useGameStore';
import { playClickSound } from '../utils/audio';
import { LayoutGrid, Landmark, Sparkles, Database, Plus, Sparkle } from 'lucide-react';

interface BonfireTabProps {
  store: GameState;
}

export default function BonfireTab({ store }: BonfireTabProps) {
  const handleBuild = (id: BuildingType) => {
    store.buyBuilding(id, store.buyMultiplier || 1);
    if (store.soundEnabled) playClickSound('build');
  };

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto">
      
      {/* BUILDINGS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(Object.entries(BUILDINGS) as [BuildingType, typeof BUILDINGS[BuildingType]][]).map(([id, b]) => {
          // Pre-requisites checks for tidy, progressive disclosure
          if (id === 'aqueduct' && !store.researched.agriculture) return null;
          if (id === 'pasture' && !store.unlocks.wood) return null;
          if (id === 'logHouse' && !store.researched.woodworking) return null;
          if (id === 'mine' && !store.researched.mining) return null;
          if (id === 'smelter' && !store.researched.metalworking) return null;
          if (id === 'academy' && !store.researched.writing) return null;
          if (id === 'amphitheatre' && !store.researched.theology) return null;
          if (id === 'warehouse' && !store.unlocks.minerals) return null;

          const count = store.buildings[id] || 0;
          const multiplier = store.buyMultiplier || 1;

          // Evaluate Cost affordability
          let canAfford = true;
          const costsList = Object.entries(b.baseCost).map(([res, baseCost]) => {
            let totalCost = 0;
            for (let i = 0; i < multiplier; i++) {
              totalCost += calculateCost(baseCost as number, b.costRatio, count + i);
            }
            const isAffordable = store.resources[res as ResourceType]?.amount >= totalCost;
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
                {Math.ceil(totalCost).toLocaleString()}
              </span>
            );
          });

          return (
            <div 
              key={id}
              className={`border rounded-xl p-3 flex items-center justify-between gap-4 transition-all duration-150 shadow-sm ${
                canAfford 
                  ? 'border-amber-500/20 theme-bg-card hover:border-amber-500/40 active:scale-[0.99]' 
                  : 'theme-border theme-bg-card opacity-80'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs sm:text-sm theme-text-main truncate">{b.name}</h4>
                  {count > 0 && (
                    <span className="px-1.5 py-0.2 text-[9px] font-mono font-extrabold bg-amber-400/15 text-amber-300 rounded border border-amber-400/30">
                      {count}
                    </span>
                  )}
                </div>
                
                {/* Cost badges block */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {costsList}
                </div>
              </div>

              <button
                onClick={() => handleBuild(id)}
                disabled={!canAfford}
                className={`shrink-0 h-9 px-3.5 text-[10px] uppercase font-extrabold tracking-wider border rounded-lg transition-all flex items-center justify-center gap-1 active:scale-[0.98] cursor-pointer ${
                  canAfford 
                    ? 'theme-accent-bg border-transparent shadow shadow-amber-400/10' 
                    : 'bg-transparent border-gray-800 theme-text-muted disabled:cursor-not-allowed disabled:opacity-40'
                }`}
              >
                <Plus size={11} />
                <span>Build {multiplier > 1 ? `x${multiplier}` : ''}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
