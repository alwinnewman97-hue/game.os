import React, { useState } from 'react';
import { GameState, BuildingType, ResourceType } from '../types';
import { BUILDINGS } from '../gameData';
import { calculateCost } from '../store/useGameStore';
import { playClickSound } from '../utils/audio';
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
  Gauge 
} from 'lucide-react';

interface BonfireTabProps {
  store: GameState;
}

type TabFilter = 'all' | 'production' | 'storage' | 'residential' | 'scientific';

export default function BonfireTab({ store }: BonfireTabProps) {
  const [selectedSubTab, setSelectedSubTab] = useState<TabFilter>('all');

  const handleBuild = (id: BuildingType) => {
    store.buyBuilding(id, store.buyMultiplier || 1);
    if (store.soundEnabled) playClickSound('build');
  };

  const resourceLabelMap: Record<string, string> = {
    catnip: 'Mega Seeds',
    wood: 'Plutonium',
    minerals: 'Crystals',
    iron: 'Neutrium',
    science: 'Portal Tech',
    culture: 'Schwifty Vibes',
    beam: 'Nano-Beam',
    slab: 'Hyper-Slab',
    plate: 'Neutrium Plate',
    parchment: 'Portal Formula'
  };

  // Human-friendly specs description generator to enrich the UI cards
  const getBuildingBenefits = (id: BuildingType): string => {
    switch (id) {
      case 'catnipField': return '+0.63 Mega-Seeds/sec per Greenhouse';
      case 'aqueduct': return '+25% passive Mega-Seed irrigation boost';
      case 'pasture': return '-0.15% Morty Seed consumption rate (Calming)';
      case 'hut': return '+2 Morty maximum clone limit';
      case 'logHouse': return '+1 Morty capacity (Dorm Room)';
      case 'barn': return 'Expands containment cap for key ores and fuel';
      case 'warehouse': return 'Sub-atomic compressing vault (Large Capacity)';
      case 'library': return '+250 Technology storage limit';
      case 'academy': return '+1,000 Tech limit & +20% Scholar speed';
      case 'mine': return '+0.05 Crystals/sec passive harvest';
      case 'smelter': return 'Processes Crystals & Plutonium into Neutrium';
      case 'amphitheatre': return '+4% Happiness & decreases existential dread';
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
      default: return { color: 'text-[#39ff14]', border: 'border-white/10', bg: 'bg-white/5', label: 'All Units' };
    }
  };

  const categories = [
    { id: 'all' as TabFilter, name: 'All Schematics', icon: LayoutGrid },
    { id: 'production' as TabFilter, name: 'Production', icon: Sprout },
    { id: 'storage' as TabFilter, name: 'Storage', icon: Database },
    { id: 'residential' as TabFilter, name: 'Dwellings', icon: Home },
    { id: 'scientific' as TabFilter, name: 'Tech', icon: Atom },
  ];

  return (
    <div className="flex flex-col flex-1 pb-10">
      
      {/* Sleek Sub-Tab Filter Bar */}
      <div className="flex flex-wrap items-center gap-1 mb-6 p-1 bg-black/40 border border-white/5 rounded-xl">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedSubTab === cat.id;
          
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedSubTab(cat.id);
                if (store.soundEnabled) playClickSound('click');
              }}
              className={`flex-1 min-w-[90px] py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all text-2xs uppercase tracking-wider cursor-pointer font-bold ${
                isActive 
                  ? 'bg-neutral-900 border border-white/10 text-white shadow-sm' 
                  : 'text-neutral-500 hover:text-neutral-300 border border-transparent'
              }`}
            >
              <Icon size={12} className={isActive ? 'text-[#39ff14]' : 'text-neutral-500'} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* SECURE SCHEMATICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          // Category filter
          if (selectedSubTab !== 'all' && b.category !== selectedSubTab) return null;

          const count = store.buildings[id] || 0;
          const multiplier = store.buyMultiplier || 1;
          const cardTheme = getCategoryTheme(b.category);

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
                className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                  isAffordable 
                    ? 'bg-neutral-900/40 text-[#39ff14] border-emerald-950/40' 
                    : 'bg-red-950/10 text-red-400 border-red-900/20'
                }`}
              >
                <span className="text-neutral-500">{resourceLabelMap[res] || res}:</span>
                <span className="font-bold">{Math.ceil(totalCost).toLocaleString()}</span>
              </span>
            );
          });

          return (
            <div 
              key={id}
              className={`p-5 flex flex-col justify-between gap-4 transition-all duration-350 border rounded-xl bg-neutral-950/20 backdrop-blur-sm relative ${
                canAfford 
                  ? 'border-neutral-900 hover:border-neutral-700/65 shadow-sm' 
                  : 'border-white/5 opacity-70'
              }`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm sm:text-base text-white tracking-wide">
                      {b.name}
                    </h4>
                    {count > 0 && (
                      <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-neutral-900 text-[#39ff14] border border-emerald-900/30 rounded">
                        x{count}
                      </span>
                    )}
                  </div>
                  <span className={`text-[8px] font-mono px-2 rounded uppercase font-bold tracking-wider ${cardTheme.color} ${cardTheme.bg}`}>
                    {cardTheme.label}
                  </span>
                </div>

                <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                  {b.desc}
                </p>

                {/* Calibrated Benefits Pill */}
                <div className="mt-1 flex items-center gap-1 text-[10px] text-neutral-300 font-mono">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                  <span>Benefit: {getBuildingBenefits(id)}</span>
                </div>
              </div>

              {/* FOOTER: COSTS & ACTION */}
              <div className="flex flex-col gap-3 pt-3 border-t border-white/[0.03]">
                <div className="flex flex-wrap gap-1">
                  {costsList}
                </div>

                <button
                  onClick={() => handleBuild(id)}
                  disabled={!canAfford}
                  className={`w-full py-2 text-2xs uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 rounded-lg transition-all cursor-pointer ${
                    canAfford 
                      ? 'bg-white text-black hover:bg-neutral-100 font-extrabold shadow-sm' 
                      : 'bg-white/5 border border-white/5 text-white/20 disabled:cursor-not-allowed font-medium'
                  }`}
                >
                  <Plus size={12} />
                  <span>Schematic {multiplier > 1 ? `x${multiplier}` : ''}</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

