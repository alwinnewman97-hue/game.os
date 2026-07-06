import React, { useState, useEffect } from 'react';
import { GameState } from '../types';
import ScienceTab from './ScienceTab';
import UpgradesTab from './UpgradesTab';
import { playClickSound, triggerHaptic } from '../utils/audio';
import { FlaskConical, Hammer, ChevronDown, Check, Zap } from 'lucide-react';

interface TechTabProps {
  store: GameState;
}

type SubTabType = 'labs' | 'upgrades';

export default function TechTab({ store }: TechTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('labs');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isLabsUnlocked = !!store.unlocks.science;
  const isUpgradesUnlocked = !!store.unlocks.workshop;

  // Auto-redirect subtab if only one is unlocked
  useEffect(() => {
    if (isLabsUnlocked && !isUpgradesUnlocked) {
      setActiveSubTab('labs');
    } else if (!isLabsUnlocked && isUpgradesUnlocked) {
      setActiveSubTab('upgrades');
    }
  }, [isLabsUnlocked, isUpgradesUnlocked]);

  // If neither is unlocked, show a elegant locked message
  if (!isLabsUnlocked && !isUpgradesUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl theme-bg-card border theme-border flex items-center justify-center mb-4 shadow-lg animate-pulse">
          <FlaskConical size={28} className="theme-text-muted" />
        </div>
        <h3 className="text-base font-bold theme-text-main uppercase tracking-wider mb-2">Tech Center Locked</h3>
        <p className="text-xs theme-text-muted max-w-xs leading-relaxed">
          Establish scientific capabilities (construct a Library) or industrial infrastructure (construct a Workshop) to unlock advanced research and upgrade blueprints.
        </p>
      </div>
    );
  }

  const handleSubTabChange = (tab: SubTabType) => {
    setActiveSubTab(tab);
    setDropdownOpen(false);
    triggerHaptic('click');
    if (store.soundEnabled) playClickSound('click');
  };

  const getSubTabName = (tab: SubTabType) => {
    return tab === 'labs' ? 'Labs & Research' : 'Workshop Upgrades';
  };

  const getSubTabIcon = (tab: SubTabType, size = 14) => {
    return tab === 'labs' 
      ? <FlaskConical size={size} className="text-emerald-400 shrink-0" />
      : <Hammer size={size} className="text-cyan-400 shrink-0" />;
  };

  return (
    <div className="flex flex-col flex-1 pb-10">
      
      {/* Sleek Sub-Tab Dropdown Selector - only show dropdown if BOTH are unlocked */}
      {isLabsUnlocked && isUpgradesUnlocked ? (
        <div className="relative mb-6 z-40">
          <button
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              triggerHaptic('click');
              if (store.soundEnabled) playClickSound('click');
            }}
            className="w-full flex items-center justify-between py-3 px-4 rounded-xl border theme-border theme-bg-card font-sans font-black text-xs uppercase tracking-widest cursor-pointer shadow-md select-none hover:bg-white/[0.02] transition-all"
          >
            <div className="flex items-center gap-3">
              {getSubTabIcon(activeSubTab, 16)}
              <span className="theme-text-main font-black">
                {getSubTabName(activeSubTab)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] theme-text-muted font-bold tracking-widest hidden sm:inline">SWITCH DEPARTMENT</span>
              <ChevronDown 
                size={14} 
                className={`theme-text-muted transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} 
              />
            </div>
          </button>

          {dropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setDropdownOpen(false)} 
              />
              <div className="absolute left-0 right-0 mt-1.5 z-40 rounded-xl border theme-border theme-bg-panel p-1.5 shadow-2xl flex flex-col gap-1 backdrop-blur-md">
                {(['labs', 'upgrades'] as SubTabType[]).map((tab) => {
                  const isActive = activeSubTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => handleSubTabChange(tab)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left text-2xs uppercase tracking-widest font-black transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-emerald-500/10 text-emerald-400 font-extrabold border border-emerald-500/10' 
                          : 'theme-text-muted hover:theme-bg-hover hover:theme-text-main border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {getSubTabIcon(tab, 14)}
                        <span>{getSubTabName(tab)}</span>
                      </div>
                      {isActive && <Check size={12} className="text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      ) : (
        /* Single Unlocked Option Header Accent */
        <div className="flex items-center gap-2 mb-6 px-1.5 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10 max-w-max">
          {getSubTabIcon(activeSubTab, 12)}
          <span className="text-[9px] font-black uppercase tracking-widest theme-text-sec">
            {getSubTabName(activeSubTab)} Operational
          </span>
        </div>
      )}

      {/* Render the Active Tab Panel */}
      <div className="w-full">
        {activeSubTab === 'labs' && isLabsUnlocked ? (
          <ScienceTab store={store} />
        ) : (
          <UpgradesTab store={store} />
        )}
      </div>

    </div>
  );
}
