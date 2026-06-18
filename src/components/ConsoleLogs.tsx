import React from 'react';
import { GameLogMessage } from '../types';
import { Terminal, ShieldAlert } from 'lucide-react';

interface ConsoleLogsProps {
  logs: GameLogMessage[];
}

export default function ConsoleLogs({ logs }: ConsoleLogsProps) {
  return (
    <div className="w-full theme-bg-card border theme-border rounded-lg p-2.5 sm:p-4 font-mono text-xs flex flex-col h-28 sm:h-40 max-h-28 sm:max-h-40 overflow-hidden shadow-inner">
      <div className="flex items-center gap-2 pb-2 mb-2 border-b theme-border theme-text-sec justify-between">
        <div className="flex items-center gap-2 uppercase tracking-widest text-[10px]">
          <Terminal size={14} className="theme-text-sec" />
          <span>Village Chronicles Log</span>
        </div>
        <span className="text-[9px] theme-text-muted font-sans">Shows latest 80 logs</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5">
        {logs.length === 0 ? (
          <div className="theme-text-muted italic">No events logged yet. The kittens sleep peacefully.</div>
        ) : (
          logs.map((log) => {
            let colorClass = 'theme-text-sec';
            let bgClass = 'bg-transparent';
            
            if (log.type === 'success') {
              colorClass = 'theme-text-main font-bold border-l border-neutral-500/50 pl-1.5';
            } else if (log.type === 'warn') {
              colorClass = 'theme-text-sec font-medium';
            } else if (log.type === 'season') {
              colorClass = 'theme-text-main font-bold';
              bgClass = 'bg-neutral-500/10 px-1 py-0.5 rounded';
            } else if (log.type === 'death') {
              colorClass = 'text-red-500 font-bold';
              bgClass = 'bg-red-500/10 px-1 py-0.5 rounded border border-red-500/20';
            }

            return (
              <div 
                key={log.id} 
                className={`flex gap-3 py-0.5 pr-2 items-start leading-relaxed text-[11px] ${bgClass} transition-colors theme-hover-bg rounded`}
              >
                <span className="theme-text-muted shrink-0 select-none font-light">[{log.time}]</span>
                <span className={colorClass}>{log.text}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
