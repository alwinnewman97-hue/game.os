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

  const RESOURCE_THEMES: Record<ResourceType, {
    iconColor: string;
    bgClass: string;
    darkBgClass: string;
    borderClass: string;
    darkBorderClass: string;
    barColor: string;
    accentBorder: string;
    accentBg: string;
  }> = {
    catnip: {
      iconColor: "text-emerald-500 dark:text-emerald-400",
      bgClass: "bg-emerald-500/10",
      darkBgClass: "dark:bg-emerald-500/15",
      borderClass: "border-emerald-500/20",
      darkBorderClass: "dark:border-emerald-500/10",
      barColor: "bg-emerald-500 dark:bg-emerald-400",
      accentBorder: "border-l-emerald-500 dark:border-l-emerald-400",
      accentBg: "hover:bg-emerald-500/[0.01] dark:hover:bg-emerald-400/[0.01]",
    },
    wood: {
      iconColor: "text-amber-500 dark:text-amber-400",
      bgClass: "bg-amber-500/10",
      darkBgClass: "dark:bg-amber-500/15",
      borderClass: "border-amber-500/20",
      darkBorderClass: "dark:border-amber-500/10",
      barColor: "bg-amber-500 dark:bg-amber-400",
      accentBorder: "border-l-amber-500 dark:border-l-amber-400",
      accentBg: "hover:bg-amber-500/[0.01] dark:hover:bg-amber-400/[0.01]",
    },
    minerals: {
      iconColor: "text-cyan-500 dark:text-cyan-400",
      bgClass: "bg-cyan-500/10",
      darkBgClass: "dark:bg-cyan-500/15",
      borderClass: "border-cyan-500/20",
      darkBorderClass: "dark:border-cyan-500/10",
      barColor: "bg-cyan-500 dark:bg-cyan-400",
      accentBorder: "border-l-cyan-500 dark:border-l-cyan-400",
      accentBg: "hover:bg-cyan-500/[0.01] dark:hover:bg-cyan-400/[0.01]",
    },
    iron: {
      iconColor: "text-slate-500 dark:text-slate-300",
      bgClass: "bg-slate-500/10",
      darkBgClass: "dark:bg-slate-500/15",
      borderClass: "border-slate-500/20",
      darkBorderClass: "dark:border-slate-500/10",
      barColor: "bg-slate-500 dark:bg-slate-300",
      accentBorder: "border-l-slate-400 dark:border-l-slate-400",
      accentBg: "hover:bg-slate-500/[0.01] dark:hover:bg-slate-400/[0.01]",
    },
    science: {
      iconColor: "text-purple-500 dark:text-purple-400",
      bgClass: "bg-purple-500/10",
      darkBgClass: "dark:bg-purple-500/15",
      borderClass: "border-purple-500/20",
      darkBorderClass: "dark:border-purple-500/10",
      barColor: "bg-purple-500 dark:bg-purple-400",
      accentBorder: "border-l-purple-500 dark:border-l-purple-400",
      accentBg: "hover:bg-purple-500/[0.01] dark:hover:bg-purple-400/[0.01]",
    },
    culture: {
      iconColor: "text-rose-500 dark:text-rose-400",
      bgClass: "bg-rose-500/10",
      darkBgClass: "dark:bg-rose-500/15",
      borderClass: "border-rose-500/20",
      darkBorderClass: "dark:border-rose-500/10",
      barColor: "bg-rose-500 dark:bg-rose-400",
      accentBorder: "border-l-rose-500 dark:border-l-rose-400",
      accentBg: "hover:bg-rose-500/[0.01] dark:hover:bg-rose-400/[0.01]",
    },
    darkMatter: {
      iconColor: "text-indigo-500 dark:text-indigo-400",
      bgClass: "bg-indigo-500/10",
      darkBgClass: "dark:bg-indigo-500/15",
      borderClass: "border-indigo-500/20",
      darkBorderClass: "dark:border-indigo-500/10",
      barColor: "bg-indigo-500 dark:bg-indigo-400",
      accentBorder: "border-l-indigo-500 dark:border-l-indigo-400",
      accentBg: "hover:bg-indigo-500/[0.01] dark:hover:bg-indigo-400/[0.01]",
    },
    portalFluid: {
      iconColor: "text-teal-500 dark:text-teal-400",
      bgClass: "bg-teal-500/10",
      darkBgClass: "dark:bg-teal-500/15",
      borderClass: "border-teal-500/20",
      darkBorderClass: "dark:border-teal-500/10",
      barColor: "bg-teal-500 dark:bg-teal-400",
      accentBorder: "border-l-teal-500 dark:border-l-teal-400",
      accentBg: "hover:bg-teal-500/[0.01] dark:hover:bg-teal-400/[0.01]",
    },
    flurbo: {
      iconColor: "text-yellow-500 dark:text-yellow-400",
      bgClass: "bg-yellow-500/10",
      darkBgClass: "dark:bg-yellow-500/15",
      borderClass: "border-yellow-500/20",
      darkBorderClass: "dark:border-yellow-500/10",
      barColor: "bg-yellow-500 dark:bg-yellow-400",
      accentBorder: "border-l-yellow-500 dark:border-l-yellow-400",
      accentBg: "hover:bg-yellow-500/[0.01] dark:hover:bg-yellow-400/[0.01]",
    },
  };

  const getResourceIcon = (res: ResourceType, className: string) => {
    const defaultClass = `${className} shrink-0`;
    switch (res) {
      case "catnip":
        return <Leaf size={14} className={defaultClass} />;
      case "wood":
        return <Zap size={14} className={defaultClass} />;
      case "minerals":
        return <Gem size={14} className={defaultClass} />;
      case "iron":
        return <Anchor size={14} className={defaultClass} />;
      case "science":
        return <FlaskConical size={14} className={defaultClass} />;
      case "culture":
        return <Flame size={14} className={defaultClass} />;
      case "darkMatter":
        return <Atom size={14} className={defaultClass} />;
      case "portalFluid":
        return <FlaskConical size={14} className={defaultClass} />;
      case "flurbo":
        return <Gem size={14} className={defaultClass} />;
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
    <div className="grid grid-cols-2 md:flex md:flex-col gap-2 md:gap-2.5 w-full">
      {unlockedResources.map((res) => {
        const cur = store.resources[res.id]?.amount ?? 0;
        const limit = store.resources[res.id]?.max ?? 0;
        const showLimit = limit > 0;
        const percent = getPercent(cur, limit);
        const theme = RESOURCE_THEMES[res.id] || RESOURCE_THEMES.catnip;

        return (
          <div
            key={res.id}
            className={`flex flex-col justify-between w-full bg-neutral-100/80 dark:bg-neutral-900/60 rounded-xl p-2.5 md:p-3 border border-neutral-200/80 dark:border-neutral-800/80 border-l-[3px] ${theme.accentBorder} ${theme.accentBg} shadow-sm backdrop-blur-md transition-all duration-200`}
          >
            {/* Vertically stacked resource content */}
            <div className="flex flex-col gap-1.5 min-w-0 w-full">
              {/* Row 1: Icon & Name */}
              <div className="flex items-center gap-2 min-w-0">
                <div className={`rounded-lg ${theme.bgClass} ${theme.darkBgClass} border ${theme.borderClass} ${theme.darkBorderClass} shrink-0 p-1 flex items-center justify-center`}>
                  {getResourceIcon(res.id, theme.iconColor)}
                </div>
                <span className="font-extrabold uppercase text-[10px] md:text-[11px] text-neutral-800 dark:text-neutral-200 tracking-wider truncate leading-tight">
                  {res.id === "catnip" ? "Seeds" : res.id === "wood" ? "Pluto" : res.id === "science" ? "Tech" : res.id === "culture" ? "Vibes" : res.label}
                </span>
              </div>

              {/* Row 2: Amount / Limit and Rate */}
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span className="text-xs sm:text-sm font-black text-neutral-900 dark:text-white font-mono tabular-nums leading-none">
                    {formatNumber(cur)}
                  </span>
                  {showLimit && (
                    <span className="text-[8.5px] md:text-[9.5px] font-bold text-neutral-500 dark:text-neutral-400 font-mono uppercase leading-none">
                      / {formatNumber(limit)}
                    </span>
                  )}
                </div>
                <span className={`${getRateColor(res.rate)} text-[9px] md:text-[10px] font-mono leading-none`}>
                  {res.rate >= 0 ? "+" : ""}{res.rate.toFixed(1)}/s
                </span>
              </div>
            </div>

            {/* Micro progress bar for limited resources */}
            {showLimit && (
              <div className="w-full h-1 md:h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden relative border border-neutral-300/30 dark:border-neutral-700/30 mt-2">
                <div
                  className={`h-full ${theme.barColor} rounded-full transition-all duration-300`}
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
