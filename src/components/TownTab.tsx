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
    <div className="flex flex-col gap-4 p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto">
      
      {/* COMPACT TOWN HUD */}
      <div className="theme-bg-card border theme-border p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <div className="flex items-center gap-1.5 font-bold theme-text-main">
            <Users size={14} className="theme-text-sec" />
            <span>Kittens: {kittens.length}/{maxKittens}</span>
          </div>

          <div className="flex items-center gap-1 theme-text-sec">
            <span>Morale: {store.village.happiness}%</span>
          </div>

          <div className={`font-medium ${freeKittens > 0 ? 'text-amber-400 font-bold' : 'theme-text-muted'}`}>
            Idle labor: {freeKittens}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {kittens.length < maxKittens && (
            <button
              onClick={() => {
                store.forceAddKitten();
                if (store.soundEnabled) playClickSound('success');
              }}
              className="text-[10px] uppercase font-extrabold theme-text-main bg-amber-400 px-2.5 py-1.5 rounded transition-all active:scale-[0.98] cursor-pointer"
            >
              Hire Stray
            </button>
          )}

          {kittens.length > 0 && freeKittens < kittens.length && (
            <button
              onClick={handleUnassignAll}
              className="text-[10px] uppercase font-bold theme-text-muted border theme-border hover:theme-text-main px-2.5 py-1.5 rounded transition-colors cursor-pointer"
            >
              Recall All
            </button>
          )}
        </div>
      </div>

      {/* JOBS SECTION */}
      <div>
        <div className="space-y-1.5">
          {(Object.entries(JOBS) as [JobType, typeof JOBS[JobType]][]).map(([id, job]) => {
            // Unlocks preconditions
            if (id === 'miner' && !store.unlocks.minerals) return null;
            if (id === 'scholar' && store.buildings.library === 0) return null;
            if (id === 'priest' && !store.unlocks.culture) return null;

            const count = jobCounts[id];

            return (
              <div 
                key={id}
                className="theme-bg-card border theme-border p-2.5 rounded-xl flex items-center justify-between gap-4 hover:theme-border-active transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-sm shrink-0">
                    {id === 'farmer' ? '🌾' : id === 'woodcutter' ? '📯' : id === 'scholar' ? '🧪' : id === 'miner' ? '⛏️' : '🔥'}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs theme-text-main leading-none">{job.name}</span>
                      {count > 0 && (
                        <span className="text-[9px] font-mono theme-text-main bg-neutral-500/10 px-1.5 py-0.2 rounded font-black">
                          {count}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-emerald-500 font-mono inline-block mt-0.5">{job.effectsDesc}</span>
                  </div>
                </div>

                {/* Direct quick action assigners */}
                <div className="flex items-center gap-1 shrink-0">
                  <button 
                    onClick={() => handleUnassignMultiple(id, store.buyMultiplier || 1)}
                    disabled={count === 0}
                    className="w-8 h-8 flex items-center justify-center theme-bg-app border theme-border theme-text-sec hover:theme-text-main disabled:opacity-20 rounded-lg active:scale-95 transition-all font-bold cursor-pointer"
                  >
                    <Minus size={11} />
                  </button>

                  <button 
                    onClick={() => handleAutoAssign(id)}
                    className="px-2 py-1 text-[9px] uppercase font-black theme-text-muted hover:theme-text-main transition-colors cursor-pointer"
                  >
                    All
                  </button>

                  <button 
                    onClick={() => handleAssignMultiple(id, store.buyMultiplier || 1)}
                    disabled={freeKittens === 0}
                    className="w-8 h-8 flex items-center justify-center theme-bg-app border theme-border theme-text-sec hover:theme-text-main disabled:opacity-20 rounded-lg active:scale-95 transition-all font-bold cursor-pointer"
                  >
                    <Plus size={11} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* INDIVIDUAL KITTENS POPULATION MATRIX */}
      {kittens.length > 0 && (
        <div className="mt-1">
          <span className="text-[10px] uppercase font-black tracking-widest theme-text-muted block mb-2">Guild Registry</span>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
            {kittens.map((kitten) => (
              <div 
                key={kitten.id}
                className="theme-bg-card border theme-border p-2 rounded-lg flex items-center justify-between gap-3 hover:theme-border-active transition-colors"
              >
                <div className="min-w-0">
                  <span className="font-extrabold text-[11px] theme-text-main block truncate leading-tight">
                    {kitten.name} {kitten.surname}
                  </span>
                  <span className="text-[9px] theme-text-sec font-mono truncate block mt-0.5">
                    LVL {kitten.level} • {kitten.trait}
                  </span>
                </div>

                {/* Job Dropdown Selection */}
                <select
                  value={kitten.job}
                  onChange={(e) => handleAssignJob(kitten.id, e.target.value as any)}
                  className="theme-bg-panel border theme-border theme-text-main text-[10px] px-1 py-0.5 rounded w-24 shrink-0 focus:outline-none focus:border-neutral-400 cursor-pointer font-sans"
                >
                  <option value="unemployed">💤 Idle</option>
                  <option value="farmer">🌾 Farm</option>
                  <option value="woodcutter">🪓 Wood</option>
                  {store.buildings.library > 0 && (
                    <option value="scholar">🧪 Scholar</option>
                  )}
                  {store.unlocks.minerals && (
                    <option value="miner">⛏️ Miner</option>
                  )}
                  {store.unlocks.culture && (
                    <option value="priest">🔥 Priest</option>
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
