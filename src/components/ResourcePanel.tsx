import React from "react";
import { GameState, ResourceType } from "../types";
import {
  Leaf,
  Zap,
  Gem,
  Anchor,
  FlaskConical,
  Flame,
  Atom,
} from "lucide-react";

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
        return <Leaf size={15} className="text-emerald-400 shrink-0" />;
      case "wood":
        return <Zap size={15} className="text-amber-400 shrink-0" />;
      case "minerals":
        return <Gem size={15} className="text-cyan-400 shrink-0" />;
      case "iron":
        return <Anchor size={15} className="text-slate-300 shrink-0" />;
      case "science":
        return <FlaskConical size={15} className="text-purple-400 shrink-0" />;
      case "culture":
        return <Flame size={15} className="text-pink-400 shrink-0" />;
      case "darkMatter":
        return <Atom size={15} className="text-indigo-400 shrink-0" />;
      case "portalFluid":
        return <FlaskConical size={15} className="text-emerald-400 shrink-0" />;
      case "flurbo":
        return <Gem size={15} className="text-yellow-400 shrink-0" />;
      default:
        return null;
    }
  };

  const getRateColor = (rate: number) => {
    if (rate > 0) return "text-emerald-400 font-semibold";
    if (rate < 0) return "text-red-400 font-bold animate-pulse";
    return "text-neutral-400 dark:text-neutral-500";
  };

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

  const unlockedResources = resourcesList.filter(
    (res) => res.id === "catnip" || store.unlocks[res.id as keyof typeof store.unlocks]
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-col gap-2 md:gap-2.5 w-full">
      {unlockedResources.map((res) => {
        const cur = store.resources[res.id]?.amount ?? 0;
        const limit = store.resources[res.id]?.max ?? 0;
        const showLimit = limit > 0;
        const percent = getPercent(cur, limit);

        return (
          <div
            key={res.id}
            className="flex flex-col justify-between w-full bg-neutral-100/80 dark:bg-neutral-900/60 rounded-xl p-2.5 md:p-3 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm backdrop-blur-md transition-all duration-200"
          >
            {/* Top Row: Icon + Label, and Amount/Max */}
            <div className="flex items-start justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="rounded-lg bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 shrink-0 p-1.5 flex items-center justify-center">
                  {getResourceIcon(res.id)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-extrabold uppercase text-[10px] md:text-[11px] text-neutral-800 dark:text-neutral-200 tracking-wider truncate leading-tight">
                    {res.id === "catnip" ? "Seeds" : res.id === "wood" ? "Pluto" : res.id === "science" ? "Tech" : res.id === "culture" ? "Vibes" : res.label}
                  </span>
                  <span className={`${getRateColor(res.rate)} text-[9px] md:text-[10px] font-mono leading-none mt-1`}>
                    {res.rate >= 0 ? "+" : ""}{res.rate.toFixed(1)}/s
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0">
                <span className="text-xs sm:text-sm font-black text-neutral-900 dark:text-white font-mono tabular-nums leading-none">
                  {formatNumber(cur)}
                </span>
                {showLimit && (
                  <span className="text-[8px] md:text-[9.5px] font-bold text-neutral-500 dark:text-neutral-400 font-mono uppercase leading-none mt-1">
                    / {formatNumber(limit)}
                  </span>
                )}
              </div>
            </div>

            {/* Micro progress bar for limited resources */}
            {showLimit && (
              <div className="w-full h-1 md:h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden relative border border-neutral-300/30 dark:border-neutral-700/30 mt-2">
                <div
                  className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
