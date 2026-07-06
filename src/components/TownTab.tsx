import React, { useState, useEffect } from 'react';
import { GameState, JobType } from '../types';
import { JOBS } from '../gameData';
import { calculateJobStrengths } from '../store/useGameStore';
import { playClickSound, triggerHaptic } from '../utils/audio';
import { 
  Smile, 
  Frown, 
  Plus, 
  Minus, 
  Users, 
  Briefcase, 
  Sparkles,
  SlidersHorizontal,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Info,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface TownTabProps {
  store: GameState;
}

export default function TownTab({ store }: TownTabProps) {
  const kittens = Array.isArray(store.village?.kittens) ? store.village.kittens : [];
  const maxKittens = store.village?.maxKittens || 0;
  const isCompact = store.density === 'compact';
  const [openInfo, setOpenInfo] = useState<Record<string, boolean>>({});
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [clonesOpen, setClonesOpen] = React.useState(kittens.length <= 5);
  const [presetName, setPresetName] = React.useState('');

  const [filterJob, setFilterJob] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'level-desc' | 'level-asc' | 'name'>('level-desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when filters or sorting selection changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterJob, sortBy]);

  const jobCounts: Record<JobType | 'unemployed', number> = {
    farmer: 0,
    woodcutter: 0,
    scholar: 0,
    miner: 0,
    priest: 0,
    darkMatterScientist: 0,
    fluidEngineer: 0,
    unemployed: 0
  };

  kittens.forEach((k) => {
    if (k && k.job && jobCounts[k.job] !== undefined) {
      jobCounts[k.job]++;
    }
  });

  const freeKittens = jobCounts.unemployed;
  const jobStrengths = calculateJobStrengths(kittens);

  const handleAssignJob = (kittenId: string, job: JobType | 'unemployed') => {
    store.assignJob(kittenId, job);
    if (store.soundEnabled) playClickSound('click');
  };

  const handleAssignMultiple = (job: JobType, countToAssign: number) => {
    const idleKittens = kittens.filter(k => k.job === 'unemployed').slice(0, countToAssign);
    if (idleKittens.length > 0) {
      store.assignJobsMultiple(idleKittens.map(k => k.id), job);
      if (store.soundEnabled) playClickSound('click');
    }
  };

  const handleUnassignMultiple = (job: JobType, countToUnassign: number) => {
    const assignedKittens = kittens.filter(k => k.job === job).slice(0, countToUnassign);
    if (assignedKittens.length > 0) {
      store.assignJobsMultiple(assignedKittens.map(k => k.id), 'unemployed');
      if (store.soundEnabled) playClickSound('click');
    }
  };

  const handleUnassignAll = () => {
    store.unassignAll();
    if (store.soundEnabled) playClickSound('success');
  };

  const handleAutoAssign = (job: JobType) => {
    store.autoAssignAll(job);
    if (store.soundEnabled) playClickSound('click');
  };

  const runSmartAssign = (idleKittensList: typeof kittens) => {
    if (idleKittensList.length === 0) return;

    const availableJobs: { job: JobType; score: number }[] = [];
    const jobTypes: JobType[] = ['farmer', 'woodcutter', 'scholar', 'miner', 'priest', 'darkMatterScientist', 'fluidEngineer'];

    jobTypes.forEach(jobId => {
      // Check if job is unlocked
      if (jobId === 'miner' && !store.unlocks.minerals) return;
      if (jobId === 'scholar' && store.buildings.library === 0) return;
      if (jobId === 'priest' && (!store.unlocks.culture || store.buildings.amphitheatre === 0)) return;
      if (jobId === 'darkMatterScientist' && !store.unlocks.darkMatter) return;
      if (jobId === 'fluidEngineer' && !store.unlocks.fluid) return;

      // Skip jobs marked as essential/locked from auto-rebalancing
      if (store.essentialJobs?.[jobId]) return;

      let score = 0;
      if (store.smartAssignMode === 'custom') {
        score = store.smartAssignRatios?.[jobId] ?? 1;
      } else {
        // Dynamic Bottleneck Optimizer mode
        if (jobId === 'farmer') {
          const catnipAmt = store.resources.catnip.amount;
          const catnipMax = store.resources.catnip.max || 1000;
          const catnipRatio = catnipAmt / catnipMax;
          if (catnipRatio < 0.2 || catnipAmt < 300) {
            score = 2.5 * (1 - catnipRatio);
          } else {
            score = 0.15 * (1 - catnipRatio);
          }
        } else if (jobId === 'woodcutter') {
          const woodRatio = store.resources.wood.amount / (store.resources.wood.max || 1000);
          score = 1.2 * (1 - woodRatio);
        } else if (jobId === 'miner') {
          const mineralsRatio = store.resources.minerals.amount / (store.resources.minerals.max || 1000);
          score = 1.4 * (1 - mineralsRatio);
        } else if (jobId === 'scholar') {
          const scienceRatio = store.resources.science.amount / (store.resources.science.max || 1000);
          score = 1.0 * (1 - scienceRatio);
        } else if (jobId === 'priest') {
          const cultureRatio = store.resources.culture.amount / (store.resources.culture.max || 100000);
          score = 0.8 * (1 - cultureRatio);
        } else if (jobId === 'darkMatterScientist') {
          const dmRatio = store.resources.darkMatter.amount / (store.resources.darkMatter.max || 1000);
          score = 1.6 * (1 - dmRatio);
        } else if (jobId === 'fluidEngineer') {
          const fluidRatio = store.resources.portalFluid.amount / (store.resources.portalFluid.max || 1000);
          score = 1.8 * (1 - fluidRatio);
        }
      }

      availableJobs.push({ job: jobId, score });
    });

    if (availableJobs.length === 0) return;

    const totalScore = availableJobs.reduce((sum, j) => sum + j.score, 0);

    if (totalScore <= 0) {
      // Fallback: distribute evenly
      const count = availableJobs.length;
      idleKittensList.forEach((k, idx) => {
        const jobToAssign = availableJobs[idx % count].job;
        store.assignJob(k.id, jobToAssign);
      });
      return;
    }

    const assignments: Record<JobType, string[]> = {
      farmer: [],
      woodcutter: [],
      scholar: [],
      miner: [],
      priest: [],
      darkMatterScientist: [],
      fluidEngineer: []
    };

    let assignedCount = 0;
    const jobsWithShares = availableJobs.map(j => {
      const idealShare = (j.score / totalScore) * idleKittensList.length;
      return {
        job: j.job,
        idealShare,
        floorShare: Math.floor(idealShare)
      };
    });

    // First pass: assign the floor count
    jobsWithShares.forEach(js => {
      const toAssign = js.floorShare;
      for (let i = 0; i < toAssign; i++) {
        if (assignedCount < idleKittensList.length) {
          assignments[js.job].push(idleKittensList[assignedCount].id);
          assignedCount++;
        }
      }
    });

    // Second pass: distribute the remaining fraction to jobs with highest decimals
    const remainders = jobsWithShares
      .map(js => ({ job: js.job, rem: js.idealShare - js.floorShare }))
      .sort((a, b) => b.rem - a.rem);

    for (let i = 0; i < remainders.length; i++) {
      if (assignedCount >= idleKittensList.length) break;
      assignments[remainders[i].job].push(idleKittensList[assignedCount].id);
      assignedCount++;
    }

    // Batch assign in store
    Object.entries(assignments).forEach(([job, ids]) => {
      if (ids.length > 0) {
        store.assignJobsMultiple(ids, job as JobType);
      }
    });
  };

  const handleSmartAssign = () => {
    const idleKittens = kittens.filter(k => k.job === 'unemployed');
    if (idleKittens.length === 0) return;
    runSmartAssign(idleKittens);
    if (store.soundEnabled) playClickSound('success');
  };

  const handleFullRebalance = () => {
    const essentialJobs = store.essentialJobs || {};
    // Unassign all non-essential clones
    const toUnassign = kittens.filter(k => k.job !== 'unemployed' && !essentialJobs[k.job]);
    if (toUnassign.length > 0) {
      store.assignJobsMultiple(toUnassign.map(k => k.id), 'unemployed');
    }

    // Combine currently idle and newly unassigned clones
    const allIdleKittens = [
      ...kittens.filter(k => k.job === 'unemployed'),
      ...toUnassign
    ];

    if (allIdleKittens.length > 0) {
      runSmartAssign(allIdleKittens);
    }
    if (store.soundEnabled) playClickSound('success');
  };

  const applyPredefinedPreset = (type: 'balanced' | 'science' | 'production') => {
    let ratios: Record<JobType, number> = { ...BASE_SMART_ASSIGN_RATIOS };
    
    if (type === 'balanced') {
      ratios = {
        farmer: 1,
        woodcutter: 1,
        scholar: 1,
        miner: 1,
        priest: 1,
        darkMatterScientist: 1,
        fluidEngineer: 1
      };
    } else if (type === 'science') {
      ratios = {
        farmer: 1,
        woodcutter: 1,
        scholar: 5,
        miner: 1,
        priest: 2,
        darkMatterScientist: 4,
        fluidEngineer: 1
      };
    } else if (type === 'production') {
      ratios = {
        farmer: 2,
        woodcutter: 4,
        scholar: 1,
        miner: 4,
        priest: 1,
        darkMatterScientist: 1,
        fluidEngineer: 4
      };
    }

    // Set ratios one by one since we don't have setAllRatios (or we could add it)
    // Actually, I can just use a loop
    Object.entries(ratios).forEach(([job, val]) => {
      store.setSmartAssignRatio(job as JobType, val);
    });
    store.setSmartAssignMode('custom');
    if (store.soundEnabled) playClickSound('success');
  };

  const BASE_SMART_ASSIGN_RATIOS: Record<JobType, number> = {
    farmer: 1,
    woodcutter: 1,
    scholar: 1,
    miner: 1,
    priest: 1,
    darkMatterScientist: 1,
    fluidEngineer: 1
  };

  return (
    <div className="flex flex-col flex-1 pb-10">
      
      {/* COMPACT TOWN HUD */}
      <div className={`flex justify-between items-center border-b theme-border transition-all duration-300 ${
        isCompact ? 'pb-3 mx-2 mt-2 gap-2' : 'pb-6 mx-2 sm:mx-6 mt-4'
      }`}>
        <span className={`uppercase font-bold theme-text-muted tracking-widest leading-none ${
          isCompact ? 'text-[9px]' : 'text-[10px]'
        }`}>Clone Command Centre</span>
        <div className={`flex flex-wrap items-center gap-y-2 text-sm select-none transition-all ${
          isCompact ? 'gap-x-4 text-xs' : 'gap-x-6'
        }`}>
          <div className="flex items-center gap-2 font-mono theme-text-main leading-none">
            <Users size={isCompact ? 12 : 14} className="theme-text-muted" />
            <span>{kittens.length}<span className="theme-text-muted opacity-50">/{maxKittens}</span></span>
          </div>

          <div className="flex items-center gap-2 theme-text-muted font-mono leading-none">
            <span>Moraly: {store.village.happiness}%</span>
          </div>

          <div className={`font-mono leading-none ${freeKittens > 0 ? 'text-cyan-400 font-bold' : 'theme-text-muted opacity-50'}`}>
            Idle: {freeKittens}
          </div>
        </div>
      </div>

      {/* QUICK LABOUR ACTIONS */}
      <div className={`flex flex-wrap items-center select-none transition-all duration-300 ${
        isCompact ? 'gap-2 mx-2 mt-4 mb-4' : 'gap-3 mx-2 sm:mx-6 mt-6 mb-8'
      }`}>
        {kittens.length < maxKittens && (
          <button
            onClick={() => {
              store.forceAddKitten();
              if (store.soundEnabled) playClickSound('success');
            }}
            className={`uppercase tracking-widest font-bold theme-text-main theme-bg-hover hover:theme-bg-panel rounded-full transition-all active:scale-95 cursor-pointer ${
              isCompact ? 'text-[9px] px-4 py-2' : 'text-[10px] px-6 py-3'
            }`}
          >
            Clone Alternate
          </button>
        )}

        {kittens.length > 0 && freeKittens < kittens.length && (
          <button
            onClick={handleUnassignAll}
            className={`uppercase tracking-widest font-bold theme-text-muted border theme-border hover:theme-text-main rounded-full transition-colors cursor-pointer ${
              isCompact ? 'text-[9px] px-4 py-2' : 'text-[10px] px-6 py-3'
            }`}
          >
            Recall All
          </button>
        )}

        {kittens.length > 0 && (
          <button
            onClick={handleSmartAssign}
            disabled={freeKittens === 0}
            className={`uppercase tracking-widest font-bold flex items-center gap-2 rounded-full transition-all cursor-pointer ${
              freeKittens > 0 
                ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/15 hover:from-cyan-500/25 hover:to-blue-500/25 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.08)] active:scale-95' 
                : 'text-slate-600 border border-slate-800 opacity-40 cursor-not-allowed'
            } ${
              isCompact ? 'text-[9px] px-4 py-2' : 'text-[10px] px-6 py-3'
            }`}
          >
            <Sparkles size={isCompact ? 11 : 13} className={freeKittens > 0 ? "animate-pulse" : ""} />
            Smart Assign
          </button>
        )}
      </div>

      {/* AUTO-ASSIGNER SETTINGS AND AUTOMATION HUB */}
      {kittens.length > 0 && (
        <div className={`mb-6 border theme-border rounded-xl theme-bg-card/30 backdrop-blur-md overflow-hidden transition-all duration-300 mx-2 ${
          isCompact ? 'p-3' : 'p-5 sm:p-6'
        }`}>
          <div className="flex justify-between items-center cursor-pointer select-none" onClick={() => setSettingsOpen(!settingsOpen)}>
            <div className="flex items-center gap-3">
              <SlidersHorizontal size={isCompact ? 14 : 18} className="text-cyan-400" />
              <div className="flex flex-col">
                <span className={`font-bold theme-text-main leading-tight ${isCompact ? 'text-xs' : 'text-sm'}`}>Auto-Assigner & Smart Settings</span>
                <span className="text-[10px] theme-text-muted">Configure job priorities, target ratios, and essential job locks</span>
              </div>
            </div>
            <div className="theme-text-muted hover:theme-text-main transition-colors">
              {settingsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>

          {settingsOpen && (
            <div className="mt-4 pt-4 border-t theme-border flex flex-col gap-4">
              {/* MODE TOGGLES */}
              <div className="flex flex-col gap-1.5 pb-2 border-b theme-border">
                <span className="text-[10px] uppercase tracking-wider font-bold theme-text-muted">Optimization Mode</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    onClick={() => store.setSmartAssignMode('dynamic')}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      store.smartAssignMode === 'dynamic'
                        ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/40 text-cyan-400'
                        : 'theme-border theme-text-muted hover:theme-text-main hover:theme-bg-panel'
                    }`}
                  >
                    <Sparkles size={13} />
                    <span>Dynamic Bottleneck</span>
                  </button>
                  <button
                    onClick={() => store.setSmartAssignMode('custom')}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      store.smartAssignMode === 'custom'
                        ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/40 text-purple-400'
                        : 'theme-border theme-text-muted hover:theme-text-main hover:theme-bg-panel'
                    }`}
                  >
                    <SlidersHorizontal size={13} />
                    <span>Custom Target Ratios</span>
                  </button>
                </div>
                <p className="text-[10px] theme-text-muted mt-1">
                  {store.smartAssignMode === 'dynamic'
                    ? '🧬 Automatically balances and assigns clones based on real-time resource deficits and storage capacities to prevent wasted production.'
                    : '📐 Allocates unemployed clones strictly in proportion to the custom job weights you configure below.'}
                </p>
              </div>

              {/* JOB PRESETS */}
              <div className="flex flex-col gap-2 pb-2 border-b theme-border">
                <span className="text-[10px] uppercase tracking-wider font-bold theme-text-muted">Job Presets</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => applyPredefinedPreset('balanced')}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg border theme-border theme-bg-hover hover:theme-text-main transition-all cursor-pointer"
                  >
                    <Users size={14} className="text-emerald-400" />
                    <span className="text-[9px] font-bold uppercase tracking-tighter">Balanced</span>
                  </button>
                  <button
                    onClick={() => applyPredefinedPreset('science')}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg border theme-border theme-bg-hover hover:theme-text-main transition-all cursor-pointer"
                  >
                    <Sparkles size={14} className="text-purple-400" />
                    <span className="text-[9px] font-bold uppercase tracking-tighter">High Science</span>
                  </button>
                  <button
                    onClick={() => applyPredefinedPreset('production')}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg border theme-border theme-bg-hover hover:theme-text-main transition-all cursor-pointer"
                  >
                    <RefreshCw size={14} className="text-amber-400" />
                    <span className="text-[9px] font-bold uppercase tracking-tighter">Production</span>
                  </button>
                </div>

                {/* CUSTOM PRESETS */}
                <div className="mt-2 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Preset Name..."
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      className="flex-1 theme-bg-app border theme-border rounded-md px-2 py-1 text-[10px] theme-text-main focus:outline-none focus:border-cyan-500/50"
                    />
                    <button
                      disabled={!presetName.trim()}
                      onClick={() => {
                        store.saveJobPreset(presetName.trim());
                        setPresetName('');
                      }}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                        presetName.trim()
                          ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30 cursor-pointer'
                          : 'theme-bg-panel theme-text-muted border theme-border opacity-50 cursor-not-allowed'
                      }`}
                    >
                      Save
                    </button>
                  </div>

                  {store.jobPresets && Object.keys(store.jobPresets).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {Object.keys(store.jobPresets).map(name => (
                        <div key={name} className="flex items-center gap-1 px-2 py-1 bg-slate-900/50 border theme-border rounded-md group">
                          <button
                            onClick={() => store.loadJobPreset(name)}
                            className="text-[9px] font-semibold theme-text-main hover:text-cyan-400 transition-colors cursor-pointer"
                          >
                            {name}
                          </button>
                          <button
                            onClick={() => store.deleteJobPreset(name)}
                            className="text-slate-600 hover:text-red-400 transition-colors cursor-pointer ml-1"
                          >
                            <Minus size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* TARGET RATIOS GRID */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-wider font-bold theme-text-muted">Job Weights & Locks</span>
                <div className="flex flex-col gap-2.5">
                  {(Object.entries(JOBS) as [JobType, typeof JOBS[JobType]][]).map(([jobId, jobDef]) => {
                    // Check if unlocked
                    if (jobId === 'miner' && !store.unlocks.minerals) return null;
                    if (jobId === 'scholar' && store.buildings.library === 0) return null;
                    if (jobId === 'priest' && (!store.unlocks.culture || store.buildings.amphitheatre === 0)) return null;
                    if (jobId === 'darkMatterScientist' && !store.unlocks.darkMatter) return null;
                    if (jobId === 'fluidEngineer' && !store.unlocks.fluid) return null;

                    const currentWeight = store.smartAssignRatios?.[jobId] ?? 1;
                    const isEssential = store.essentialJobs?.[jobId] ?? false;

                    return (
                      <div key={jobId} className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 bg-slate-950/20 border theme-border rounded-lg p-2 sm:p-2.5 hover:bg-slate-950/40 transition-all">
                        <div className="flex flex-col flex-1 min-w-[80px]">
                          <span className="text-xs font-bold theme-text-main">{jobDef.name}</span>
                          <span className="text-[10px] theme-text-muted leading-none">Current: {jobCounts[jobId] || 0} Clones</span>
                        </div>

                        {/* WEIGHT CONTROL */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            disabled={currentWeight <= 0}
                            onClick={() => {
                              store.setSmartAssignRatio(jobId, Math.max(0, currentWeight - 1));
                              if (store.soundEnabled) playClickSound('click');
                            }}
                            className={`p-1 rounded theme-bg-hover hover:theme-bg-panel text-slate-400 hover:theme-text-main transition-colors ${
                              currentWeight <= 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                          >
                            <Minus size={11} />
                          </button>
                          <div className="flex flex-col items-center justify-center min-w-[20px]">
                            <span className="text-xs font-mono font-bold theme-text-main">{currentWeight}</span>
                            <span className="text-[8px] theme-text-muted">weight</span>
                          </div>
                          <button
                            disabled={currentWeight >= 10}
                            onClick={() => {
                              store.setSmartAssignRatio(jobId, Math.min(10, currentWeight + 1));
                              if (store.soundEnabled) playClickSound('click');
                            }}
                            className={`p-1 rounded theme-bg-hover hover:theme-bg-panel text-slate-400 hover:theme-text-main transition-colors ${
                              currentWeight >= 10 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                          >
                            <Plus size={11} />
                          </button>
                        </div>

                        {/* ESSENTIAL LOCK BUTTON */}
                        <button
                          onClick={() => {
                            store.toggleEssentialJob(jobId);
                            if (store.soundEnabled) playClickSound('click');
                          }}
                          className={`flex items-center gap-1 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-md border text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            isEssential
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
                              : 'border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {isEssential ? <Lock size={10} /> : <Unlock size={10} />}
                          <span>{isEssential ? 'Essential' : 'Lock'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* COMMAND BUTTONS */}
              <div className="flex gap-2 pt-2 mt-1 border-t theme-border">
                <button
                  onClick={handleFullRebalance}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 text-amber-400 border border-amber-500/30 font-bold uppercase tracking-wider text-[10px] py-2 px-4 rounded-lg cursor-pointer transition-all active:scale-95"
                >
                  <RefreshCw size={12} />
                  <span>Full Rebalance Workforce</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* JOBS SECTION */}
      <div className={`grid grid-cols-1 md:grid-cols-2 transition-all duration-300 ${
        isCompact ? 'gap-3' : 'gap-4 lg:gap-6'
      }`}>
        {(Object.entries(JOBS) as [JobType, typeof JOBS[JobType]][]).map(([id, job]) => {
          if (id === 'miner' && !store.unlocks.minerals) return null;
          if (id === 'scholar' && store.buildings.library === 0) return null;
          if (id === 'priest' && (!store.unlocks.culture || store.buildings.amphitheatre === 0)) return null;
          if (id === 'darkMatterScientist' && !store.unlocks.darkMatter) return null;
          if (id === 'fluidEngineer' && !store.unlocks.fluid) return null;

          const count = jobCounts[id];

          return (
            <div 
              key={id}
              className={`flex flex-col justify-between transition-all duration-300 border theme-border hover:theme-border theme-bg-card/50 backdrop-blur-md ${
                isCompact ? 'p-3.5 gap-2.5' : 'p-5 lg:p-6 gap-4'
              }`}
            >
              <div className={`flex flex-col xl:flex-row xl:items-center justify-between gap-3 w-full`}>
                <div className={`flex items-center min-w-0 transition-all ${isCompact ? 'gap-2.5' : 'gap-4'}`}>
                  <span className={`shrink-0 transition-all ${isCompact ? 'text-xl' : 'text-2xl'}`}>
                    {id === 'farmer' ? '🌱' : id === 'woodcutter' ? '⚡' : id === 'scholar' ? '🔬' : id === 'miner' ? '⛏️' : id === 'darkMatterScientist' ? '🌑' : id === 'fluidEngineer' ? '🧪' : '🔊'}
                  </span>
                  <div className={`min-w-0 flex flex-col ${isCompact ? 'gap-0.5' : 'gap-1.5'}`}>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium tracking-wide theme-text-main leading-none transition-all ${
                        isCompact ? 'text-sm' : 'text-lg'
                      }`}>{job.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenInfo(prev => ({ ...prev, [id]: !prev[id] }));
                        }}
                        className="p-1 rounded-full text-cyan-400 hover:text-cyan-300 hover:bg-white/5 transition-all cursor-pointer inline-flex items-center justify-center shrink-0"
                        title="View description"
                      >
                        <Info size={11} />
                      </button>
                      {count > 0 && (
                        <span className={`font-mono font-bold theme-accent-bg leading-none rounded-sm ${
                          isCompact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'
                        }`}>
                          {count}
                        </span>
                      )}
                    </div>
                    {(!isCompact || openInfo[id]) && job.desc && (
                      <p className={`theme-text-muted font-sans italic leading-snug transition-all ${
                        isCompact ? 'text-[10px]' : 'text-xs'
                      }`}>{job.desc}</p>
                    )}
                    <span className={`text-emerald-500 font-mono leading-none ${isCompact ? 'text-[9px]' : 'text-[10px]'}`}>{job.effectsDesc}</span>
                    {count > 0 && jobStrengths[id as JobType] > count && (
                      <span className="text-[10px] text-emerald-400 font-mono leading-none mt-1">
                        ✨ Output multiplier: {(jobStrengths[id as JobType]).toFixed(2)}x (Clone levels + traits)
                      </span>
                    )}
                  </div>
                </div>

                {/* Direct quick action assigners */}
                <div className="flex items-center gap-1.5 shrink-0 self-start xl:self-center">
                  <button 
                    onClick={() => handleUnassignMultiple(id, store.buyMultiplier === 'max' ? 99999 : (store.buyMultiplier || 1))}
                    disabled={count === 0}
                    className={`flex items-center justify-center bg-transparent border theme-border theme-text-main hover:theme-bg-hover disabled:opacity-20 rounded-full active:scale-95 transition-all cursor-pointer ${
                      isCompact ? 'w-8 h-8' : 'w-10 h-10'
                    }`}
                  >
                    <Minus size={isCompact ? 12 : 14} />
                  </button>

                  <button 
                    onClick={() => handleAutoAssign(id)}
                    className={`flex items-center justify-center uppercase font-bold theme-text-muted hover:theme-text-main transition-colors cursor-pointer ${
                      isCompact ? 'px-2 h-8 text-[9px]' : 'px-3 h-10 text-[10px]'
                    }`}
                  >
                    All
                  </button>

                  <button 
                    onClick={() => handleAssignMultiple(id, store.buyMultiplier === 'max' ? 99999 : (store.buyMultiplier || 1))}
                    disabled={freeKittens === 0}
                    className={`flex items-center justify-center bg-transparent border theme-border theme-text-main hover:theme-bg-hover disabled:opacity-20 rounded-full active:scale-95 transition-all cursor-pointer ${
                      isCompact ? 'w-8 h-8' : 'w-10 h-10'
                    }`}
                  >
                    <Plus size={isCompact ? 12 : 14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* INDIVIDUAL KITTENS POPULATION MATRIX */}
      {kittens.length > 0 && (() => {
        const filteredKittens = kittens.filter((kitten) => {
          if (filterJob === 'all') return true;
          if (filterJob === 'unemployed') return kitten.job === 'unemployed';
          return kitten.job === filterJob;
        });

        const sortedKittens = [...filteredKittens].sort((a, b) => {
          if (sortBy === 'level-desc') return b.level - a.level;
          if (sortBy === 'level-asc') return a.level - b.level;
          if (sortBy === 'name') {
            const nameA = `${a.name} ${a.surname}`.toLowerCase();
            const nameB = `${b.name} ${b.surname}`.toLowerCase();
            return nameA.localeCompare(nameB);
          }
          return 0;
        });

        const maxItemsPerPage = isCompact ? 8 : 12;
        const totalItems = sortedKittens.length;
        const totalPages = Math.ceil(totalItems / maxItemsPerPage) || 1;
        const activePage = Math.min(currentPage, totalPages);
        const startIndex = (activePage - 1) * maxItemsPerPage;
        const paginatedKittens = sortedKittens.slice(startIndex, startIndex + maxItemsPerPage);

        return (
          <div className="mt-8 mx-2 sm:mx-6 select-none animate-fadeIn border theme-border rounded-xl theme-bg-card/30 overflow-hidden">
            <div 
              onClick={() => {
                setClonesOpen(!clonesOpen);
                if (store.soundEnabled) playClickSound('click');
              }}
              className="flex justify-between items-center p-4 cursor-pointer hover:bg-slate-950/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Users size={14} className="text-cyan-400 shrink-0" />
                <span className="text-[10px] sm:text-xs uppercase font-bold theme-text-main tracking-widest leading-none">
                  Portal Clone Directory ({kittens.length})
                </span>
              </div>
              <div className="theme-text-muted hover:theme-text-main transition-colors">
                {clonesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>

            {clonesOpen && (
              <div className="p-3 sm:p-4 border-t theme-border">
                {/* Filters and Sort Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 pb-4 border-b theme-border">
                  <div className="flex items-center gap-2">
                    <Filter size={13} className="theme-text-muted shrink-0" />
                    <select
                      value={filterJob}
                      onChange={(e) => {
                        setFilterJob(e.target.value);
                        if (store.soundEnabled) playClickSound('click');
                      }}
                      className="w-full theme-bg-app border theme-border theme-text-main text-[11px] px-2.5 py-1.5 focus:outline-none focus:theme-border cursor-pointer font-sans rounded font-semibold"
                    >
                      <option value="all">Filter: All Clones</option>
                      <option value="unemployed">Filter: 💤 Idle</option>
                      <option value="farmer">Filter: 🌱 Mega Seeds</option>
                      <option value="woodcutter">Filter: ⚡ Plutonium</option>
                      {store.buildings.library > 0 && (
                        <option value="scholar">Filter: 🔬 Portal Tech</option>
                      )}
                      {store.unlocks.minerals && (
                        <option value="miner">Filter: ⛏️ Crystals</option>
                      )}
                      {store.unlocks.culture && store.buildings.amphitheatre > 0 && (
                        <option value="priest">Filter: 🔊 Schwifty Vibes</option>
                      )}
                      {store.unlocks.darkMatter && (
                        <option value="darkMatterScientist">Filter: 🌑 Dark Matter</option>
                      )}
                      {store.unlocks.fluid && (
                        <option value="fluidEngineer">Filter: 🧪 Portal Fluid</option>
                      )}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <ArrowUpDown size={13} className="theme-text-muted shrink-0" />
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value as any);
                        if (store.soundEnabled) playClickSound('click');
                      }}
                      className="w-full theme-bg-app border theme-border theme-text-main text-[11px] px-2.5 py-1.5 focus:outline-none focus:theme-border cursor-pointer font-sans rounded font-semibold"
                    >
                      <option value="level-desc">Sort: Highest Gen (Level)</option>
                      <option value="level-asc">Sort: Lowest Gen (Level)</option>
                      <option value="name">Sort: Name (A-Z)</option>
                    </select>
                  </div>
                </div>

                {paginatedKittens.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 animate-fadeIn">
                    {paginatedKittens.map((kitten) => {
                      const jobEmoji = 
                        kitten.job === 'farmer' ? '🌱' : 
                        kitten.job === 'woodcutter' ? '⚡' : 
                        kitten.job === 'scholar' ? '🔬' : 
                        kitten.job === 'miner' ? '⛏️' : 
                        kitten.job === 'darkMatterScientist' ? '🌑' : 
                        kitten.job === 'fluidEngineer' ? '🧪' : 
                        kitten.job === 'priest' ? '🔊' : '💤';

                      return (
                        <div 
                          key={kitten.id}
                          className="p-2 sm:p-2.5 border theme-border hover:theme-border-active transition-all theme-bg-card flex flex-row items-center justify-between gap-3 rounded-lg shadow-sm"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-slate-950/25">
                              {jobEmoji}
                            </span>
                            <div className="min-w-0">
                              <span className="font-bold text-[11px] sm:text-xs tracking-wide theme-text-main block truncate leading-tight">
                                {kitten.name} {kitten.surname}
                              </span>
                              <span className="text-[9px] theme-text-muted font-mono block uppercase">
                                GEN {kitten.level} • {kitten.trait || 'Normal'}
                              </span>
                            </div>
                          </div>

                          {/* Job Dropdown Selection */}
                          <select
                            value={kitten.job}
                            onChange={(e) => handleAssignJob(kitten.id, e.target.value as JobType | 'unemployed')}
                            className="theme-bg-app border theme-border theme-text-main text-[10px] px-2 py-1 shrink-0 focus:outline-none focus:theme-border cursor-pointer font-sans rounded max-w-[110px] xs:max-w-[130px] text-right sm:text-left font-semibold"
                          >
                            <option value="unemployed">💤 Idle</option>
                            <option value="farmer">🌱 Mega Seeds</option>
                            <option value="woodcutter">⚡ Plutonium</option>
                            {store.buildings.library > 0 && (
                              <option value="scholar">🔬 Portal Tech</option>
                            )}
                            {store.unlocks.minerals && (
                              <option value="miner">⛏️ Crystals</option>
                            )}
                            {store.unlocks.culture && store.buildings.amphitheatre > 0 && (
                              <option value="priest">🔊 Schwifty Vibes</option>
                            )}
                            {store.unlocks.darkMatter && (
                              <option value="darkMatterScientist">🌑 Dark Matter</option>
                            )}
                            {store.unlocks.fluid && (
                              <option value="fluidEngineer">🧪 Portal Fluid</option>
                            )}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <span className="text-lg mb-1">🔍</span>
                    <span className="text-[10px] uppercase tracking-widest font-black theme-text-muted">No clones match filters</span>
                  </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-3 border-t theme-border text-[9px] font-mono font-bold uppercase tracking-widest">
                    <button
                      disabled={activePage === 1}
                      onClick={() => {
                        setCurrentPage(prev => Math.max(1, prev - 1));
                        if (store.soundEnabled) playClickSound('click');
                      }}
                      className={`flex items-center gap-1 px-2 py-1 rounded border theme-border transition-all cursor-pointer ${
                        activePage === 1 
                          ? 'opacity-30 cursor-not-allowed theme-text-muted' 
                          : 'theme-bg-hover hover:theme-bg-panel theme-text-main'
                      }`}
                    >
                      <ChevronLeft size={11} />
                      <span>Prev</span>
                    </button>

                    <span className="theme-text-muted font-bold text-[9px]">
                      Page <span className="theme-text-main">{activePage}</span> of <span className="theme-text-main">{totalPages}</span>
                    </span>

                    <button
                      disabled={activePage === totalPages}
                      onClick={() => {
                        setCurrentPage(prev => Math.min(totalPages, prev + 1));
                        if (store.soundEnabled) playClickSound('click');
                      }}
                      className={`flex items-center gap-1 px-2 py-1 rounded border theme-border transition-all cursor-pointer ${
                        activePage === totalPages 
                          ? 'opacity-30 cursor-not-allowed theme-text-muted' 
                          : 'theme-bg-hover hover:theme-bg-panel theme-text-main'
                      }`}
                    >
                      <span>Next</span>
                      <ChevronRight size={11} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

    </div>
  );
}
