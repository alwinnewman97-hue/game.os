import React from 'react';
import { GameState, JobType } from '../types';
import { JOBS } from '../gameData';
import { playClickSound } from '../utils/audio';
import { 
  Smile, 
  Frown, 
  Plus, 
  Minus, 
  Users, 
  Briefcase, 
  Sparkles
} from 'lucide-react';

interface TownTabProps {
  store: GameState;
}

export default function TownTab({ store }: TownTabProps) {
  const kittens = Array.isArray(store.village?.kittens) ? store.village.kittens : [];
  const maxKittens = store.village?.maxKittens || 0;

  const jobCounts: Record<JobType | 'unemployed', number> = {
    farmer: 0,
    woodcutter: 0,
    scholar: 0,
    miner: 0,
    priest: 0,
    unemployed: 0
  };

  kittens.forEach((k) => {
    if (k && k.job && jobCounts[k.job] !== undefined) {
      jobCounts[k.job]++;
    }
  });

  const freeKittens = jobCounts.unemployed;

  const handleAssignJob = (kittenId: string, job: JobType | 'unemployed') => {
    store.assignJob(kittenId, job);
    if (store.soundEnabled) playClickSound('click');
  };

  const handleAssignMultiple = (job: JobType, countToAssign: number) => {
    const idleKittens = kittens.filter(k => k.job === 'unemployed').slice(0, countToAssign);
    if (idleKittens.length > 0) {
      idleKittens.forEach(k => store.assignJob(k.id, job));
      if (store.soundEnabled) playClickSound('click');
    }
  };

  const handleUnassignMultiple = (job: JobType, countToUnassign: number) => {
    const assignedKittens = kittens.filter(k => k.job === job).slice(0, countToUnassign);
    if (assignedKittens.length > 0) {
      assignedKittens.forEach(k => store.assignJob(k.id, 'unemployed'));
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

  return (
    <div className="flex flex-col flex-1 pb-10">
      
      {/* COMPACT TOWN HUD */}
      <div className="flex justify-between items-center pb-6 border-b border-white/5 mx-2 sm:mx-6 mt-4">
        <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest leading-none">Clone Command Centre</span>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm select-none">
          <div className="flex items-center gap-2 font-mono theme-text-main leading-none">
            <Users size={14} className="text-neutral-500" />
            <span>{kittens.length}<span className="text-neutral-600">/{maxKittens}</span></span>
          </div>

          <div className="flex items-center gap-2 text-neutral-500 font-mono leading-none">
            <span>Moraly: {store.village.happiness}%</span>
          </div>

          <div className={`font-mono leading-none ${freeKittens > 0 ? 'text-cyan-400 font-bold' : 'text-neutral-600'}`}>
            Idle: {freeKittens}
          </div>
        </div>
      </div>

      {/* QUICK LABOUR ACTIONS */}
      <div className="flex items-center gap-3 mx-2 sm:mx-6 mt-6 mb-8 select-none">
        {kittens.length < maxKittens && (
          <button
            onClick={() => {
              store.forceAddKitten();
              if (store.soundEnabled) playClickSound('success');
            }}
            className="text-[10px] uppercase tracking-widest font-bold theme-text-main bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full transition-all active:scale-95 cursor-pointer"
          >
            Clone Alternate
          </button>
        )}

        {kittens.length > 0 && freeKittens < kittens.length && (
          <button
            onClick={handleUnassignAll}
            className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 border border-white/10 hover:text-white px-6 py-3 rounded-full transition-colors cursor-pointer"
          >
            Recall All
          </button>
        )}
      </div>

      {/* JOBS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {(Object.entries(JOBS) as [JobType, typeof JOBS[JobType]][]).map(([id, job]) => {
          if (id === 'miner' && !store.unlocks.minerals) return null;
          if (id === 'scholar' && store.buildings.library === 0) return null;
          if (id === 'priest' && !store.unlocks.culture) return null;

          const count = jobCounts[id];

          return (
            <div 
              key={id}
              className="p-5 lg:p-6 flex flex-col justify-between gap-4 transition-all duration-[400ms] ease-out border theme-border hover:border-white/40 theme-bg-card/50 backdrop-blur-md"
            >
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 w-full">
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-2xl shrink-0">
                    {id === 'farmer' ? '🌱' : id === 'woodcutter' ? '⚡' : id === 'scholar' ? '🔬' : id === 'miner' ? '⛏️' : '🔊'}
                  </span>
                  <div className="min-w-0 flex flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-lg tracking-wide theme-text-main leading-none">{job.name}</span>
                      {count > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-white text-black leading-none rounded-sm">
                          {count}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-emerald-500 font-mono leading-none">{job.effectsDesc}</span>
                  </div>
                </div>

                {/* Direct quick action assigners */}
                <div className="flex items-center gap-2 shrink-0 self-start xl:self-center">
                  <button 
                    onClick={() => handleUnassignMultiple(id, store.buyMultiplier || 1)}
                    disabled={count === 0}
                    className="w-10 h-10 flex items-center justify-center bg-transparent border border-white/20 text-white hover:bg-white/10 disabled:opacity-20 rounded-full active:scale-95 transition-all cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>

                  <button 
                    onClick={() => handleAutoAssign(id)}
                    className="px-3 h-10 flex items-center justify-center text-[10px] uppercase font-bold text-neutral-500 hover:text-white transition-colors cursor-pointer"
                  >
                    All
                  </button>

                  <button 
                    onClick={() => handleAssignMultiple(id, store.buyMultiplier || 1)}
                    disabled={freeKittens === 0}
                    className="w-10 h-10 flex items-center justify-center bg-transparent border border-white/20 text-white hover:bg-white/10 disabled:opacity-20 rounded-full active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* INDIVIDUAL KITTENS POPULATION MATRIX */}
      {kittens.length > 0 && (
        <div className="mt-12 mx-2 sm:mx-6 select-none animate-fadeIn">
          <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest leading-none block mb-6">Portal Clone Directory</span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fadeIn">
            {kittens.map((kitten) => (
              <div 
                key={kitten.id}
                className="p-4 border border-white/5 hover:border-white/20 transition-colors bg-white/[0.02] flex flex-col justify-between gap-4"
              >
                <div className="min-w-0">
                  <span className="font-bold text-sm tracking-wide theme-text-main block truncate leading-tight mb-1.5 text-neutral-200">
                    {kitten.name} {kitten.surname}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono truncate block uppercase">
                    GEN {kitten.level} • {kitten.trait}
                  </span>
                </div>

                {/* Job Dropdown Selection */}
                <select
                  value={kitten.job}
                  onChange={(e) => handleAssignJob(kitten.id, e.target.value as any)}
                  className="bg-black border border-white/10 text-white text-[11px] px-3 py-2 shrink-0 focus:outline-none focus:border-white/40 cursor-pointer font-sans"
                >
                  <option value="unemployed">💤 Idle</option>
                  <option value="farmer">🌱 Mega-Seed Cultivator</option>
                  <option value="woodcutter">⚡ Plutonium Harvester</option>
                  {store.buildings.library > 0 && (
                    <option value="scholar">🔬 Lab Assistant</option>
                  )}
                  {store.unlocks.minerals && (
                    <option value="miner">⛏️ Crystal Digger</option>
                  )}
                  {store.unlocks.culture && (
                    <option value="priest">🔊 Schwifty Chanter</option>
                  )}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
