import React, { useState } from 'react';
import { GameState } from '../types';
import { ACHIEVEMENTS, Achievement } from '../utils/achievements';
import { Award, Lock, Sparkles, Filter, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface AchievementsTabProps {
  store: GameState;
}

export default function AchievementsTab({ store }: AchievementsTabProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'resources' | 'citadel' | 'citizens' | 'quantum'>('all');
  
  const achievementsRecord = store.achievements || {};
  const unlockedCount = ACHIEVEMENTS.filter((ach) => achievementsRecord[ach.id]).length;
  const totalCount = ACHIEVEMENTS.length;
  const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const filteredAchievements = ACHIEVEMENTS.filter((ach) => {
    if (activeFilter === 'all') return true;
    return ach.category === activeFilter;
  });

  // Category label helper
  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'resources':
        return { 
          label: 'Resources', 
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_2px_8px_-3px_rgba(16,185,129,0.1)]' 
        };
      case 'citadel':
        return { 
          label: 'Citadel', 
          badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-[0_2px_8px_-3px_rgba(14,165,233,0.1)]' 
        };
      case 'citizens':
        return { 
          label: 'Citizens', 
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_2px_8px_-3px_rgba(245,158,11,0.1)]' 
        };
      case 'quantum':
        return { 
          label: 'Quantum', 
          badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_2px_8px_-3px_rgba(168,85,247,0.1)]' 
        };
      default:
        return { 
          label: 'General', 
          badge: 'bg-neutral-500/10 theme-text-muted border-neutral-500/20' 
        };
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto animate-fade-in pb-12">
      
      {/* HEADER SECTION & STATISTICS BENTO CARD */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/[0.06] pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black theme-text-main tracking-tight flex items-center gap-3">
            <Award className="text-[#39ff14] drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]" size={32} />
            <span>Citadel Registry</span>
          </h2>
          <p className="text-xs theme-text-muted tracking-widest uppercase font-extrabold mt-1.5 font-sans">
            Central Multiversal Milestone & Dimension Badges
          </p>
        </div>

        {/* PROGRESS CARD - PRECISE HIGH-CONTRAST DATA VIZ */}
        <div className="theme-bg-panel border border-white/[0.05] rounded-2xl p-5 flex items-center gap-5 lg:max-w-md w-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#39ff14]/[0.01] rounded-full filter blur-2xl group-hover:bg-[#39ff14]/[0.02] transition-colors duration-500" />
          
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-neutral-800"
                strokeWidth="2.8"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#39ff14] transition-all duration-1000 ease-out"
                strokeWidth="2.8"
                dasharray={`${completionPercentage}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-sm font-black theme-text-main font-mono">
              {completionPercentage}%
            </div>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase tracking-wider theme-text-muted font-black leading-none mb-1">
              Registry Progress
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#39ff14] tracking-tight">{unlockedCount}</span>
              <span className="text-sm theme-text-muted font-bold">/</span>
              <span className="text-base theme-text-muted font-bold">{totalCount}</span>
              <span className="text-xs theme-text-muted font-medium ml-1">badges unlocked</span>
            </div>
            {completionPercentage === 100 ? (
              <span className="text-[10px] text-[#39ff14] font-bold mt-1 animate-pulse">
                Ultimate Rick Achieved! 🌀
              </span>
            ) : (
              <span className="text-[10px] theme-text-muted mt-1 font-medium">
                Keep warping dimensions to complete the registry.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* HORIZONTAL FILTERS SELECTION RAIL */}
      <div className="flex flex-col gap-3">
        <div className="flex overflow-x-auto whitespace-nowrap scrollbar-none items-center gap-2 py-1">
          <span className="text-2xs uppercase tracking-widest theme-text-muted font-black mr-2 flex items-center gap-1 shrink-0 font-sans">
            <Filter size={11} className="text-[#39ff14]" /> Filter Category:
          </span>
          
          {([
            { id: 'all', label: 'All Milestones 🏆' },
            { id: 'resources', label: 'Resources 🟢' },
            { id: 'citadel', label: 'Citadel 🌀' },
            { id: 'citizens', label: 'Citizens 👦' },
            { id: 'quantum', label: 'Quantum 🧪' }
          ] as const).map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 text-xs font-bold tracking-wide rounded-xl border cursor-pointer select-none transition-all duration-200 shrink-0 ${
                  isActive
                    ? 'bg-[#39ff14]/10 text-[#39ff14] border-[#39ff14]/30 font-black shadow-[0_2px_12px_rgba(57,255,20,0.1)]'
                    : 'theme-bg-panel border-white/[0.04] theme-text-muted hover:theme-text-main hover:border-white/[0.1]'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ACHIEVEMENTS CARDS BENTO GRID */}
      {filteredAchievements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed border-white/[0.06] rounded-2xl theme-bg-panel max-w-xl mx-auto w-full">
          <AlertCircle className="theme-text-muted mb-3" size={40} />
          <h4 className="text-base theme-text-main font-bold mb-1">No Badges Locked in this Dimension</h4>
          <p className="text-xs theme-text-muted max-w-xs leading-relaxed">
            Warp to other timelines or adjust your active filters to locate missing milestones.
          </p>
          <button 
            onClick={() => setActiveFilter('all')}
            className="text-xs text-[#39ff14] mt-4 font-bold border border-[#39ff14]/30 px-3 py-1.5 rounded-lg hover:bg-[#39ff14]/5 transition-all cursor-pointer"
          >
            Show All Milestones
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-2">
          {filteredAchievements.map((ach) => {
            const isUnlocked = Boolean(achievementsRecord[ach.id]);
            const catTheme = getCategoryTheme(ach.category);
            
            return (
              <motion.div
                key={ach.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className={`group p-6 rounded-2xl border flex flex-col justify-between gap-5 relative overflow-hidden transition-all duration-300 ${
                  isUnlocked
                    ? 'theme-bg-panel border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.1)] hover:border-[#39ff14]/40 hover:shadow-[0_8px_32px_-4px_rgba(57,255,20,0.06)] opacity-100'
                    : 'bg-[#12161a]/40 border-white/[0.02] opacity-60 hover:opacity-85 hover:border-white/[0.06] transition-opacity duration-300'
                }`}
              >
                {/* Visual Glow Layer for Unlocked badging */}
                {isUnlocked && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#39ff14]/[0.01] rounded-full filter blur-xl group-hover:bg-[#39ff14]/[0.03] transition-colors duration-500 pointer-events-none" />
                )}

                <div className="flex flex-col gap-4 relative z-10">
                  {/* Category Pill and Status Indicator */}
                  <div className="flex justify-between items-center gap-2">
                    <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-1 rounded-md border ${catTheme.badge}`}>
                      {catTheme.label}
                    </span>
                    
                    {isUnlocked ? (
                      <span className="text-[10px] text-[#39ff14] font-black flex items-center gap-1 font-mono tracking-tight">
                        <CheckCircle2 size={12} className="text-[#39ff14]" /> UNLOCKED
                      </span>
                    ) : (
                      <span className="text-[10px] theme-text-muted font-bold flex items-center gap-1 font-mono tracking-tight">
                        <Lock size={10} className="text-neutral-600" /> LOCKED
                      </span>
                    )}
                  </div>

                  {/* Title and Badge Icon Frame */}
                  <div className="flex items-center gap-4">
                    <div 
                      className={`text-3xl shrink-0 w-14 h-14 rounded-xl border flex items-center justify-center transition-all duration-300 ${
                        isUnlocked 
                          ? 'bg-gradient-to-br from-[#161f26] to-[#0e141a] border-white/[0.08] group-hover:border-[#39ff14]/30 scale-100 shadow-[0_4px_12px_rgba(0,0,0,0.15)] group-hover:shadow-[0_4px_16px_rgba(57,255,20,0.05)]' 
                          : 'bg-black/20 border-white/[0.03] scale-95 grayscale'
                      }`}
                    >
                      <span className={isUnlocked ? 'group-hover:scale-110 transition-transform duration-300' : ''}>
                        {ach.badgeEmoji}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h4 className={`font-black text-base tracking-tight leading-snug ${
                        isUnlocked ? 'theme-text-main group-hover:text-[#39ff14] transition-colors' : 'theme-text-muted'
                      }`}>
                        {ach.name}
                      </h4>
                      <p className="text-[9px] theme-text-muted font-mono mt-0.5 uppercase tracking-wider">
                        {isUnlocked ? `ID // ${ach.id}` : 'CLASSIFIED TIMELINE'}
                      </p>
                    </div>
                  </div>

                  {/* Badges Description */}
                  <p className={`text-xs leading-relaxed font-sans ${isUnlocked ? 'theme-text-sec' : 'text-neutral-500'}`}>
                    {ach.desc}
                  </p>
                </div>

                {/* Bottom Footer Section (Quote OR Requirements Check) */}
                <div className="mt-1 pt-4 border-t border-white/[0.05] relative z-10 flex flex-col gap-2">
                  {isUnlocked ? (
                    <div className="flex flex-col gap-1.5 pl-3 border-l-2 border-[#39ff14]/20 group-hover:border-[#39ff14]/40 transition-colors">
                      <span className="text-[8px] uppercase font-black text-[#39ff14] tracking-widest font-sans flex items-center gap-1 leading-none">
                        <Sparkles size={10} /> RICK SAYS
                      </span>
                      <p className="text-2xs font-serif text-neutral-400 italic leading-relaxed tracking-wide">
                        &ldquo;{ach.quote}&rdquo;
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[8px] uppercase font-black text-neutral-600 tracking-widest font-sans leading-none">
                        REQUIREMENTS
                      </span>
                      <p className="text-2xs text-neutral-500 font-bold font-mono leading-normal bg-black/10 px-2 py-1.5 rounded-md border border-white/[0.01]">
                        {ach.conditionDesc}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
