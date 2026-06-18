import React from 'react';
import { GameState, ResourceType } from '../types';
import { SEASONS_DATA } from '../gameData';
import { 
  Leaf, 
  Trees, 
  Gem, 
  Anchor, 
  FlaskConical, 
  Milestone, 
  Scroll, 
  CloudSun,
  Flame,
  Volume2,
  VolumeX,
  Volume
} from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface ResourcePanelProps {
  store: GameState;
  catnipRate: number;
  woodRate: number;
  scienceRate: number;
  mineralsRate: number;
  cultureRate: number;
  ironRate: number;
}

export default function ResourcePanel({
  store,
  catnipRate,
  woodRate,
  scienceRate,
  mineralsRate,
  cultureRate,
  ironRate
}: ResourcePanelProps) {

  const formatNumber = (num: number): string => {
    if (num >= 10000) return (num / 1000).toFixed(1) + 'K';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    if (num % 1 !== 0) return num.toFixed(1);
    return num.toString();
  };

  const getResourceIcon = (res: ResourceType) => {
    switch (res) {
      case 'catnip': return <Leaf size={14} className="theme-text-sec" />;
      case 'wood': return <Trees size={14} className="theme-text-sec" />;
      case 'minerals': return <Gem size={14} className="theme-text-sec" />;
      case 'iron': return <Anchor size={14} className="theme-text-sec" />;
      case 'science': return <FlaskConical size={14} className="theme-text-sec" />;
      case 'culture': return <Flame size={14} className="theme-text-sec" />;
      case 'parchment': return <Scroll size={14} className="theme-text-sec" />;
      case 'beam': return <Milestone size={14} className="theme-text-sec" />;
      default: return null;
    }
  };

  const handleManualGather = () => {
    if (store.soundEnabled) playClickSound('click');
    store.gatherCatnip(1);
  };

  const handleManualRefine = () => {
    if (store.soundEnabled) playClickSound('wood');
    store.refineResource('wood', 1);
  };

  // Helper to color the rate
  const getRateColor = (rate: number) => {
    if (rate > 0) return 'text-emerald-500 font-semibold';
    if (rate < 0) return 'text-red-500 font-bold';
    return 'theme-text-muted';
  };

  // Calculate percentages for progress bars
  const getPercent = (amount: number, max: number) => {
    if (max <= 0) return 0;
    return Math.min(100, (amount / max) * 100);
  };

  const resourcesList: { id: ResourceType; label: string; rate: number }[] = [
    { id: 'catnip', label: 'Catnip', rate: catnipRate },
    { id: 'wood', label: 'Wood', rate: woodRate },
    { id: 'minerals', label: 'Minerals', rate: mineralsRate },
    { id: 'iron', label: 'Iron', rate: ironRate },
    { id: 'science', label: 'Science', rate: scienceRate },
    { id: 'culture', label: 'Culture', rate: cultureRate },
  ];

  const craftedList: ResourceType[] = ['beam', 'slab', 'plate', 'parchment'];

  const curSeason = SEASONS_DATA[store.season.current];

  return (
    <div className="flex flex-col gap-4 theme-bg-panel p-4 w-full h-full overflow-y-auto scrollbar-none">
      
      {/* COHESIVE HUD CARD */}
      <div className="theme-bg-card p-3 rounded-xl border theme-border shadow-sm flex flex-col gap-3">
        {/* SEASON & DAY OVERVIEW */}
        <div className="flex items-center justify-between border-b theme-border pb-2.5">
          <div className="flex items-center gap-1.5">
            <CloudSun size={15} className="theme-text-sec shrink-0" />
            <span className="text-xs font-extrabold theme-text-main capitalize">
              {curSeason.name}
            </span>
            <span className="text-[10px] theme-text-muted">
              (Farmers x{curSeason.catnipModifier.toFixed(1)})
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold theme-text-sec">
            Day {store.season.daysPassed}/{store.season.totalDays}
          </span>
        </div>

        {/* COMPACT MULTIPLIER AND SINGLE ACTION LINE */}
        <div className="flex items-center gap-2">
          {/* MULTISELECT PILLS */}
          <div className="flex items-center p-0.5 theme-bg-panel rounded-lg border theme-border flex-1">
            {([1, 5, 25] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  store.setBuyMultiplier(m);
                  if (store.soundEnabled) playClickSound('click');
                }}
                className={`flex-1 py-1 text-[10px] sm:text-xs font-mono font-bold rounded transition-all cursor-pointer text-center ${
                  (store.buyMultiplier || 1) === m
                    ? 'bg-amber-400 text-neutral-950 font-black shadow-sm'
                    : 'theme-text-muted hover:theme-text-sec'
                }`}
              >
                {m}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* COMPACT MODERN LABORS */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleManualGather}
          className="theme-accent-bg font-extrabold border theme-border py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-wider transition-all duration-150 active:scale-[0.98] cursor-pointer shadow-sm select-none"
        >
          <Leaf size={12} className="shrink-0" />
          <span>Gather</span>
        </button>

        {store.unlocks.wood ? (
          <button
            onClick={handleManualRefine}
            disabled={(store.resources.catnip?.amount ?? 0) < 100}
            className="theme-bg-card hover:theme-hover-bg border theme-border disabled:opacity-30 disabled:cursor-not-allowed py-2 text-[11px] font-bold theme-text-main rounded-lg transition-transform duration-100 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 select-none"
            title="Refine 100 Catnip into 1 Wood"
          >
            <Trees size={12} className="shrink-0 text-amber-500" />
            <span>Refine</span>
          </button>
        ) : (
          <div className="theme-bg-card opacity-20 border theme-border py-2 text-[10px] theme-text-muted rounded-lg flex items-center justify-center select-none cursor-not-allowed">
            Locked
          </div>
        )}
      </div>

      {/* CORE RESOURCES */}
      <div className="flex-1">
        <h3 className="text-[10px] uppercase font-bold tracking-widest theme-text-muted mb-3 ml-1">Core Resources</h3>
        <div className="space-y-4">
          {resourcesList.map((res) => {
            const unlocked = res.id === 'catnip' || store.unlocks[res.id as keyof typeof store.unlocks];
            if (!unlocked) return null;

            const cur = store.resources[res.id]?.amount ?? 0;
            const limit = store.resources[res.id]?.max ?? 0;
            const percent = getPercent(cur, limit);
            const showLimit = limit > 0;

            return (
              <div key={res.id} className="group flex flex-col gap-1 theme-hover-bg p-1.5 rounded transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 font-bold text-xs theme-text-main">
                    {getResourceIcon(res.id)}
                    <span>{res.label}</span>
                  </div>
                  <div className="text-[10.5px] theme-text-sec font-bold flex items-center gap-1 font-mono">
                    <span>{formatNumber(cur)}</span>
                    {showLimit && (
                      <>
                        <span className="theme-text-muted">/</span>
                        <span className="theme-text-muted">{formatNumber(limit)}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* SLIM PROGRESS BAR */}
                {showLimit && (
                  <div className="w-full h-[3px] theme-bg-app rounded-full overflow-hidden mt-0.5">
                    <div 
                      className={`h-full transition-all duration-300 rounded-full ${
                        percent >= 100 
                          ? 'bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.5)]' 
                          : percent >= 90
                          ? 'bg-amber-300/80'
                          : 'theme-accent-bg'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                )}

                {/* PER SEC VALUES & DETAILS */}
                <div className="flex justify-between items-center text-[9px] theme-text-muted px-0.5">
                  <span>{showLimit ? `${percent.toFixed(0)}% capacity` : 'No limit'}</span>
                  <span className={getRateColor(res.rate)}>
                    {res.rate >= 0 ? '+' : ''}{res.rate.toFixed(2)}/s
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* CRAFTED GOODS */}
        {store.unlocks.workshop && (
          <div className="mt-6 pt-5 border-t theme-border">
            <h3 className="text-[10px] uppercase font-bold tracking-widest theme-text-muted mb-3 ml-1">Refined Artifacts</h3>
            <div className="grid grid-cols-2 gap-2">
              {craftedList.map((id) => {
                const unlocked = (store.resources[id]?.amount ?? 0) > 0 || 
                  (id === 'beam' && store.researched.woodworking) || 
                  (id === 'slab' && store.researched.mining) || 
                  (id === 'plate' && store.researched.metalworking) || 
                  (id === 'parchment' && store.researched.writing);

                if (!unlocked) return null;

                const cur = store.resources[id]?.amount ?? 0;

                return (
                  <div key={id} className="theme-bg-card border theme-border p-2 rounded-lg flex flex-col justify-between hover:theme-border-active transition-colors">
                    <span className="text-[10px] theme-text-muted capitalize">{id}</span>
                    <span className="text-xs font-bold theme-text-main font-mono mt-1">{formatNumber(cur)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
