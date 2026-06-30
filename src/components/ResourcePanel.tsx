import React from "react";
import { GameState, ResourceType } from "../types";
import { DIMENSIONS_DATA } from "../gameData";
import { DAY_DURATION_IN_GAME_SEC } from "../store/useGameStore";
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
  Volume,
  Atom,
} from "lucide-react";
import { playClickSound, triggerHaptic } from "../utils/audio";

interface ResourcePanelProps {
  store: GameState;
  catnipRate: number;
  woodRate: number;
  scienceRate: number;
  mineralsRate: number;
  cultureRate: number;
  ironRate: number;
  darkMatterRate: number;
  portalFluidRate: number;
}

export default function ResourcePanel({
  store,
  catnipRate,
  woodRate,
  scienceRate,
  mineralsRate,
  cultureRate,
  ironRate,
  darkMatterRate,
  portalFluidRate,
}: ResourcePanelProps) {
  const formatNumber = (num: number): string => {
    if (num >= 10000) return (num / 1000).toFixed(1) + "K";
    if (num >= 1000) return (num / 1000).toFixed(2) + "K";
    if (num % 1 !== 0) return num.toFixed(1);
    return num.toString();
  };

  const getResourceIcon = (res: ResourceType) => {
    switch (res) {
      case "catnip":
        return <Leaf size={14} className="theme-text-sec" />;
      case "wood":
        return <Zap size={14} className="text-amber-400" />;
      case "minerals":
        return <Gem size={14} className="theme-text-sec" />;
      case "iron":
        return <Anchor size={14} className="theme-text-sec" />;
      case "science":
        return <FlaskConical size={14} className="theme-text-sec" />;
      case "culture":
        return <Flame size={14} className="theme-text-sec" />;
      case "darkMatter":
        return <Atom size={14} className="theme-text-sec" />;
      case "portalFluid":
        return <FlaskConical size={14} className="text-emerald-400" />;
      case "flurbo":
        return <Gem size={14} className="text-yellow-400" />;
      default:
        return null;
    }
  };

  const handleManualGather = () => {
    triggerHaptic("click");
    if (store.soundEnabled) playClickSound("click");
    store.gatherCatnip(1);
  };

  // Helper to color the rate
  const getRateColor = (rate: number) => {
    if (rate > 0) return "text-emerald-500 font-semibold";
    if (rate < 0) return "text-red-500 font-bold";
    return "theme-text-muted";
  };

  // Calculate percentages for progress bars
  const getPercent = (amount: number, max: number) => {
    if (max <= 0) return 0;
    return Math.min(100, (amount / max) * 100);
  };

  const resourcesList: { id: ResourceType; label: string; rate: number }[] = [
    { id: "catnip", label: "Mega Seeds", rate: catnipRate },
    { id: "wood", label: "Plutonium", rate: woodRate },
    { id: "minerals", label: "Crystals", rate: mineralsRate },
    { id: "iron", label: "Neutrium", rate: ironRate },
    { id: "science", label: "Portal Tech", rate: scienceRate },
    { id: "culture", label: "Schwifty Vibes", rate: cultureRate },
    { id: "darkMatter", label: "Dark Matter", rate: darkMatterRate },
    { id: "portalFluid", label: "Portal Fluid", rate: portalFluidRate },
  ];

  const curDimension = DIMENSIONS_DATA[store.currentDimension];

  const isCompact = store.density === "compact";

  return (
    <div
      className={`flex flex-col xl:flex-row w-full shrink-0 transition-all duration-300 ${
        isCompact ? "gap-3 xl:gap-4" : "gap-6"
      }`}
    >
      {/* LEFT CLUSTER: Controls & Actions */}
      <div
        className={`flex flex-row items-center xl:items-start shrink-0 pb-1.5 xl:pb-0 border-b xl:border-b-0 xl:border-r theme-border border-dashed pr-0 overflow-x-auto scrollbar-none transition-all duration-300 ${
          isCompact ? "gap-2.5 xl:gap-3.5 xl:pr-3.5" : "gap-4 xl:gap-6 xl:pr-6"
        }`}
      >
        {/* Season & Day Calendar System */}
        {(() => {
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
            <div className={`flex flex-col shrink-0 py-1 px-3 rounded-xl bg-slate-900/40 border border-slate-800/80 font-sans transition-all duration-300 ${
              isCompact ? 'gap-0.5' : 'gap-1'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-sm select-none">{activeSeasonData.icon}</span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-extrabold theme-text-main capitalize leading-none ${
                      isCompact ? 'text-[11px]' : 'text-xs'
                    }`}>
                      {curDimension.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Yr {currentYear}</span>
                  </div>
                  <span className={`font-mono font-extrabold ${activeSeasonData.color} mt-0.5 leading-none ${
                    isCompact ? 'text-[11px]' : 'text-xs'
                  }`}>
                    {activeSeasonData.label} - Day {currentDay}/40
                  </span>
                </div>
              </div>
              
              <div className="text-[9px] text-slate-400 font-mono tracking-wide max-w-[170px] leading-tight select-none">
                {activeSeasonData.desc}
              </div>

              {/* Season duration progress bar */}
              <div className="flex flex-col gap-1 mt-1 w-full max-w-[170px]">
                <div className="flex justify-between text-[8px] leading-none text-slate-500 font-mono">
                  <span>Duration</span>
                  <span>{Math.ceil(Math.max(0, 40 - currentDay))} days left</span>
                </div>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden relative border border-slate-700/30">
                  <div 
                    className={`h-full ${
                      currentSeason === 'spring' ? 'bg-emerald-500' :
                      currentSeason === 'summer' ? 'bg-amber-500' :
                      currentSeason === 'autumn' ? 'bg-orange-500' :
                      'bg-cyan-500'
                    } transition-all duration-300`}
                    style={{ width: `${100 - Math.min(100, (((currentDay - 1) + ((store.dayProgress || 0) / DAY_DURATION_IN_GAME_SEC)) / 40) * 100)}%` }}
                  />
                </div>
              </div>

              {festivalBadge && (
                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold border ${festivalBadge.color} animate-pulse mt-0.5 max-w-[170px] overflow-hidden truncate`}>
                  {festivalBadge.label}
                </div>
              )}
            </div>
          );
        })()}
        <div className="flex items-center theme-bg-card rounded-lg border theme-border p-0.5 backdrop-blur-md w-max self-center xl:self-start">
          {([1, 5, "max"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                store.setBuyMultiplier(m);
                if (store.soundEnabled) playClickSound("click");
              }}
              className={`text-[10px] font-mono font-bold rounded-md transition-all cursor-pointer ${
                isCompact ? "py-0.5 px-2 text-[9px]" : "py-1 px-2.5"
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

        <div
          className={`theme-bg-hover mx-1 hidden sm:block shrink-0 transition-all duration-300 ${
            isCompact ? "w-px h-8" : "w-px h-10"
          }`}
        ></div>

        {/* Manual Actions */}
        <div className="flex items-stretch gap-1.5 shrink-0 py-0.5 h-full font-sans">
          <button
            onClick={handleManualGather}
            className={`theme-bg-card hover:theme-bg-hover border theme-border flex flex-col items-center justify-center transition-all cursor-pointer shadow-sm ${
              isCompact
                ? "px-2.5 py-1.5 rounded-lg gap-1.0 text-2xs min-w-[62px]"
                : "px-4 py-2 rounded-xl gap-1.5 text-xs min-w-[72px]"
            }`}
          >
            <Leaf size={isCompact ? 12 : 14} className="text-emerald-400" />
            <span className="text-[9px] font-bold uppercase tracking-widest theme-text-muted">
              Harvest
            </span>
          </button>
        </div>
      </div>

      {/* RIGHT CLUSTER: The Resource Stream */}
      <div className="flex-1 flex overflow-x-auto scrollbar-none pb-3 xl:pb-0 -mx-5 px-5 sm:mx-0 sm:px-0">
        <div
          className={`flex items-center w-max font-sans transition-all duration-300 ${
            isCompact ? "gap-1.5 sm:gap-3 md:gap-4" : "gap-2 sm:gap-4 md:gap-6"
          }`}
        >
          {resourcesList.map((res) => {
            const unlocked =
              res.id === "catnip" ||
              store.unlocks[res.id as keyof typeof store.unlocks];
            if (!unlocked) return null;

            const cur = store.resources[res.id]?.amount ?? 0;
            const limit = store.resources[res.id]?.max ?? 0;
            const showLimit = limit > 0;
            const percent = getPercent(cur, limit);

            return (
              <div
                key={res.id}
                className={`flex flex-col shrink-0 transition-all duration-300 ${
                  isCompact
                    ? "gap-0.5 w-[75px] sm:w-[108px] xl:w-[114px]"
                    : "gap-1 w-[80px] sm:w-[124px] xl:w-[130px]"
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <div
                    className={`rounded-lg theme-bg-card border theme-border backdrop-blur-md shrink-0 transition-all duration-300 ${
                      isCompact ? "p-0.5 sm:p-1" : "p-1 sm:p-1.5"
                    }`}
                  >
                    {getResourceIcon(res.id)}
                  </div>
                  <div className="flex flex-col col-span-2 min-w-0">
                    <span
                      className={`font-bold uppercase tracking-wider theme-text-sec leading-none truncate max-w-[80px] hidden sm:block ${
                        isCompact ? "text-[9px]" : "text-[10px]"
                      }`}
                    >
                      {res.label}
                    </span>
                    <span
                      className={
                        getRateColor(res.rate) +
                        ` mt-0.5 leading-none font-mono ${
                          isCompact
                            ? "text-[8px] sm:text-[8px]"
                            : "text-[8px] sm:text-[9px]"
                        }`
                      }
                    >
                      {res.rate >= 0 ? "+" : ""}
                      {res.rate.toFixed(1)}
                      <span className="hidden sm:inline">/s</span>
                    </span>
                  </div>
                </div>

                <div className="mt-0.5 sm:mt-1">
                  <div className="flex items-baseline sm:items-end justify-between font-mono mb-0.5 sm:mb-1">
                    <span
                      className={`font-bold theme-text-main leading-none transition-all duration-300 ${
                        isCompact
                          ? "text-xs sm:text-xs xl:text-sm"
                          : "text-xs sm:text-sm xl:text-base"
                      }`}
                    >
                      {formatNumber(cur)}
                    </span>
                    {showLimit && (
                      <span
                        className={`theme-text-muted leading-none transition-all duration-300 ${
                          isCompact
                            ? "text-xs sm:text-xs xl:text-sm"
                            : "text-xs sm:text-sm xl:text-base"
                        }`}
                      >
                        /{formatNumber(limit)}
                      </span>
                    )}
                  </div>

                  {showLimit && (
                    <div className="w-full h-0.5 theme-bg-hover rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          percent >= 100
                            ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                            : percent >= 90
                              ? "bg-amber-300/80"
                              : "theme-bg-main bg-neutral-400"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
