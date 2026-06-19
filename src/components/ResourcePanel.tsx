import React from 'react';
import { GameState, ResourceType } from '../types';
import { SEASONS_DATA } from '../gameData';
import { 
  Leaf, 
  Zap, 
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
      case 'wood': return <Zap size={14} className="text-amber-400" />;
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
    { id: 'catnip', label: 'Mega Seeds', rate: catnipRate },
    { id: 'wood', label: 'Plutonium', rate: woodRate },
    { id: 'minerals', label: 'Crystals', rate: mineralsRate },
    { id: 'iron', label: 'Neutrium', rate: ironRate },
    { id: 'science', label: 'Portal Tech', rate: scienceRate },
    { id: 'culture', label: 'Schwifty Vibes', rate: cultureRate },
  ];

  const craftedList: ResourceType[] = ['beam', 'slab', 'plate', 'parchment'];

  const labelMap: Record<string, string> = {
    beam: 'Nano-Beam',
    slab: 'Hyper-Slab',
    plate: 'Neutrium Plate',
    parchment: 'Portal Formula'
  };

  const curSeason = SEASONS_DATA[store.season.current];

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full shrink-0">
      
      {/* LEFT CLUSTER: Controls & Actions */}
      <div className="flex flex-row items-center xl:items-start gap-4 xl:gap-6 shrink-0 pb-2 xl:pb-0 border-b xl:border-b-0 xl:border-r theme-border border-dashed pr-0 xl:pr-6 overflow-x-auto scrollbar-none">
        
        {/* Season & Day Info */}
        <div className="flex flex-col gap-3 shrink-0 py-1 font-sans">
          <div className="flex items-center gap-2">
            <CloudSun size={16} className="theme-text-sec shrink-0 text-cyan-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-xs font-extrabold theme-text-main capitalize leading-none mb-1">
                {curSeason.name}
              </span>
              <span className="text-[10px] theme-text-sec font-mono">
                Coordinate Day {store.season.daysPassed}/{store.season.totalDays}
              </span>
            </div>
          </div>
          
          <div className="flex items-center theme-bg-card rounded-lg border theme-border p-0.5 backdrop-blur-md w-max">
            {([1, 5, 25] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  store.setBuyMultiplier(m);
                  if (store.soundEnabled) playClickSound('click');
                }}
                className={`py-1 px-2.5 text-[10px] font-mono font-bold rounded-md transition-all cursor-pointer ${
                  (store.buyMultiplier || 1) === m
                    ? 'theme-text-main bg-white/10 shadow-sm'
                    : 'theme-text-muted hover:theme-text-sec'
                }`}
              >
                {m}X
              </button>
            ))}
          </div>
        </div>

        <div className="w-px h-10 bg-white/5 mx-2 hidden sm:block shrink-0"></div>

        {/* Manual Actions */}
        <div className="flex items-stretch gap-2 shrink-0 py-1 h-full font-sans">
          <button
            onClick={handleManualGather}
            className="theme-bg-card hover:bg-white/5 border theme-border px-4 py-2 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs cursor-pointer shadow-sm min-w-[72px]"
          >
            <Leaf size={14} className="text-emerald-400" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Harvest</span>
          </button>

          {store.unlocks.wood && (
            <button
              onClick={handleManualRefine}
              disabled={(store.resources.catnip?.amount ?? 0) < 100}
              className="theme-bg-card hover:bg-white/5 border theme-border px-4 py-2 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs cursor-pointer shadow-sm disabled:opacity-30 disabled:cursor-not-allowed min-w-[72px]"
              title="Refine 100 Mega Seeds into 1 Plutonium"
            >
              <Zap size={14} className="text-amber-400" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Refine</span>
            </button>
          )}
        </div>
      </div>

      {/* RIGHT CLUSTER: The Resource Stream */}
      <div className="flex-1 flex overflow-x-auto scrollbar-none pb-4 xl:pb-0 -mx-5 px-5 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-3 sm:gap-4 md:gap-6 w-max font-sans">
          
          {resourcesList.map((res) => {
            const unlocked = res.id === 'catnip' || store.unlocks[res.id as keyof typeof store.unlocks];
            if (!unlocked) return null;

            const cur = store.resources[res.id]?.amount ?? 0;
            const limit = store.resources[res.id]?.max ?? 0;
            const showLimit = limit > 0;
            const percent = getPercent(cur, limit);

            return (
              <div key={res.id} className="flex flex-col gap-1.5 w-[110px] xl:w-[130px] shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg theme-bg-card border theme-border backdrop-blur-md">
                    {getResourceIcon(res.id)}
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider theme-text-sec leading-none truncate max-w-[80px]">{res.label}</span>
                    <span className={getRateColor(res.rate) + " text-[9px] mt-0.5 leading-none font-mono"}>
                      {res.rate >= 0 ? '+' : ''}{res.rate.toFixed(1)}/s
                    </span>
                  </div>
                </div>
                
                <div className="mt-1">
                  <div className="flex items-end justify-between font-mono mb-1">
                    <span className="text-sm xl:text-base font-bold theme-text-main leading-none">{formatNumber(cur)}</span>
                    {showLimit && <span className="text-[10px] theme-text-muted leading-none">/{formatNumber(limit)}</span>}
                  </div>
                  
                  {showLimit && (
                    <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 rounded-full ${
                          percent >= 100 ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : percent >= 90 ? 'bg-amber-300/80' : 'theme-bg-main bg-neutral-400'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Crafted Goods appended nicely */}
          {store.unlocks.workshop && craftedList.map((id) => {
            const unlocked = (store.resources[id]?.amount ?? 0) > 0 || 
              (id === 'beam' && store.researched.woodworking) || 
              (id === 'slab' && store.researched.mining) || 
              (id === 'plate' && store.researched.metalworking) || 
              (id === 'parchment' && store.researched.writing);

            if (!unlocked) return null;
            const cur = store.resources[id]?.amount ?? 0;

            return (
              <div key={id} className="flex flex-col justify-between py-1 px-3 border-l border-dashed theme-border h-full shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2 mt-0.5">{labelMap[id] || id}</span>
                <span className="text-sm xl:text-base font-bold theme-text-main font-mono leading-none mt-auto mb-1">
                   {formatNumber(cur)}
                </span>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}
