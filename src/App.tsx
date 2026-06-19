import React, { useEffect, useState } from 'react';
import { useGameStore } from './store/useGameStore';
import { BUILDINGS, JOBS, SEASONS_DATA } from './gameData';
import { 
  Flame, 
  HelpCircle, 
  Settings2, 
  Sparkle, 
  Users, 
  FlaskConical, 
  Hammer, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Award,
  ChevronRight,
  Github,
  Sun,
  Moon,
  Eye,
  Sliders,
  ChevronsLeft,
  ChevronsRight,
  Trash2
} from 'lucide-react';

import ResourcePanel from './components/ResourcePanel';
import BonfireTab from './components/BonfireTab';
import TownTab from './components/TownTab';
import ScienceTab from './components/ScienceTab';
import WorkshopTab from './components/WorkshopTab';
import { playClickSound } from './utils/audio';
import { AnimatePresence, motion } from 'motion/react';
import SplashStartup from './components/SplashStartup';

type ActiveTabType = 'bonfire' | 'town' | 'science' | 'workshop';

export default function App() {
  const store = useGameStore();
  const [activeTab, setActiveTab] = useState<ActiveTabType>('bonfire');
  const [showSpeedControls, setShowSpeedControls] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [offlineProgressMsg, setOfflineProgressMsg] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  
  // Custom layout view togglers to manage display density - collapsed on small mobile screens
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  // Synchronize document attribute with theme selection
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', store.theme);
  }, [store.theme]);

  // Initialize Game loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = Date.now();

    const loop = () => {
      const now = Date.now();
      const deltaSeconds = (now - lastTime) / 1000;
      
      // Advance game store, capping maximum single-frame lag to 2 seconds
      store.tick(Math.min(2, deltaSeconds));
      
      lastTime = now;
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    // Initial offline catchup calculation
    const now = Date.now();
    const offlineSeconds = (now - store.lastTick) / 1000;
    
    if (offlineSeconds > 25) {
      // Calculate how many minutes offline
      const mins = Math.floor(offlineSeconds / 60);
      const hours = Math.floor(mins / 60);
      let timeStr = `${mins}m`;
      if (hours > 0) {
        timeStr = `${hours}h ${mins % 60}m`;
      }
      
      // Let's pass the offline seconds to the tick
      store.tick(offlineSeconds);
      
      setOfflineProgressMsg(
        `Welcome Back, Portal Master! While you were offline for ${timeStr}, your clones maintained the laboratories, harvested fresh Mega Seeds, and kept the fusion cores warm.`
      );
    }

    // Trigger save confirmation toast once on startup
    setShowSuccessToast(true);
    const timeout = setTimeout(() => setShowSuccessToast(false), 4500);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeout);
    };
  }, []);

  // Compute calculated Rates per second for display
  const kittensList = Array.isArray(store.village?.kittens) ? store.village.kittens : [];
  const kittenCount = kittensList.length;
  
  const jobCounts = {
    farmer: 0,
    woodcutter: 0,
    scholar: 0,
    miner: 0,
    priest: 0
  };
  
  kittensList.forEach(k => {
    if (k.job !== 'unemployed') {
      jobCounts[k.job]++;
    }
  });

  const barnMultiplier = store.upgrades.reinforcedBarns ? 1.4 : 1.0;
  const warehouseMultiplier = store.upgrades.expandedStorage ? 1.35 : 1.0;

  let maxCatnip = 2000 + (store.buildings.pasture * 500) + (store.buildings.barn * 2500 * barnMultiplier);
  if (store.upgrades.catnipSilos) maxCatnip *= 1.5;

  // Rates formulas mirror store tick perfectly for pixel-perfect UI synchronization
  const farmerEffBonus = store.researched.agriculture ? 1.20 : 1.0;
  const seasonModifier = store.researched.calendar ? SEASONS_DATA[store.season.current].catnipModifier : 1.0;
  const aqueductBoost = 1 + (store.buildings.aqueduct * 0.15);

  const fieldsPassiveRate = store.buildings.catnipField * 0.63 * seasonModifier * aqueductBoost;
  const farmerRateValue = jobCounts.farmer * 5.0 * farmerEffBonus * seasonModifier;
  
  const pastureIntakeReduction = Math.max(0.50, 1 - (store.buildings.pasture * 0.015));
  const kittenEatsRate = kittenCount * 4.25 * pastureIntakeReduction;
  
  const computedCatnipRate = fieldsPassiveRate + farmerRateValue - kittenEatsRate;

  let axeMultiplier = 1.0;
  if (store.upgrades.ironAxes) axeMultiplier = 1.75;
  else if (store.upgrades.mineralAxes) axeMultiplier = 1.25;

  const efficiencyFactor = store.village.happiness / 100;
  
  let computedWoodRate = jobCounts.woodcutter * 0.10 * axeMultiplier * efficiencyFactor;
  let computedMineralsRate = (jobCounts.miner * 0.18 * efficiencyFactor) + (store.buildings.mine * 0.05);
  let computedIronRate = 0;

  if (store.buildings.smelter > 0) {
    const smeltersCount = store.buildings.smelter;
    // Smelters consume raw mats to output iron
    if ((store.resources.wood?.amount ?? 0) > 1 && (store.resources.minerals?.amount ?? 0) > 10) {
      computedWoodRate -= smeltersCount * 1.0;
      computedMineralsRate -= smeltersCount * 10.0;
      computedIronRate += smeltersCount * 0.18;
    }
  }

  const academyScholarMod = 1 + (store.buildings.academy * 0.20);
  const computedScienceRate = jobCounts.scholar * 0.25 * academyScholarMod * efficiencyFactor;
  const computedCultureRate = jobCounts.priest * 0.15 * efficiencyFactor;

  const handleTabChange = (tab: ActiveTabType) => {
    setActiveTab(tab);
    if (store.soundEnabled) playClickSound('click');
  };

  const currentTabComponent = () => {
    switch (activeTab) {
      case 'bonfire':
        return <BonfireTab store={store} />;
      case 'town':
        return <TownTab store={store} />;
      case 'science':
        return <ScienceTab store={store} />;
      case 'workshop':
        return <WorkshopTab store={store} />;
      default:
        return <BonfireTab store={store} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] overflow-hidden theme-bg-app theme-text-main antialiased font-sans max-w-full relative selection:bg-white/10 selection:theme-text-main">
      
      {/* CINEMATIC STARTUP SPLASH SCREEN WITH INTERACTIVE IMMERSIVE LAUNCHER */}
      <AnimatePresence mode="wait">
        {showSplash && (
          <motion.div
            key="splash-screen-wrapper"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="fixed inset-0 z-[100] overflow-hidden"
          >
            <SplashStartup 
              onEnter={() => setShowSplash(false)} 
              soundEnabled={store.soundEnabled} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* GLOBAL TOAST NOTIFIER */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 z-[90] theme-bg-card border theme-border p-3 h-14 rounded-2xl flex items-center gap-3 shadow-2xl backdrop-blur-md animate-fade-in text-xs">
          <Sparkles size={16} className="theme-text-main" />
          <span className="font-semibold tracking-wide">Persistence established. Progress saved offline.</span>
        </div>
      )}

      {/* OFFLINE RESUME MODAL POPUP */}
      {offlineProgressMsg && (
        <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="theme-bg-card border theme-border p-8 rounded-[2rem] max-w-md w-full flex flex-col gap-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
            <h3 className="text-xl font-black tracking-tighter theme-text-main flex items-center gap-3 uppercase">
              <Award size={24} />
              <span>Chronoscopy</span>
            </h3>
            <p className="text-sm theme-text-sec leading-relaxed font-sans">{offlineProgressMsg}</p>
            <button
              onClick={() => {
                setOfflineProgressMsg(null);
                if (store.soundEnabled) playClickSound('success');
              }}
              className="theme-text-main border theme-border py-4 rounded-xl mt-4 cursor-pointer hover:bg-white/5 font-bold uppercase tracking-widest text-xs transition-all active:scale-[0.98]"
            >
              Resume Duties
            </button>
          </div>
        </div>
      )}

      {/* AWWWARDS-STYLE SIDE NAVIGATION DOCK */}
      <nav className="fixed md:static bottom-4 left-4 right-4 md:inset-y-0 md:left-0 z-50 md:w-28 md:h-screen bg-black/40 md:bg-transparent backdrop-blur-3xl md:backdrop-blur-none border border-white/5 md:border-none md:border-r theme-border rounded-[2rem] md:rounded-none flex flex-row md:flex-col items-center justify-between p-2 md:py-8 shadow-2xl md:shadow-none shrink-0">
        
        {/* Top items: Logo and Primary Tabs */}
        <div className="flex flex-row md:flex-col items-center gap-1 md:gap-6 w-full">
          <div className="hidden md:flex items-center justify-center w-14 h-14 rounded-2xl theme-bg-card border theme-border mb-4 shadow-[0_0_30px_rgba(255,255,255,0.03)] opacity-80 hover:opacity-100 transition-opacity">
            <Flame size={24} className="theme-text-main"/>
          </div>

          <div className="flex flex-row md:flex-col gap-1.5 w-full justify-around md:justify-start px-2 md:px-4">
            <button
              onClick={() => handleTabChange('bonfire')}
              className={`p-3 md:py-4 md:w-full rounded-2xl flex flex-col items-center gap-2 text-xs font-bold uppercase tracking-widest cursor-pointer portal-tab-btn relative ${
                activeTab === 'bonfire' 
                  ? 'portal-tab-btn-active scale-100' 
                  : 'text-neutral-500 scale-95'
              }`}
            >
              <Sparkle size={18} className={activeTab === 'bonfire' ? 'text-emerald-400 animate-pulse' : 'text-neutral-400'} />
              <span className="text-[9px] md:text-[10px] hidden sm:block font-sans">Citadel</span>
              {activeTab === 'bonfire' && (
                <div className="portal-tab-indicator absolute bottom-0 left-6 right-6 h-[2px] md:left-0 md:top-4 md:bottom-4 md:w-[3px] md:h-auto rounded-full" />
              )}
            </button>

            {store.unlocks.village && (
              <button
                onClick={() => handleTabChange('town')}
                className={`p-3 md:py-4 md:w-full rounded-2xl flex flex-col items-center gap-2 text-xs font-bold uppercase tracking-widest cursor-pointer portal-tab-btn relative ${
                  activeTab === 'town' 
                    ? 'portal-tab-btn-active scale-100' 
                    : 'text-neutral-500 scale-95'
                }`}
              >
                <Users size={18} className={activeTab === 'town' ? 'text-emerald-400 animate-pulse' : 'text-neutral-400'} />
                <span className="text-[9px] md:text-[10px] hidden sm:block font-sans">Clone Bay</span>
                {activeTab === 'town' && (
                  <div className="portal-tab-indicator absolute bottom-0 left-6 right-6 h-[2px] md:left-0 md:top-4 md:bottom-4 md:w-[3px] md:h-auto rounded-full" />
                )}
              </button>
            )}

            {store.unlocks.science && (
              <button
                onClick={() => handleTabChange('science')}
                className={`p-3 md:py-4 md:w-full rounded-2xl flex flex-col items-center gap-2 text-xs font-bold uppercase tracking-widest cursor-pointer portal-tab-btn relative ${
                  activeTab === 'science' 
                    ? 'portal-tab-btn-active scale-100' 
                    : 'text-neutral-500 scale-95'
                }`}
              >
                <FlaskConical size={18} className={activeTab === 'science' ? 'text-emerald-400 animate-pulse' : 'text-neutral-400'} />
                <span className="text-[9px] md:text-[10px] hidden sm:block font-sans">Labs</span>
                {activeTab === 'science' && (
                  <div className="portal-tab-indicator absolute bottom-0 left-6 right-6 h-[2px] md:left-0 md:top-4 md:bottom-4 md:w-[3px] md:h-auto rounded-full" />
                )}
              </button>
            )}

            {store.unlocks.workshop && (
              <button
                onClick={() => handleTabChange('workshop')}
                className={`p-3 md:py-4 md:w-full rounded-2xl flex flex-col items-center gap-2 text-xs font-bold uppercase tracking-widest cursor-pointer portal-tab-btn relative ${
                  activeTab === 'workshop' 
                    ? 'portal-tab-btn-active scale-100' 
                    : 'text-neutral-500 scale-95'
                }`}
              >
                <Hammer size={18} className={activeTab === 'workshop' ? 'text-emerald-400 animate-pulse' : 'text-neutral-400'} />
                <span className="text-[9px] md:text-[10px] hidden sm:block font-sans">Refine</span>
                {activeTab === 'workshop' && (
                  <div className="portal-tab-indicator absolute bottom-0 left-6 right-6 h-[2px] md:left-0 md:top-4 md:bottom-4 md:w-[3px] md:h-auto rounded-full" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Bottom items: Utilities */}
        <div className="flex flex-row md:flex-col items-center gap-3 md:gap-4 md:mt-auto pr-3 md:pr-0">
          <button
            onClick={() => {
              const nextTheme = store.theme === 'dark' ? 'light' : 'dark';
              store.setTheme(nextTheme);
              if (store.soundEnabled) playClickSound('click');
            }}
            className="p-2.5 rounded-xl text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            {store.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => {
              store.toggleSound();
              if (!store.soundEnabled) playClickSound('success');
            }}
            className="p-2.5 rounded-xl text-neutral-500 hover:text-neutral-300 transition-colors hidden sm:block"
          >
            {store.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </nav>

      {/* MAIN WORKSPACE AREA */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        {/* SUPER MINIMAL TOP BAR */}
        <header className="w-full shrink-0 pt-8 sm:pt-10 px-5 sm:px-10 flex flex-col gap-6 z-20 relative">
          <div className="flex justify-between items-end relative">
             <h1 className="text-5xl sm:text-7xl font-black tracking-[-0.04em] opacity-5 theme-text-main uppercase leading-none select-none absolute -top-4 -left-2 pointer-events-none origin-left transform-gpu mix-blend-overlay">
               {activeTab === 'bonfire' ? 'Citadel' : activeTab === 'town' ? 'Clone Bay' : activeTab === 'science' ? 'Labs' : 'Refinery'}
             </h1>
             
             {/* Spacing element to push controls to the right */}
             <div className="flex-1"></div>

             <div className="flex items-center gap-4 z-10">
                <div className="flex items-center theme-bg-card border theme-border rounded-xl p-1 gap-1 shadow-sm backdrop-blur-md">
                  <button
                    onClick={() => { store.setGameSpeed(0); if (store.soundEnabled) playClickSound('click'); }}
                    className={`p-2 rounded-lg cursor-pointer transition-all ${store.gameSpeed === 0 ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                    <Pause size={14} />
                  </button>
                  <button
                    onClick={() => { store.setGameSpeed(1); if (store.soundEnabled) playClickSound('click'); }}
                    className={`px-3 py-1.5 text-xs rounded-lg font-black cursor-pointer transition-all ${store.gameSpeed === 1 ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                    1X
                  </button>
                  <button
                    onClick={() => { store.setGameSpeed(4); if (store.soundEnabled) playClickSound('success'); }}
                    className={`px-3 py-1.5 text-xs rounded-lg font-black cursor-pointer transition-all ${store.gameSpeed === 4 ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                    4X
                  </button>
                </div>
                
                <button
                  onClick={() => {
                    if (confirm("Initiate multiversal reboot? Timeline progress will be lost.")) {
                      store.resetGame();
                      window.location.reload();
                    }
                  }}
                  className="p-2.5 rounded-xl text-neutral-600 hover:text-red-500 transition-colors hidden sm:block"
                  title="Erase Civilisation"
                >
                  <Trash2 size={16} />
                </button>
             </div>
          </div>

          {/* FLOATING TOP RESOURCES HUD */}
          <div className="z-20 w-full animate-fade-in relative mt-2 mb-4">
             <ResourcePanel
                store={store}
                catnipRate={computedCatnipRate}
                woodRate={computedWoodRate}
                scienceRate={computedScienceRate}
                mineralsRate={computedMineralsRate}
                cultureRate={computedCultureRate}
                ironRate={computedIronRate}
              />
          </div>
        </header>

        {/* ACTIVE TAB CONTENT WINDOW */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto px-5 sm:px-10 pb-32 md:pb-12 pt-2 relative z-10 scrollbar-none">
          {currentTabComponent()}
        </div>



      </main>
    </div>
  );
}
