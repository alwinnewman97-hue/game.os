import React from 'react';
import { GameState, ScienceType, ResourceType } from '../types';
import { SCIENCES } from '../gameData';
import { playClickSound } from '../utils/audio';
import { FlaskConical, Check, Sparkles } from 'lucide-react';

interface ScienceTabProps {
  store: GameState;
}

export default function ScienceTab({ store }: ScienceTabProps) {

  const handleResearch = (type: ScienceType) => {
    store.researchScience(type);
    if (store.soundEnabled) playClickSound('research');
  };

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto">
      
      {/* SCIENCE POOL OVERVIEW */}
      <div className="flex justify-between items-center pb-2 border-b theme-border">
        <span className="text-[10px] uppercase font-black theme-text-muted tracking-widest">Scientific Register</span>
        <div className="text-[11px] font-mono theme-text-main">
          Science Points: <span className="font-bold text-amber-400">{Math.floor(store.resources.science.amount).toLocaleString()}</span>
        </div>
      </div>

      {/* RESEARCH DIRECTORY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(Object.entries(SCIENCES) as [ScienceType, typeof SCIENCES[ScienceType]][]).map(([id, s]) => {
          const isResearched = store.researched[id];
          
          // Progressive unlock of research topics: hide later research if ancestors aren't researched
          if (id === 'agriculture' && !store.researched.calendar) return null;
          if (id === 'woodworking' && !store.researched.agriculture) return null;
          if (id === 'mining' && !store.researched.woodworking) return null;
          if (id === 'metalworking' && !store.researched.mining) return null;
          if (id === 'writing' && !store.researched.woodworking) return null;
          if (id === 'theology' && !store.researched.writing) return null;

          // Compute affordability
          let canAfford = true;
          const costsList = Object.entries(s.cost).map(([res, costVal]) => {
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
              className={`border rounded-xl p-3 flex items-center justify-between gap-4 transition-all duration-155 shadow-sm ${
                isResearched 
                  ? 'border-neutral-500/10 bg-neutral-500/5 opacity-70' 
                  : canAfford 
                    ? 'border-amber-500/20 theme-bg-card hover:border-amber-500/40 active:scale-[0.99] cursor-pointer' 
                    : 'theme-border theme-bg-card opacity-80'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs sm:text-sm theme-text-main truncate">{s.name}</h4>
                  {isResearched && (
                    <span className="px-1 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-bold rounded">
                      Learned
                    </span>
                  )}
                </div>
                
                {/* Effect subtext */}
                <p className="text-[10px] theme-text-sec mt-1 truncate">{s.effectsDesc}</p>

                {/* Inline Costs */}
                {!isResearched && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {costsList}
                  </div>
                )}
              </div>

              {!isResearched && (
                <button
                  onClick={() => handleResearch(id)}
                  disabled={!canAfford}
                  className={`shrink-0 h-9 px-3.5 text-[10px] uppercase font-extrabold tracking-wider border rounded-lg transition-all flex items-center justify-center gap-1 active:scale-[0.98] cursor-pointer ${
                    canAfford 
                      ? 'theme-accent-bg border-transparent shadow shadow-amber-400/10' 
                      : 'bg-transparent border-gray-800 theme-text-muted disabled:cursor-not-allowed disabled:opacity-40'
                  }`}
                >
                  Learn
                </button>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
