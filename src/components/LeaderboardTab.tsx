import React, { useEffect, useState } from 'react';
import { Trophy, Clock, Dna, Sparkles, BarChart3 } from 'lucide-react';
import { getLeaderboard } from '../lib/firebase';
import { GameState } from '../types';

interface LeaderboardTabProps {
  store: GameState;
}

export default function LeaderboardTab({ store }: LeaderboardTabProps) {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getLeaderboard()
      .then((data) => {
        if (mounted) {
          setLeaders(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error fetching leaderboard", err);
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const formatTimeMs = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
  };

  const stats = store.lifetimeStats || { totalTimePlayed: 0, totalMortysBorn: 0, totalResourcesHarvested: 0 };

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto p-6 animate-fade-in">
      {/* Statistics Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-black theme-text-main flex items-center gap-3">
          <BarChart3 className="text-[#00b0c8] drop-shadow-md" />
          Persistent Multiversal Statistics
        </h2>
        <p className="text-sm theme-text-muted">
          Your personal space-time coordinates and persistent lifetime player metrics. These records are hard-linked to your portal keys and survive dimensional resets.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Time in Dimension */}
          <div className="theme-bg-panel border theme-border rounded-xl p-5 hover:border-[#00b0c8]/50 transition-all flex flex-col gap-2 relative overflow-hidden group">
            <div className="absolute right-3 top-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Clock size={40} className="text-[#00b0c8]" />
            </div>
            <div className="text-xs font-bold uppercase tracking-wider theme-text-muted">Time In Current Dimension</div>
            <div className="text-xl font-black text-[#00b0c8] font-mono tracking-tight">
              {formatTimeMs(store.dimensionEnterTime ? Date.now() - store.dimensionEnterTime : 0)}
            </div>
            <div className="text-[10px] theme-text-muted font-semibold mt-auto">
              Current Dimension: <span className="theme-text-sec">{store.currentDimension}</span>
            </div>
          </div>

          {/* Metric 2: Lifetime Playtime */}
          <div className="theme-bg-panel border theme-border rounded-xl p-5 hover:border-amber-400/50 transition-all flex flex-col gap-2 relative overflow-hidden group">
            <div className="absolute right-3 top-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Clock size={40} className="text-amber-400" />
            </div>
            <div className="text-xs font-bold uppercase tracking-wider theme-text-muted">Total Lifetime Playtime</div>
            <div className="text-xl font-black text-amber-400 font-mono tracking-tight">
              {formatTimeMs(Math.round(stats.totalTimePlayed * 1000))}
            </div>
            <div className="text-[10px] theme-text-muted font-semibold mt-auto">
              Accumulated across all resets
            </div>
          </div>

          {/* Metric 3: Total Mortys Born */}
          <div className="theme-bg-panel border theme-border rounded-xl p-5 hover:border-[#39ff14]/50 transition-all flex flex-col gap-2 relative overflow-hidden group">
            <div className="absolute right-3 top-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Dna size={40} className="text-[#39ff14]" />
            </div>
            <div className="text-xs font-bold uppercase tracking-wider theme-text-muted">Total Mortys Born</div>
            <div className="text-xl font-black text-[#39ff14] font-mono tracking-tight">
              {stats.totalMortysBorn?.toLocaleString() || 0}
            </div>
            <div className="text-[10px] theme-text-muted font-semibold mt-auto">
              Alternate-dimension clones
            </div>
          </div>

          {/* Metric 4: Total Resources Harvested */}
          <div className="theme-bg-panel border theme-border rounded-xl p-5 hover:border-purple-400/50 transition-all flex flex-col gap-2 relative overflow-hidden group">
            <div className="absolute right-3 top-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles size={40} className="text-purple-400" />
            </div>
            <div className="text-xs font-bold uppercase tracking-wider theme-text-muted">Total Harvested</div>
            <div className="text-xl font-black text-purple-400 font-mono tracking-tight">
              {Math.round(stats.totalResourcesHarvested || 0).toLocaleString()}
            </div>
            <div className="text-[10px] theme-text-muted font-semibold mt-auto">
              Raw materials produced
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black theme-text-main flex items-center gap-3">
            <Trophy className="text-[#39ff14] drop-shadow-md" />
            Multiversal Leaderboard
          </h2>
        </div>

        <div className="theme-bg-panel border theme-border rounded-2xl p-6">
          {loading ? (
            <div className="text-center py-10 theme-text-muted animate-pulse font-bold">
              Scanning the multiverse for top Ricks...
            </div>
          ) : leaders.length === 0 ? (
            <div className="text-center py-10 theme-text-muted">
              No active pilots found in the Citadel Cloud.
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b theme-border text-xs uppercase tracking-widest theme-text-muted">
                    <th className="pb-3 px-4 font-black w-16">Rank</th>
                    <th className="pb-3 px-4 font-black">Pilot Name</th>
                    <th className="pb-3 px-4 font-black">Dimension</th>
                    <th className="pb-3 px-4 font-black">Time in Dimension</th>
                    <th className="pb-3 px-4 font-black text-right">Portal Flux</th>
                  </tr>
                </thead>
                <tbody>
                  {leaders.map((leader, i) => (
                    <tr 
                      key={leader.id} 
                      className="border-b theme-border last:border-0 hover:bg-black/5 transition-colors"
                    >
                      <td className="py-4 px-4 font-black theme-text-main">
                        #{i + 1}
                      </td>
                      <td className="py-4 px-4 font-bold theme-text-main flex items-center gap-2">
                        {leader.username}
                      </td>
                      <td className="py-4 px-4 text-sm theme-text-sec">
                        {leader.currentDimension || 'Unknown'}
                      </td>
                      <td className="py-4 px-4 text-sm theme-text-muted font-mono flex items-center gap-1.5">
                        <Clock size={12} />
                        {formatTimeMs(leader.timeStayedMs || 0)}
                      </td>
                      <td className="py-4 px-4 text-right font-black text-[#00b0c8]">
                        {leader.fluxScore?.toLocaleString() || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <div className="theme-bg-card border theme-border rounded-xl p-4 text-xs theme-text-muted">
        Your current dimension time: <strong className="theme-text-sec">{formatTimeMs(store.dimensionEnterTime ? Date.now() - store.dimensionEnterTime : 0)}</strong>
        <br/>
        Save your game in Settings to update your leaderboard ranking and back up your persistent statistics.
      </div>
    </div>
  );
}
