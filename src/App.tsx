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
  EyeOff,
  Terminal,
  Sliders,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

import ResourcePanel from './components/ResourcePanel';
import ConsoleLogs from './components/ConsoleLogs';
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
  const [isLogsOpen, setIsLogsOpen] = useState(window.innerWidth >= 768);

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
        `Welcome Back, Elder Kitten! While you were offline for ${timeStr}, your kittens calculated the cosmos, cultivated fresh catnip, and kept the campfires warm.`
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
    <div className="flex flex-col h-screen overflow-hidden theme-bg-app theme-text-main antialiased font-mono max-w-full">
      
      {/* CINEMATIC STARTUP SPLASH SCREEN WITH INTERACTIVE IMMERSIVE LAUNCHER */}
      <AnimatePresence mode="wait">
        {showSplash && (
          <motion.div
            key="splash-screen-wrapper"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 overflow-hidden"
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
        <div className="fixed top-4 right-4 z-50 bg-neutral-900/90 border border-neutral-700/50 text-neutral-250 p-3 h-14 rounded-xl flex items-center gap-2 shadow-2xl backdrop-blur-md animate-fade-in text-xs">
          <Sparkles size={14} className="text-neutral-300" />
          <span>Local storage persistence established. Progress automatically saved offline.</span>
        </div>
      )}

      {/* OFFLINE RESUME MODAL POPUP */}
      {offlineProgressMsg && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="theme-bg-card border theme-border p-6 rounded-2xl max-w-md w-full flex flex-col gap-4 shadow-2xl">
            <h3 className="text-sm uppercase font-black tracking-widest theme-text-main flex items-center gap-2">
              <Award size={18} />
              <span>Offline Chronoscopy</span>
            </h3>
            <p className="text-xs theme-text-sec leading-relaxed font-sans">{offlineProgressMsg}</p>
            <button
              onClick={() => {
                setOfflineProgressMsg(null);
                if (store.soundEnabled) playClickSound('success');
              }}
              className="theme-accent-bg text-xs font-black uppercase tracking-wider py-3 rounded-lg mt-2 cursor-pointer transition-transform duration-100 active:scale-95"
            >
              Resume Duties
            </button>
          </div>
        </div>
      )}

      {/* HEADER NAVIGATION BAR */}
      <header className="theme-bg-panel border-b theme-border h-16 shrink-0 px-3 sm:px-5 flex items-center justify-between select-none shadow-md">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="theme-bg-card border theme-border p-1.5 sm:p-2 rounded-xl text-neutral-400 shadow-inner">
            <Flame size={18} className="theme-text-main sm:w-[20px] sm:h-[20px]" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-black tracking-wider sm:tracking-[0.25em] theme-text-main flex items-center gap-1.5 sm:gap-2 uppercase">
              <span className="hidden min-[400px]:inline">Kittens Incremental</span>
              <span className="min-[400px]:hidden">Kittens</span>
            </h1>
            <p className="text-[10px] theme-text-sec hidden sm:block tracking-widest leading-none mt-1">ELEGANT COGNITIVE STRATEGY</p>
          </div>
        </div>

        {/* TIMING, SPEED, AUDIO, THEME, AND VIEW CONFIGURATORS */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-bold text-gray-400">
          
          {/* TOGGLE SIDEBAR CABINET */}
          <button
            onClick={() => {
              setIsSidebarOpen(!isSidebarOpen);
              if (store.soundEnabled) playClickSound('click');
            }}
            className={`p-2 theme-hover-bg border rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[10px] uppercase font-bold ${
              isSidebarOpen ? 'theme-border-active theme-text-main' : 'theme-border theme-text-muted'
            }`}
            title={isSidebarOpen ? "Collaspe Left Resource Shelf" : "Expand Left Resource Shelf"}
          >
            {isSidebarOpen ? <Eye size={13} className="theme-text-main" /> : <EyeOff size={13} className="theme-text-muted" />}
            <span className="hidden lg:inline">Resources</span>
          </button>

          {/* TOGGLE REACTION CHRONICLES LOGGER */}
          <button
            onClick={() => {
              setIsLogsOpen(!isLogsOpen);
              if (store.soundEnabled) playClickSound('click');
            }}
            className={`p-2 theme-hover-bg border rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[10px] uppercase font-bold ${
              isLogsOpen ? 'theme-border-active theme-text-main' : 'theme-border theme-text-muted'
            }`}
            title={isLogsOpen ? "Collapse Activity Chronicles Log" : "Expand Activity Chronicles Log"}
          >
            {isLogsOpen ? <Eye size={13} className="theme-text-main" /> : <EyeOff size={13} className="theme-text-muted" />}
            <span className="hidden lg:inline">Logs</span>
          </button>
          
          {/* THEME TOGGLE */}
          <button
            onClick={() => {
              const nextTheme = store.theme === 'dark' ? 'light' : 'dark';
              store.setTheme(nextTheme);
              if (store.soundEnabled) playClickSound('click');
            }}
            className="p-2 theme-hover-bg border theme-border rounded-lg theme-text-sec hover:theme-text-main transition-all cursor-pointer flex items-center justify-center"
            title={store.theme === 'dark' ? "Switch to Light Monochrome" : "Switch to Dark Monochrome"}
          >
            {store.theme === 'dark' ? <Sun size={14} className="theme-text-main" /> : <Moon size={14} className="theme-text-main" />}
          </button>

          {/* SOUND CONTROL */}
          <button
            onClick={() => {
              store.toggleSound();
              if (!store.soundEnabled) {
                playClickSound('success');
              }
            }}
            className="p-2 theme-hover-bg border theme-border rounded-lg theme-text-sec hover:theme-text-main transition-all cursor-pointer flex items-center justify-center"
            title={store.soundEnabled ? "Mute Game Effects" : "Unmute Game Effects"}
          >
            {store.soundEnabled ? <Volume2 size={14} className="theme-text-main" /> : <VolumeX size={14} className="theme-text-muted" />}
          </button>

          {/* GAME VELOCITY ADJUSTMENTS */}
          <div className="flex items-center theme-bg-card border theme-border p-1 rounded-lg gap-0.5">
            <button
              onClick={() => {
                store.setGameSpeed(0);
                if (store.soundEnabled) playClickSound('click');
              }}
              className={`p-1.5 rounded-md cursor-pointer transition-all ${store.gameSpeed === 0 ? 'theme-accent-bg font-extrabold' : 'theme-text-sec hover:theme-text-main'}`}
              title="Pause Ticks"
            >
              <Pause size={12} />
            </button>
            <button
              onClick={() => {
                store.setGameSpeed(1);
                if (store.soundEnabled) playClickSound('click');
              }}
              className={`px-2 py-1 text-[10px] rounded-md font-extrabold cursor-pointer transition-all ${store.gameSpeed === 1 ? 'theme-accent-bg font-black' : 'theme-text-sec hover:theme-text-main'}`}
              title="Normal speed (1x)"
            >
              1X
            </button>
            <button
              onClick={() => {
                store.setGameSpeed(4);
                if (store.soundEnabled) playClickSound('success');
              }}
              className={`px-2 py-1 text-[10px] rounded-md font-extrabold cursor-pointer transition-all ${store.gameSpeed === 4 ? 'theme-accent-bg font-black' : 'theme-text-sec hover:theme-text-main'}`}
              title="Speed Booster (4x)"
            >
              4X
            </button>
          </div>

          <button
            onClick={() => {
              if (confirm("Reset kittens civilisation? Progress will be lost.")) {
                store.resetGame();
              }
            }}
            className="text-[10px] uppercase font-bold theme-text-muted hover:theme-text-main hover:border-red-500/50 px-2.5 py-1.5 border theme-border rounded-lg transition-colors cursor-pointer hidden sm:block"
          >
            Reset Progress
          </button>
        </div>
      </header>

      {/* CORE WORKSPACE GRID */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden max-h-[calc(100vh-64px)]">
        
        {/* RESOURCE CONTROL MATRIX (LEFT COLUMN/DRAWER OVERLAY) */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              {/* Sidebar/Drawer body */}
              <motion.div
                key="resource-sidebar"
                initial={{ x: -285, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -285, opacity: 0 }}
                transition={{ type: 'spring', damping: 24, stiffness: 200 }}
                className="fixed md:static inset-y-16 md:inset-y-auto left-0 z-40 w-[285px] md:w-72 h-[calc(100vh-64px)] md:h-full flex flex-col shrink-0 overflow-hidden shadow-2xl md:shadow-none theme-bg-panel border-r theme-border"
              >
                <ResourcePanel
                  store={store}
                  catnipRate={computedCatnipRate}
                  woodRate={computedWoodRate}
                  scienceRate={computedScienceRate}
                  mineralsRate={computedMineralsRate}
                  cultureRate={computedCultureRate}
                  ironRate={computedIronRate}
                />
              </motion.div>

              {/* Backdrop covering screen only on mobile sizes */}
              <motion.div
                key="resource-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 top-16 bg-black/50 backdrop-blur-xs z-30 md:hidden"
              />
            </>
          )}
        </AnimatePresence>

        {/* COMPONENT LAYOUT TABS (CENTER CABINET) */}
        <div className="flex-1 flex flex-col h-full overflow-hidden theme-bg-app border-r theme-border">
          
          {/* TAB BAR NAVIGATION */}
          <nav className="h-13 theme-bg-panel border-b theme-border shrink-0 flex items-center px-4 sm:px-6 gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap scrollbar-none scroll-smooth relative select-none">
            <button
              onClick={() => handleTabChange('bonfire')}
              className={`shrink-0 flex items-center gap-1.5 h-full text-[11px] sm:text-xs font-bold uppercase tracking-widest border-b-2 cursor-pointer transition-all ${
                activeTab === 'bonfire' 
                  ? 'theme-border-active theme-text-main font-extrabold' 
                  : 'border-transparent theme-text-muted hover:theme-text-sec'
              }`}
            >
              <Sparkle size={12} />
              <span>Bonfire</span>
            </button>

            {store.unlocks.village && (
              <button
                onClick={() => handleTabChange('town')}
                className={`shrink-0 flex items-center gap-1.5 h-full text-[11px] sm:text-xs font-bold uppercase tracking-widest border-b-2 cursor-pointer transition-all ${
                  activeTab === 'town' 
                    ? 'theme-border-active theme-text-main font-extrabold' 
                    : 'border-transparent theme-text-muted hover:theme-text-sec'
                }`}
              >
                <Users size={12} />
                <span>Small Village</span>
              </button>
            )}

            {store.unlocks.science && (
              <button
                onClick={() => handleTabChange('science')}
                className={`shrink-0 flex items-center gap-1.5 h-full text-[11px] sm:text-xs font-bold uppercase tracking-widest border-b-2 cursor-pointer transition-all ${
                  activeTab === 'science' 
                    ? 'theme-border-active theme-text-main font-extrabold' 
                    : 'border-transparent theme-text-muted hover:theme-text-sec'
                }`}
              >
                <FlaskConical size={12} />
                <span>Science</span>
              </button>
            )}

            {store.unlocks.workshop && (
              <button
                onClick={() => handleTabChange('workshop')}
                className={`shrink-0 flex items-center gap-1.5 h-full text-[11px] sm:text-xs font-bold uppercase tracking-widest border-b-2 cursor-pointer transition-all ${
                  activeTab === 'workshop' 
                    ? 'theme-border-active theme-text-main font-extrabold' 
                    : 'border-transparent theme-text-muted hover:theme-text-sec'
                }`}
              >
                <Hammer size={12} />
                <span>Workshop</span>
              </button>
            )}
          </nav>

          {/* COMPACT RESOURCE MINI-HUD (Shown only in Zen / Collapsed Resource Shelf mode) */}
          {!isSidebarOpen && (
            <div className="theme-bg-panel border-b theme-border px-6 py-2.5 flex flex-wrap gap-x-6 gap-y-1.5 items-center text-[11px] font-mono select-none animate-fade-in shadow-inner">
              <span className="text-[9px] uppercase font-bold theme-text-sec tracking-widest mr-1 sm:block hidden">HUD Matrix:</span>
              
              {/* Catnip */}
              <div className="flex items-center gap-1.5" title="Catnip status">
                <span className="theme-text-muted">Catnip:</span>
                <span className="theme-text-main font-bold">
                  {Math.floor(store.resources.catnip.amount).toLocaleString()}
                </span>
                <span className={`text-[9.5px] font-bold ${computedCatnipRate >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  ({computedCatnipRate >= 0 ? '+' : ''}{computedCatnipRate.toFixed(1)}/s)
                </span>
              </div>

              {/* Wood */}
              {store.unlocks.wood && (
                <div className="flex items-center gap-1.5" title="Wood status">
                  <span className="theme-text-muted">Wood:</span>
                  <span className="theme-text-main font-bold">
                    {Math.floor(store.resources.wood.amount).toLocaleString()}
                  </span>
                  <span className={`text-[9.5px] font-bold ${computedWoodRate >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                    ({computedWoodRate >= 0 ? '+' : ''}{computedWoodRate.toFixed(2)}/s)
                  </span>
                </div>
              )}

              {/* Minerals */}
              {store.unlocks.minerals && (
                <div className="flex items-center gap-1.5" title="Minerals status">
                  <span className="theme-text-muted">Minerals:</span>
                  <span className="theme-text-main font-bold">
                    {Math.floor(store.resources.minerals.amount).toLocaleString()}
                  </span>
                  <span className={`text-[9.5px] font-bold ${computedMineralsRate >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                    ({computedMineralsRate >= 0 ? '+' : ''}{computedMineralsRate.toFixed(2)}/s)
                  </span>
                </div>
              )}

              {/* Iron */}
              {store.unlocks.iron && (
                <div className="flex items-center gap-1.5" title="Iron status">
                  <span className="theme-text-muted">Iron:</span>
                  <span className="theme-text-main font-bold">
                    {Math.floor(store.resources.iron.amount).toLocaleString()}
                  </span>
                  <span className={`text-[9.5px] font-bold ${computedIronRate >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                    ({computedIronRate >= 0 ? '+' : ''}{computedIronRate.toFixed(2)}/s)
                  </span>
                </div>
              )}

              {/* Science */}
              {store.unlocks.science && (
                <div className="flex items-center gap-1.5" title="Science status">
                  <span className="theme-text-muted">Science:</span>
                  <span className="theme-text-main font-bold">
                    {Math.floor(store.resources.science.amount).toLocaleString()}
                  </span>
                  <span className={`text-[9.5px] font-bold ${computedScienceRate >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                    ({computedScienceRate >= 0 ? '+' : ''}{computedScienceRate.toFixed(1)}/s)
                  </span>
                </div>
              )}

              {/* Culture */}
              {store.unlocks.culture && (
                <div className="flex items-center gap-1.5" title="Culture status">
                  <span className="theme-text-muted">Culture:</span>
                  <span className="theme-text-main font-bold">
                    {Math.floor(store.resources.culture.amount).toLocaleString()}
                  </span>
                  <span className={`text-[9.5px] font-bold ${computedCultureRate >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                    ({computedCultureRate >= 0 ? '+' : ''}{computedCultureRate.toFixed(2)}/s)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ACTIVE CABINET WINDOW */}
          <div className="flex-1 overflow-hidden flex flex-col h-full">
            {currentTabComponent()}
          </div>

          {/* CHRONICLES LOG CONSOLE (STATICALLY AT BOTTOM OUTLET) */}
          {isLogsOpen && (
            <div className="p-5 border-t theme-border theme-bg-panel shrink-0">
              <ConsoleLogs logs={store.logs} />
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
