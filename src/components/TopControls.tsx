import React from "react";
import { GameState } from "../types";
import { DIMENSIONS_DATA } from "../gameData";
import { DAY_DURATION_IN_GAME_SEC } from "../store/useGameStore";
import { Leaf, Play, Pause } from "lucide-react";
import { playClickSound, triggerHaptic } from "../utils/audio";

interface TopControlsProps {
  store: GameState;
}

export default function TopControls({ store }: TopControlsProps) {
  const isCompact = store.density === "compact";
  const curDimension = DIMENSIONS_DATA[store.currentDimension];

  const handleManualGather = (e: React.MouseEvent) => {
    triggerHaptic("click");
    if (store.soundEnabled) playClickSound("click");
    const portalFluxMultiplier = 1 + ((store.portalFlux || 0) * 0.1);
    const dimAmplifierLevel = store.portalUpgrades?.dimensionalAmplifier ?? 0;
    const dimensionalMultiplier = 1 + (dimAmplifierLevel * 0.15);
    const baseGain = Math.max(1, Math.round(1 * portalFluxMultiplier * dimensionalMultiplier));

    const catnipAmount = store.resources.catnip?.amount ?? 0;
    const catnipMax = store.resources.catnip?.max ?? 0;
    const spaceLeft = Math.max(0, catnipMax - catnipAmount);
    const gained = Math.min(baseGain, spaceLeft);

    store.gatherCatnip(1);

    if (gained > 0) {
      // Create a floating text effect directly via DOM for performance
      const el = document.createElement("div");
      el.className = "absolute text-emerald-400 font-bold font-mono text-sm pointer-events-none z-50 animate-float-up";
      el.textContent = "+" + gained;
      el.style.left = e.clientX + "px";
      el.style.top = e.clientY + "px";
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1000);
    }
  };

  const seasonInfo = {
    spring: { label: 'Spring', icon: '🌱', color: 'text-emerald-400', desc: 'Ver-Seed Equinox (+25% Greenhouses)' },
    summer: { label: 'Summer', icon: '☀️', color: 'text-amber-400', desc: 'Solar Zenith (Base Production)' },
    autumn: { label: 'Autumn', icon: '🍁', color: 'text-orange-500', desc: 'Golden Harvest (-25% Greenhouses)' },
    winter: { label: 'Winter', icon: '❄️', color: 'text-cyan-400', desc: 'Cryo-Frost (-80% Greenhouses, solved by Portal Heaters)' }
  };

  const currentSeason = store.season || 'spring';
  const currentDay = store.day || 1;
  const currentYear = store.year || 1;
  const activeSeasonData = seasonInfo[currentSeason as 'spring' | 'summer' | 'autumn' | 'winter'];

  const isSpringBreak = currentSeason === 'spring' && currentDay >= 10 && currentDay < 15;
  const isSolarPurge = currentSeason === 'summer' && currentDay >= 20 && currentDay < 23;
  const isSeedHarvest = currentSeason === 'autumn' && currentDay >= 15 && currentDay < 20;
  const isCromulonGifts = currentSeason === 'winter' && currentDay >= 25 && currentDay < 30;

  let festivalBadge = null;
  if (isSpringBreak) {
    festivalBadge = { label: '🌸 Citadel Spring Break (+20% Happiness, +15% Job Speed)', color: 'bg-pink-900/40 text-pink-300 border-pink-700/50' };
  } else if (isSolarPurge) {
    festivalBadge = { label: '🔥 Solar Purge Active (2x Plutonium Scrap yield)', color: 'bg-amber-900/40 text-amber-300 border-amber-700/50' };
  } else if (isSeedHarvest) {
    festivalBadge = { label: '🍁 Botanical Clones Seed Harvest (+50% Seed Gains)', color: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50' };
  } else if (isCromulonGifts) {
    festivalBadge = { label: '🎁 Cromulon Gift-giving (+30% Science/Culture)', color: 'bg-purple-900/40 text-purple-300 border-purple-700/50' };
  }

  return (
    <div className="flex flex-col items-end gap-1 sm:gap-2 w-full">
      <div className="flex items-center justify-end w-full">
        <button
          onClick={() => {
            const nextSpeed = store.gameSpeed === 0 ? 1 : 0;
            store.setGameSpeed(nextSpeed);
            if (store.soundEnabled) playClickSound("click");
          }}
          className={`p-1.5 sm:p-2.5 rounded-xl theme-bg-card border theme-border transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
            store.gameSpeed === 0
              ? "text-amber-500 border-amber-500/30 bg-amber-500/5 animate-pulse"
              : "theme-text-sec hover:theme-text-main"
          }`}
          title={store.gameSpeed === 0 ? "Resume Game" : "Pause Game"}
        >
          {store.gameSpeed === 0 ? <Play size={15} /> : <Pause size={15} />}
          <span className="text-[11px] font-black font-sans uppercase tracking-wider hidden sm:inline">
            {store.gameSpeed === 0 ? "Paused" : "Pause"}
          </span>
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
        <div className="flex items-center theme-bg-card rounded-lg border theme-border p-1 backdrop-blur-md w-max">
          {([1, 5, "max"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                store.setBuyMultiplier(m);
                if (store.soundEnabled) playClickSound("click");
              }}
              className={`text-[10px] sm:text-[10px] font-mono font-bold rounded-md transition-all cursor-pointer ${
                isCompact 
                  ? "py-1.5 px-3 sm:py-0.5 sm:px-1.5 text-[10px] sm:text-[9px]" 
                  : "py-2 px-3.5 sm:py-1 sm:px-2"
              } ${
                (store.buyMultiplier || 1) === m
                  ? "theme-text-main theme-bg-hover shadow-sm"
                  : "theme-text-muted hover:theme-text-sec"
              }`}
            >
              {m === "max" ? "MAX" : `${m}X`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 sm:gap-2">
        <div className={`flex flex-col items-end py-0.5 px-1.5 sm:py-1 sm:px-3 rounded-lg sm:rounded-xl theme-bg-card border theme-border font-sans transition-all duration-300 ${
          isCompact ? 'gap-0.5' : 'gap-1'
        }`}>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className={`font-extrabold theme-text-main capitalize leading-none ${
                  isCompact ? 'text-[10px] sm:text-[11px]' : 'text-[11px] sm:text-xs'
                }`}>
                  {curDimension.name}
                </span>
                <span className="text-[9px] sm:text-[10px] theme-text-muted font-mono">Yr {currentYear}</span>
              </div>
              <span className={`font-mono font-extrabold ${activeSeasonData.color} mt-0.5 leading-none ${
                isCompact ? 'text-[10px] sm:text-[11px]' : 'text-[11px] sm:text-xs'
              }`}>
                {activeSeasonData.label} - Day {currentDay}/40
              </span>
            </div>
            <span className="text-xs sm:text-sm select-none">{activeSeasonData.icon}</span>
          </div>
          <div className="flex flex-col gap-1 w-full mt-1 items-end max-w-[120px] sm:max-w-[170px]">
            <div className="h-1 w-full theme-bg-hover rounded-full overflow-hidden relative border theme-border">
              <div 
                className={`h-full theme-accent-bg transition-all duration-300`}
                style={{ width: `${Math.min(100, (((currentDay - 1) + ((store.dayProgress || 0) / DAY_DURATION_IN_GAME_SEC)) / 40) * 100)}%` }}
              />
            </div>
          </div>
          {festivalBadge && (
            <div className={`flex items-center gap-1 px-1 sm:px-1.5 py-0.5 rounded text-[7px] sm:text-[8px] font-mono font-bold border ${festivalBadge.color} animate-pulse mt-0.5 max-w-[120px] sm:max-w-[170px] overflow-hidden truncate`}>
              {festivalBadge.label}
            </div>
          )}
        </div>
        
        <button
          onClick={handleManualGather}
          className={`theme-bg-card hover:theme-bg-hover border theme-border flex flex-col items-center justify-center transition-all cursor-pointer shadow-sm ${
            isCompact
              ? "px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg gap-1 text-[9px] sm:text-[10px] min-w-[60px]"
              : "px-3 py-2 sm:px-4 sm:py-2 rounded-xl gap-1 sm:gap-1.5 text-xs min-w-[70px]"
          }`}
        >
          <Leaf size={isCompact ? 10 : 13} className="text-emerald-400" />
          <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest theme-text-muted">
            Harvest
          </span>
        </button>
      </div>
    </div>
  );
}
