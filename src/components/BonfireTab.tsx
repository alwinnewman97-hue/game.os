import React, { useState } from 'react';
import { GameState, BuildingType, ResourceType } from '../types';
import { BUILDINGS } from '../gameData';
import { calculateCost } from '../store/useGameStore';
import { playClickSound, triggerHaptic } from '../utils/audio';
import { 
  LayoutGrid, 
  Sprout, 
  Database, 
  Home, 
  Atom, 
  Plus, 
  Sparkle, 
  TrendingUp, 
  ShieldAlert, 
  Activity, 
  Gauge,
  ChevronDown,
  Info,
  Zap
} from 'lucide-react';

interface BonfireTabProps {
  store: GameState;
}

type TabFilter = 'all' | 'production' | 'storage' | 'residential' | 'scientific';

export default function BonfireTab({ store }: BonfireTabProps) {
  const [selectedSubTab, setSelectedSubTab] = useState<TabFilter>('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openInfo, setOpenInfo] = useState<Record<string, boolean>>({});
  const isCompact = store.density === 'compact';

  const handleBuild = (id: BuildingType) => {
    store.buyBuilding(id, store.buyMultiplier || 1);
    triggerHaptic('build');
    if (store.soundEnabled) playClickSound('build');
  };

  const resourceLabelMap: Record<string, string> = {
    catnip: 'Mega Seeds',
    wood: 'Plutonium',
    minerals: 'Crystals',
    iron: 'Neutrium',
    science: 'Portal Tech',
    culture: 'Schwifty Vibes',
    darkMatter: 'Dark Matter',
    portalFluid: 'Portal Fluid'
  };

  // Human-friendly specs description generator to enrich the UI cards
  const getBuildingBenefits = (id: BuildingType): string => {
    switch (id) {
      case 'catnipField': return '+0.63 Mega-Seeds/sec per Greenhouse';
      case 'aqueduct': return '+25% passive Mega-Seed irrigation boost';
      case 'pasture': return '-0.15% Morty Seed consumption rate (Calming)';
      case 'hut': return '+2 Morty maximum clone limit';
      case 'logHouse': return '+1 Morty capacity (Dorm Room)';
      case 'mansion': return '+4 Morty capacity (Luxury Quarters)';
      case 'barn': return 'Expands containment cap for key ores and fuel';
      case 'warehouse': return 'Sub-atomic compressing vault (Large Capacity)';
      case 'library': return '+250 Technology storage limit';
      case 'academy': return '+1,000 Tech limit & +20% Scholar speed';
      case 'mine': return '+0.05 Crystals/sec passive harvest';
      case 'smelter': return 'Processes Crystals & Plutonium into Neutrium';
      case 'amphitheatre': return '+4% Happiness & decreases existential dread';
      case 'darkMatterExtractor': return 'Extracts volatile dark matter';
      case 'cloningVat': return '+50 Morty capacity';
      case 'portalGenerator': return 'Generates pure portal fluid';
      default: return 'Provides localized efficiency improvements.';
    }
  };

  // Helper icons for categories
  const getCategoryTheme = (cat: TabFilter) => {
    switch (cat) {
      case 'production': return { color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', label: 'Incubators' };
      case 'storage': return { color: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/5', label: 'Containment' };
      case 'residential': return { color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/5', label: 'Clones' };
      case 'scientific': return { color: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/5', label: 'Cybernetics' };
      default: return { color: 'text-[#39ff14]', border: 'theme-border', bg: 'theme-bg-hover', label: 'All Units' };
    }
  };

  const categories = [
    { id: 'all' as TabFilter, name: 'All Schematics', icon: LayoutGrid },
    { id: 'production' as TabFilter, name: 'Production', icon: Sprout },
    { id: 'storage' as TabFilter, name: 'Storage', icon: Database },
    { id: 'residential' as TabFilter, name: 'Dwellings', icon: Home },
    { id: 'scientific' as TabFilter, name: 'Tech', icon: Atom },
  ];

  const currentCategory = categories.find(cat => cat.id === selectedSubTab) || categories[0];
  const CurrentIcon = currentCategory.icon;

  return (
    <div className="flex flex-col flex-1 pb-10">
      
      {/* Sleek Sub-Tab Filter Dropdown */}
      <div className="relative mb-6 z-30">
        <button
          id="schematic-category-dropdown"
          onClick={() => {
            setDropdownOpen(!dropdownOpen);
            triggerHaptic('click');
            if (store.soundEnabled) playClickSound('click');
          }}
          className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl border theme-border theme-bg-card font-sans font-black text-2xs uppercase tracking-widest cursor-pointer shadow-md select-none hover:bg-[var(--bg-hover)] transition-all"
        >
          <div className="flex items-center gap-3">
            <CurrentIcon size={14} className="theme-text-sec animate-pulse" />
            <span className="theme-text-sec font-black">
              {currentCategory.name}
            </span>
          </div>
          <ChevronDown 
            size={14} 
            className={`theme-text-muted transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {/* Dropdown Options Box */}
        {dropdownOpen && (
          <>
            {/* Click outside backdrop to auto-close */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setDropdownOpen(false)} 
            />
            <div className="absolute left-0 right-0 mt-1.5 z-20 rounded-xl border theme-border theme-bg-panel p-1.5 shadow-2xl flex flex-col gap-1 backdrop-blur-md">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedSubTab === cat.id;
                
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedSubTab(cat.id);
                      setDropdownOpen(false);
                      triggerHaptic('click');
                      if (store.soundEnabled) playClickSound('click');
                    }}
                    className={`w-full py-2.5 px-3 rounded-lg flex items-center gap-3 transition-all text-2xs uppercase tracking-wider cursor-pointer font-bold select-none text-left ${
                      isActive 
                        ? 'theme-bg-card border theme-border theme-text-sec' 
                        : 'theme-text-muted hover:theme-text-sec hover:theme-bg-app dark:hover:theme-bg-hover border border-transparent'
                    }`}
                  >
                    <Icon size={12} className={isActive ? 'theme-text-sec' : 'theme-text-muted'} />
                    <span className={isActive ? 'theme-text-main font-black' : ''}>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* SECURE SCHEMATICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
        {(Object.entries(BUILDINGS) as [BuildingType, typeof BUILDINGS[BuildingType]][]).map(([id, b]) => {
          // Pre-requisites checks for tidy, progressive disclosure
          if (id === 'aqueduct' && !store.researched.agriculture) return null;
          if (id === 'pasture' && !store.unlocks.wood) return null;
          if (id === 'hut' && !store.unlocks.wood) return null;
          if (id === 'logHouse' && !store.researched.woodworking) return null;
          if (id === 'mansion' && !store.researched.theology) return null;
          if (id === 'barn' && !store.unlocks.wood) return null;
          if (id === 'warehouse' && !store.unlocks.minerals) return null;
          if (id === 'library' && !store.unlocks.wood) return null;
          if (id === 'academy' && !store.researched.writing) return null;
          if (id === 'mine' && !store.researched.mining) return null;
          if (id === 'smelter' && !store.researched.metalworking) return null;
          if (id === 'amphitheatre' && !store.researched.theology) return null;
          if (id === 'darkMatterExtractor' && !store.researched.darkMatterPhysics) return null;
          if (id === 'cloningVat' && !store.researched.darkMatterPhysics) return null;
          if (id === 'portalGenerator' && !store.researched.fluidDynamics) return null;

          // Category filter
          if (selectedSubTab !== 'all' && b.category !== selectedSubTab) return null;

          const count = store.buildings[id] || 0;
          const isMaxMultiplier = store.buyMultiplier === 'max';
          const multiplier = isMaxMultiplier ? 1 : (store.buyMultiplier as number || 1);
          const cardTheme = getCategoryTheme(b.category);

          // Evaluate Cost affordability
          let canAfford = true;
          const isMaxed = b.maxLimit !== undefined && count >= b.maxLimit;
          const exceedsLimit = !isMaxMultiplier && b.maxLimit !== undefined && count + multiplier > b.maxLimit;

          if (isMaxed || exceedsLimit) {
            canAfford = false;
          }

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
                className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                  isAffordable 
                    ? 'theme-bg-card text-[#39ff14] border-emerald-950/40' 
                    : 'bg-red-950/10 text-red-400 border-red-900/20'
                }`}
              >
                <span className="theme-text-muted">{resourceLabelMap[res] || res}:</span>
                <span className="font-bold">{Math.ceil(totalCost).toLocaleString()}</span>
              </span>
            );
          });

          return (
            <div 
              key={id}
              className={`flex flex-col justify-between transition-all duration-300 border rounded-lg sm:rounded-xl theme-bg-panel backdrop-blur-sm relative ${
                isCompact ? 'p-2 sm:p-3.5 gap-2 sm:gap-2.5' : 'p-3 sm:p-5 gap-2 sm:gap-4'
              } ${
                canAfford 
                  ? 'border-neutral-900 hover:theme-border/65 shadow-sm' 
                  : 'theme-border opacity-70'
              }`}
            >
              <div className={`flex flex-col ${isCompact ? 'gap-1' : 'gap-2'}`}>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className={`font-bold theme-text-main tracking-wide transition-all ${
                      isCompact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
                    }`}>
                      {b.name}
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenInfo(prev => ({ ...prev, [id]: !prev[id] }));
                        triggerHaptic('click');
                      }}
                      className="p-1 rounded-full text-cyan-400 hover:text-cyan-300 hover:bg-white/5 transition-all cursor-pointer inline-flex items-center justify-center shrink-0"
                      title="View description"
                    >
                      <Info size={11} />
                    </button>
                    {count > 0 && (
                      <span className={`font-mono font-bold theme-bg-card text-[#39ff14] border border-emerald-900/30 rounded ${
                        isCompact ? 'px-1 py-0.1 text-[8px]' : 'px-1.5 py-0.2 text-[9px]'
                      }`}>
                        x{count}{b.maxLimit !== undefined ? ` / ${b.maxLimit}` : ''}
                      </span>
                    )}
                    {count === 0 && b.maxLimit !== undefined && (
                      <span className={`font-mono font-bold theme-bg-card theme-text-muted border border-neutral-900/50 rounded ${
                        isCompact ? 'px-1 py-0.1 text-[8px]' : 'px-1.5 py-0.2 text-[9px]'
                      }`}>
                        0 / {b.maxLimit}
                      </span>
                    )}
                  </div>
                  <span className={`font-mono rounded uppercase font-bold tracking-wider shrink-0 ${
                    isCompact ? 'text-[7px] px-1.5 py-0.5' : 'text-[8px] px-2'
                  } ${cardTheme.color} ${cardTheme.bg}`}>
                    {cardTheme.label}
                  </span>
                </div>

                {(!isCompact || openInfo[id]) && (
                  <p className={`theme-text-muted font-sans leading-relaxed transition-all ${
                    isCompact ? 'text-[11px] leading-snug mt-0.5' : 'text-xs'
                  }`}>
                    {b.desc}
                  </p>
                )}

                {/* Calibrated Benefits Pill */}
                <div className={`flex items-center gap-1 theme-text-sec font-mono transition-all ${
                  isCompact ? 'mt-0.5 text-[9px]' : 'mt-1 text-[10px]'
                }`}>
                  <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                  <span>Benefit: {getBuildingBenefits(id)}</span>
                </div>
              </div>

              {/* FOOTER: COSTS & ACTION */}
              <div className={`flex flex-col border-t border-white/[0.03] transition-all duration-300 ${
                isCompact ? 'gap-2 pt-2' : 'gap-3 pt-3'
              }`}>
                <div className="flex flex-wrap gap-1">
                  {costsList}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleBuild(id)}
                    disabled={!canAfford && (isMaxed || exceedsLimit || !canAfford)}
                    className={`flex-1 uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 rounded-lg transition-all cursor-pointer ${
                      isCompact ? 'py-1.5 text-[10px]' : 'py-2 text-2xs'
                    } ${
                      canAfford 
                        ? 'theme-accent-bg hover:opacity-90 font-extrabold shadow-sm' 
                        : 'theme-bg-hover border theme-border theme-text-muted disabled:cursor-not-allowed font-medium'
                    }`}
                  >
                    <Plus size={12} />
                    <span>{isMaxed ? 'MAX CAPACITY' : exceedsLimit ? 'EXCEEDS CAPACITY' : `Schematic ${multiplier > 1 ? `x${multiplier}` : ''}`}</span>
                  </button>

                  {/* Auto-Build Toggle integration on building card */}
                  {store.unlocks.wood && (id === 'pasture' || id === 'barn' || (id === 'catnipField' && store.researched.agriculture)) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        store.toggleAutoBuild(id as 'pasture' | 'barn' | 'catnipField');
                        triggerHaptic('click');
                      }}
                      className={`px-3 flex items-center justify-center gap-1 rounded-lg border transition-all cursor-pointer text-[10px] font-bold uppercase tracking-widest ${
                        store.autoBuild?.[id as 'pasture' | 'barn' | 'catnipField']
                          ? 'border-[#39ff14]/30 bg-[#39ff14]/10 text-[#39ff14]'
                          : 'border-white/[0.05] theme-bg-hover theme-text-muted hover:theme-text-sec'
                      }`}
                      title={`Toggle Auto-Build for ${b.name}`}
                    >
                      <Zap size={11} className={store.autoBuild?.[id as 'pasture' | 'barn' | 'catnipField'] ? 'animate-pulse text-[#39ff14]' : ''} />
                      <span className="text-[9px]">AUTO</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

