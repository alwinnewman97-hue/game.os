import React, { useEffect, useState } from 'react';
import { Trophy, Clock } from 'lucide-react';
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

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-6 animate-fade-in">
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
      
      <div className="theme-bg-card border theme-border rounded-xl p-4 text-xs theme-text-muted">
        Your current dimension time: <strong className="theme-text-sec">{formatTimeMs(store.dimensionEnterTime ? Date.now() - store.dimensionEnterTime : 0)}</strong>
        <br/>
        Save your game in Settings to update your leaderboard ranking.
      </div>
    </div>
  );
}
