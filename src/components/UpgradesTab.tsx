import React, { useState } from 'react';
import { GameState, UpgradeType, ResourceType } from '../types';
import { UPGRADES } from '../gameData';
import { playClickSound, triggerHaptic } from '../utils/audio';
import { CERTIFICATES } from '../store/useGameStore';
import { 
  Hammer, 
  Settings, 
  Check, 
  ArrowRight, 
  Layers, 
  Milestone, 
  Scroll, 
  PackageCheck,
  Sparkles,
  Clock,
  Zap,
  Award,
  Info
} from 'lucide-react';

interface UpgradesTabProps {
  store: GameState;
}

export default function UpgradesTab({ store }: UpgradesTabProps) {
  const [openInfo, setOpenInfo] = useState<Record<string, boolean>>({});
  const isCompact = store.density === 'compact';

  const handleBuyUpgrade = (id: UpgradeType) => {
    store.buyUpgrade(id);
    triggerHaptic('research');
    if (store.soundEnabled) playClickSound('upgrade');
  };

  const multiplier = store.buyMultiplier || 1;

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

  return (
    <div className="flex flex-col flex-1 pb-10">
      
      {/* SECTION HEADER */}
      <div className={`flex justify-between items-center border-b theme-border transition-all duration-300 ${
        isCompact ? 'pb-3 mx-2 mt-2 gap-2' : 'pb-6 mx-2 sm:mx-6 mt-4'
      }`}>
        <span className={`uppercase font-bold theme-text-muted tracking-widest leading-none ${
          isCompact ? 'text-[9px]' : 'text-[10px]'
        }`}>Permanent Upgrades</span>
      </div>

      <div className={`grid grid-cols-1 items-start transition-all duration-300 ${
        isCompact ? 'gap-4 mt-4 mx-2' : 'gap-6 mt-6 mx-2 sm:mx-6'
      }`}>
        
        {/* PERMANENT UPGRADES & SCHEMATICS */}
        <div className={`flex flex-col gap-4`}>
          <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 transition-all duration-300 ${
            isCompact ? 'gap-3' : 'gap-4'
          }`}>
            {(Object.entries(UPGRADES) as [UpgradeType, typeof UPGRADES[UpgradeType]][]).map(([id, u]) => {
              const isOwned = store.upgrades[id];

              if (id === 'ironAxes' && !store.upgrades.mineralAxes) return null;
              if (id === 'reinforcedBarns' && !store.researched.mining) return null;
              if (id === 'expandedStorage' && !store.researched.metalworking) return null;
              if (id === 'darkMatterContainment' && !store.researched.darkMatterPhysics) return null;
              if (id === 'fluidTanks' && !store.researched.fluidDynamics) return null;
              if (id === 'autoRefineWood' && !store.unlocks.workshop) return null;
              if (id === 'autoRefineMinerals' && !store.upgrades.autoRefineWood) return null;

              let canAfford = true;
              const costsList = Object.entries(u.cost).map(([res, costVal]) => {
                const isAffordable = store.resources[res as ResourceType]?.amount >= (costVal as number);
                if (!isAffordable) canAfford = false;
                return (
                  <span 
                    key={res} 
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                      isAffordable 
                        ? 'theme-bg-card text-[#39ff14] border-emerald-950/40' 
                        : 'bg-red-950/10 text-red-200 border-red-900/20'
                    }`}
                  >
                    <span className="theme-text-muted">{resourceLabelMap[res] || res}:</span>
                    <span className="font-bold">{(costVal as number).toLocaleString()}</span>
                  </span>
                );
              });

              return (
                <div 
                  key={id}
                  className={`flex flex-col justify-between transition-all duration-300 border rounded-xl theme-bg-panel backdrop-blur-sm relative ${
                    isCompact ? 'p-3.5 gap-2.5' : 'p-5 gap-4'
                  } ${
                    isOwned 
                      ? 'border-neutral-900/30 opacity-45' 
                      : canAfford 
                        ? 'border-neutral-900 hover:theme-border/65 shadow-sm' 
                        : 'theme-border opacity-70'
                  }`}
                >
                  <div className={`flex flex-col ${isCompact ? 'gap-1' : 'gap-2'}`}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className={`font-bold theme-text-main tracking-wide transition-all ${
                          isCompact ? 'text-xs sm:text-sm' : 'text-sm'
                        }`}>{u.name}</h4>
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
                      </div>
                      {isOwned && (
                        <span className="px-1.5 py-0.2 border border-emerald-500/10 text-[#39ff14]/80 text-[8px] uppercase tracking-wider font-bold rounded bg-emerald-500/5 font-sans">
                          Acquired
                        </span>
                      )}
                    </div>
                    
                    {(!isCompact || openInfo[id]) && u.desc && (
                      <p className={`theme-text-muted font-sans italic leading-relaxed transition-all ${
                        isCompact ? 'text-[10px] leading-snug' : 'text-xs'
                      }`}>{u.desc}</p>
                    )}

                    <p className={`text-emerald-400 font-mono transition-all ${
                      isCompact ? 'text-[11px] leading-snug' : 'text-xs'
                    }`}>{u.effectsDesc}</p>
                  </div>

                  {!isOwned && (
                    <div className={`flex flex-col border-t border-white/[0.03] transition-all duration-300 ${
                      isCompact ? 'gap-2 pt-2' : 'gap-3 pt-3'
                    }`}>
                      <div className="flex flex-wrap gap-1">
                        {costsList}
                      </div>

                      <button
                        onClick={() => handleBuyUpgrade(id)}
                        disabled={!canAfford}
                        className={`w-full uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 rounded-lg transition-all cursor-pointer ${
                          isCompact ? 'py-1.5 text-[10px]' : 'py-2 text-2xs'
                        } ${
                          canAfford 
                            ? 'theme-accent-bg hover:opacity-90 font-extrabold shadow-sm' 
                            : 'theme-bg-hover border theme-border theme-text-muted disabled:cursor-not-allowed font-medium'
                        }`}
                      >
                        Unlock Upgrade
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AUTO BUILD SYSTEM */}
      {store.unlocks.wood && (
        <div className="mt-8 mx-2 sm:mx-6 flex flex-col gap-4">
          <span className={`uppercase font-bold theme-text-muted tracking-widest leading-none block font-sans ${
             isCompact ? 'text-[9px]' : 'text-[10px]'
          }`}>Infrastructure Auto-Build</span>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* PASTURE AUTO BUILD */}
            <div className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
              store.autoBuild?.pasture ? 'border-[#39ff14]/30 bg-[#39ff14]/5' : 'theme-border theme-bg-panel'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl p-1.5 theme-bg-app rounded-lg">🛖</span>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold theme-text-main text-sm">Auto-Build Morty Play-Pen</span>
                  <span className="text-[10px] theme-text-muted max-w-[200px] leading-tight mt-1">
                    Automatically consume Mega Seeds and Plutonium to construct Morty Play-Pens when resources are available.
                  </span>
                </div>
              </div>
              <button 
                onClick={() => {
                  store.toggleAutoBuild('pasture');
                  if(store.soundEnabled) playClickSound('click');
                }}
                className={`px-4 py-2 font-bold uppercase tracking-wider text-[10px] rounded-lg transition-all cursor-pointer ${
                  store.autoBuild?.pasture ? 'bg-[#39ff14] text-black shadow-[0_0_10px_rgba(57,255,20,0.3)]' : 'theme-bg-hover theme-text-muted hover:theme-bg-panel'
                }`}
              >
                {store.autoBuild?.pasture ? 'ACTIVE' : 'INACTIVE'}
              </button>
            </div>

            {/* BARN AUTO BUILD */}
            <div className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
              store.autoBuild?.barn ? 'border-[#39ff14]/30 bg-[#39ff14]/5' : 'theme-border theme-bg-panel'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl p-1.5 theme-bg-app rounded-lg">📦</span>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold theme-text-main text-sm">Auto-Build Dimension Vault</span>
                  <span className="text-[10px] theme-text-muted max-w-[200px] leading-tight mt-1">
                    Automatically consumes Plutonium to construct Dimension Vaults when resources are available to increase storage.
                  </span>
                </div>
              </div>
              <button 
                onClick={() => {
                  store.toggleAutoBuild('barn');
                  if(store.soundEnabled) playClickSound('click');
                }}
                className={`px-4 py-2 font-bold uppercase tracking-wider text-[10px] rounded-lg transition-all cursor-pointer ${
                  store.autoBuild?.barn ? 'bg-[#39ff14] text-black shadow-[0_0_10px_rgba(57,255,20,0.3)]' : 'theme-bg-hover theme-text-muted hover:theme-bg-panel'
                }`}
              >
                {store.autoBuild?.barn ? 'ACTIVE' : 'INACTIVE'}
              </button>
            </div>

            {/* GREENHOUSE AUTO BUILD */}
            <div className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
              !store.researched.agriculture 
                ? 'opacity-60 bg-neutral-900/15 border-neutral-700/30' 
                : store.autoBuild?.catnipField 
                  ? 'border-[#39ff14]/30 bg-[#39ff14]/5' 
                  : 'theme-border theme-bg-panel'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl p-1.5 theme-bg-app rounded-lg">{store.researched.agriculture ? '🌱' : '🔒'}</span>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold theme-text-main text-sm">Auto-Build Mega-Seed Greenhouse</span>
                  <span className="text-[10px] theme-text-muted max-w-[200px] leading-tight mt-1">
                    {!store.researched.agriculture 
                      ? 'Requires Seed Bio-Cloning (Agriculture) Research to unlock.' 
                      : 'Automatically consume Mega Seeds to construct Mega-Seed Greenhouses when resources are available.'}
                  </span>
                </div>
              </div>
              <button 
                disabled={!store.researched.agriculture}
                onClick={() => {
                  store.toggleAutoBuild('catnipField');
                  if(store.soundEnabled) playClickSound('click');
                }}
                className={`px-4 py-2 font-bold uppercase tracking-wider text-[10px] rounded-lg transition-all ${
                  !store.researched.agriculture
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border theme-border'
                    : store.autoBuild?.catnipField 
                      ? 'bg-[#39ff14] text-black shadow-[0_0_10px_rgba(57,255,20,0.3)] cursor-pointer' 
                      : 'theme-bg-hover theme-text-muted hover:theme-bg-panel cursor-pointer'
                }`}
              >
                {!store.researched.agriculture ? 'LOCKED' : (store.autoBuild?.catnipField ? 'ACTIVE' : 'INACTIVE')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PORTAL SYNTHESIS & MORTY CERTIFICATES SECTION */}
      <div className="mt-12 pt-8 border-t theme-border mx-2 sm:mx-6 flex flex-col gap-6">
        
        {/* HEADER INFORMATION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-neural-500 tracking-widest leading-none">Space-Time Calibration</span>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight theme-text-main flex items-center gap-2">
              🌌 C-137 Portal Crafting Chamber
            </h3>
            <p className="text-xs theme-text-muted max-w-xl hidden sm:block">
              Synthesize interdimensional security permits, clone authorization forms, and sovereignty clearances. 
              These high-authority certificates grant a <strong>temporary stackable global production boost</strong> across all job workers.
            </p>
          </div>

          {/* ACTIVE MULTIPLIER READOUT */}
          {store.activeCertificates && store.activeCertificates.length > 0 && (
            <div className="px-5 py-3 border border-[#39ff14]/30 bg-[#39ff14]/5 rounded-xl flex items-center gap-3 shrink-0">
              <Zap className="h-5 w-5 text-[#39ff14] animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider theme-text-muted font-bold">Warp Multiplier</span>
                <span className="text-lg font-mono text-[#39ff14] font-bold leading-none">
                  +{Math.round((store.activeCertificates.reduce((acc, c) => acc + c.boostPercent, 0)) * 100)}% Speed
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ACTIVE MODULES MONITOR */}
        <div className="p-6 border theme-border theme-bg-card/40 backdrop-blur-md rounded-xl flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 theme-text-muted" />
            <span className="text-[10px] uppercase font-bold theme-text-muted tracking-widest leading-none">
              Active Synthesis Certificates ({store.activeCertificates?.length || 0})
            </span>
          </div>

          {!store.activeCertificates || store.activeCertificates.length === 0 ? (
            <div className="py-6 flex flex-col items-center justify-center text-center gap-2 border border-dashed theme-border rounded-lg">
              <span className="text-2xl">🟢</span>
              <span className="text-xs theme-text-muted">Portal fluids balanced. No active certificates boosting worker productivity.</span>
              <span className="text-[10px] theme-text-muted font-mono">Status: Awaiting Quantum Fusion</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {store.activeCertificates.map((cert) => {
                const percentLeft = Math.max(0, Math.min(100, (cert.timeRemaining / cert.totalDuration) * 100));
                const totalSecs = Math.ceil(cert.timeRemaining);
                const minutes = Math.floor(totalSecs / 60);
                const seconds = totalSecs % 60;
                
                return (
                  <div key={cert.id} className="p-4 border theme-border theme-bg-panel/50 rounded-lg flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs theme-text-main leading-tight truncate max-w-[150px]" title={cert.name}>
                          {cert.name}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold font-mono">
                          +{Math.round(cert.boostPercent * 100)}% Worker Speed
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold theme-text-muted shrink-0">
                        {minutes > 0 ? `${minutes}m ` : ''}{seconds}s
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full theme-bg-app h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${percentLeft}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SYNTHESIS LIST / CATALOG CARD GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(Object.entries(CERTIFICATES) as [string, typeof CERTIFICATES[string]][]).map(([id, def]) => {
            const currentCount = store.craftedCertificatesCount?.[id] || 0;
            
            // Check costs
            let canAfford = true;
            
            // science cost
            if (def.costs.science && store.resources.science.amount < def.costs.science) {
              canAfford = false;
            }

            // resources cost
            const resolvedCosts: { key: ResourceType; label: string; cost: number; icon: string }[] = [];
            if (def.costs.wood) resolvedCosts.push({ key: 'wood' as ResourceType, label: 'Plutonium', cost: def.costs.wood, icon: '⚡' });
            if (def.costs.minerals) resolvedCosts.push({ key: 'minerals' as ResourceType, label: 'Crystals', cost: def.costs.minerals, icon: '💎' });
            if (def.costs.iron) resolvedCosts.push({ key: 'iron' as ResourceType, label: 'Neutrium', cost: def.costs.iron, icon: '🛡️' });
            if (def.costs.culture) resolvedCosts.push({ key: 'culture' as ResourceType, label: 'Schwifty Vibes', cost: def.costs.culture, icon: '🎵' });

            const hasScienceCost = def.costs.science !== undefined;
            const scienceAffordable = hasScienceCost && store.resources.science.amount >= (def.costs.science || 0);

            resolvedCosts.forEach(costItem => {
              const userAmt = store.resources[costItem.key]?.amount || 0;
              if (userAmt < costItem.cost) {
                canAfford = false;
              }
            });

            // Unlock condition for portal crafting workshop items
            // Bronze is available if writing (formulas) is researched
            // Infinite is unlocked if the store has unlocked workshop and writing
            const isUnlocked = store.researched.writing;

            if (!isUnlocked) {
              return (
                <div key={id} className="p-6 border theme-border theme-bg-card flex flex-col items-center justify-center text-center gap-2 rounded-xl min-h-[220px]">
                  <span className="text-xl opacity-30">📦</span>
                  <span className="text-xs theme-text-muted font-bold uppercase tracking-widest">Formula locked</span>
                  <p className="text-[10px] theme-text-muted opacity-60 max-w-xs">
                    Research alternative writing formulas / blueprints in the Science tab to calibrate your quantum portal synthesizer.
                  </p>
                </div>
              );
            }

            return (
              <div 
                key={id}
                className={`p-6 border flex flex-col justify-between gap-6 transition-all duration-300 rounded-xl ${
                  canAfford 
                    ? 'border-[#39ff14]/30 theme-bg-app hover:border-[#39ff14] shadow-sm' 
                    : 'theme-border bg-transparent'
                }`}
              >
                <div className="flex flex-col gap-3">
                  
                  {/* Top line banner */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-1 theme-bg-card rounded-lg">
                        {id === 'bronze' ? '🟢' : id === 'silver' ? '🔵' : id === 'gold' ? '🟡' : '🟣'}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest text-[#39ff14] font-bold">Formula Blueprint</span>
                        <h4 className="text-base sm:text-lg font-bold theme-text-main tracking-wide leading-tight">
                          {def.name}
                        </h4>
                      </div>
                    </div>
                    {currentCount > 0 && (
                      <span className="text-[9px] uppercase font-mono font-bold theme-bg-hover px-2 py-1 theme-text-muted rounded-md shrink-0">
                        Synthed: {currentCount}
                      </span>
                    )}
                  </div>

                  {/* Desc text */}
                  <p className="text-xs theme-text-muted leading-relaxed hidden sm:block">
                    {def.desc}
                  </p>

                  <div className="py-2 px-3 theme-bg-panel border theme-border rounded-lg flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-wider theme-text-muted font-bold">Temporary Benefit:</span>
                    <span className="text-xs font-bold text-emerald-400">
                      +{Math.round(def.boostPercent * 100)}% For {def.duration / 60} min
                    </span>
                  </div>

                  {/* Requirements section */}
                  <div className="flex flex-col gap-2 mt-2">
                    <span className="text-[9px] uppercase font-bold theme-text-muted tracking-wider">Required Synthesis Materials</span>
                    <div className="flex flex-wrap gap-2">
                      
                      {/* Science tech cost if present */}
                      {hasScienceCost && (
                        <div className={`text-[10px] font-mono px-2 py-1 rounded-md border flex items-center gap-1.5 ${
                          scienceAffordable 
                            ? 'bg-emerald-500/5 text-emerald-300 border-emerald-500/10' 
                            : 'bg-red-500/5 text-red-400 border-red-500/10'
                        }`}>
                          <span>🛰️ Tech:</span>
                          <span>{Math.floor(store.resources.science.amount)}/{def.costs.science}</span>
                        </div>
                      )}

                      {/* Other resource costs */}
                      {resolvedCosts.map(item => {
                        const hasAmt = store.resources[item.key]?.amount || 0;
                        const isAffordable = hasAmt >= item.cost;
                        return (
                          <div 
                            key={item.key} 
                            className={`text-[10px] font-mono px-2 py-1 rounded-md border flex items-center gap-1.5 ${
                              isAffordable 
                                ? 'bg-emerald-500/5 text-emerald-300 border-emerald-500/10' 
                                : 'bg-red-500/5 text-red-400 border-red-500/10'
                            }`}
                          >
                            <span>{item.icon} {resourceLabelMap[item.key] || item.key}:</span>
                            <span>{Math.floor(hasAmt)}/{item.cost}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Synthesis Trigger Button */}
                <button
                  onClick={() => {
                    store.synthesizeCertificate(id as 'bronze' | 'silver' | 'gold' | 'infinite');
                    if (store.soundEnabled) playClickSound('upgrade');
                  }}
                  disabled={!canAfford}
                  className={`w-full py-3 text-2xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 rounded-lg cursor-pointer transition-all active:scale-[0.98] ${
                    canAfford 
                      ? 'bg-[#39ff14] text-black hover:bg-[#39ff14]/85 shadow-[#39ff14]/20 shadow-md font-extrabold' 
                      : 'theme-bg-hover border theme-border theme-text-muted cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Synthesize C-137 Form
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
