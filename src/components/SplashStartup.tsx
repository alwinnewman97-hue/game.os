import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Flame, Sparkles, Monitor, Cpu, ChevronRight, Apple, Share } from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface SplashStartupProps {
  onEnter: () => void;
  soundEnabled: boolean;
}

export default function SplashStartup({ onEnter, soundEnabled }: SplashStartupProps) {
  const [diagnosticIndex, setDiagnosticIndex] = useState(0);
  const [isIosButNotStandalone, setIsIosButNotStandalone] = useState(false);

  const diagnostics = [
    'COLD DIMENSIONAL MATRIX... UNLOCKED',
    'PORTAL FLUID CHRONOMETER... ACTIVE',
    'MORTY MUTABLE COGNITION COMPLIANCE... ENGAGED',
    'CITADEL CLONE BAY SUITE... SECURED',
    'PLUTONUM INJECTOR CORE STABLE... READY.'
  ];

  useEffect(() => {
    // Stagger loading diagnostic text lines for immediate high-quality simulation immersion
    const interval = setInterval(() => {
      setDiagnosticIndex((prev) => {
        if (prev < diagnostics.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 450);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Detect iOS UA and confirm if currently launched in PWA Standalone Mode
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
    
    if (isIosDevice && !isStandalone) {
      setIsIosButNotStandalone(true);
    }
  }, []);

  const handleStart = () => {
    if (soundEnabled) playClickSound('success');
    onEnter();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-10 theme-bg-app select-none overflow-hidden h-screen bg-neutral-950 text-neutral-100">
      
      {/* STATIC TOP AMBIENT DECORATIVE CORNER */}
      <div className="flex items-center justify-between w-full opacity-60">
        <div className="flex items-center gap-1.5 font-mono text-[9px] tracking-widest">
          <Cpu size={12} className="theme-text-sec animate-pulse" />
          <span>SYS.IDENTIFIER: PROT_4D98</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[9px] tracking-widest text-emerald-500">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>PORTAL_C137_STABLE</span>
        </div>
      </div>

      {/* MID-PORT ENGINE HERO PANEL */}
      <div className="max-w-md w-full mx-auto my-auto flex flex-col items-center justify-center text-center gap-6">
        
        {/* CINEMATIC CONCENTRIC PULSE ENGINE */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="relative flex items-center justify-center w-32 h-32"
        >
          {/* Outer Ring */}
          <div className="absolute inset-0 border border-neutral-800 rounded-full animate-[spin_12s_linear_infinite]" />
          <div className="absolute inset-2 border border-neutral-700/60 rounded-full border-dashed animate-[spin_8s_linear_infinite_reverse]" />
          
          {/* Core glow */}
          <div className="absolute inset-5 bg-amber-500/10 rounded-full blur-xl animate-pulse" />
          
          {/* Inner Golden Engine Icon */}
          <div className="absolute inset-6 bg-neutral-900 border border-amber-500/30 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/5 hover:border-amber-400/50 transition-colors">
            <Flame size={44} className="text-amber-500 animate-pulse" />
          </div>
        </motion.div>

        {/* LOGO TITLE SECTION */}
        <div className="flex flex-col gap-2 mt-4">
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg md:text-xl font-sans font-black tracking-widest uppercase text-neutral-100"
          >
            Citadel Incremental
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-[10px] uppercase font-mono tracking-widest text-neutral-400"
          >
            Multiversal Clone Engine Protocol
          </motion.p>
        </div>

        {/* SEQUENTIAL LOADER TERMINAL */}
        <div className="w-full bg-neutral-900/50 border border-neutral-850 p-4 rounded-xl font-mono text-[10px] text-left leading-relaxed shadow-inner">
          <div className="text-neutral-500 border-b border-neutral-800 pb-2 mb-2 flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
              <span className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
            </div>
            <span>LOG MONITOR CONSOLE</span>
          </div>
          
          <div className="space-y-1">
            {diagnostics.slice(0, diagnosticIndex + 1).map((line, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className={`${idx === diagnosticIndex ? 'text-amber-400 font-bold' : 'text-neutral-400'}`}
              >
                &gt; {line}
              </motion.div>
            ))}
            {diagnosticIndex < diagnostics.length - 1 && (
              <div className="text-neutral-500 animate-pulse">&gt; BUFFERING SIGNAL STREAM SYSTEM...</div>
            )}
          </div>
        </div>

        {/* PRESS TO START TRIGGER ZONE */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="w-full"
        >
          <button
            onClick={handleStart}
            className="w-full min-h-[48px] px-6 rounded-xl text-xs uppercase font-extrabold tracking-widest text-neutral-950 bg-amber-400 active:bg-amber-500 shadow-xl shadow-amber-500/10 active:scale-[0.98] transition-all transform flex items-center justify-center gap-2 cursor-pointer select-none"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <span>LAUNCH PORTAL SIMULATION</span>
            <ChevronRight size={14} className="stroke-[3]" />
          </button>
        </motion.div>

      </div>

      {/* FULL IOS APPLE PWA INSTALL PROMPT / TIP */}
      <div className="w-full max-w-sm mx-auto flex flex-col items-center text-center gap-3">
        {isIosButNotStandalone ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="w-full bg-neutral-900 border border-neutral-800 p-3.5 rounded-xl flex items-start gap-3 shadow-xl relative"
          >
            <div className="bg-neutral-800 border border-neutral-700 p-2 rounded-lg text-amber-400 shrink-0 mt-0.5">
              <Apple size={16} />
            </div>
            <div className="text-left">
              <h4 className="text-[10px] font-sans font-extrabold text-neutral-200 uppercase tracking-widest flex items-center gap-1">
                <span>iOS Immersive View tip</span>
                <span className="text-[8px] bg-amber-400/10 text-amber-400 border border-amber-500/20 px-1 py-0.2 rounded font-mono font-bold">Recommended</span>
              </h4>
              <p className="text-[10px] text-neutral-400 mt-1 leading-normal font-sans">
                Tap Safari's <span className="inline-flex items-center gap-0.5 font-bold text-neutral-300 bg-neutral-850 px-1 py-0.5 rounded border border-neutral-700"><Share size={10} className="inline" /> Share</span> icon and pick <span className="font-bold text-neutral-200">"Add to Home Screen"</span> for standalone app play.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="flex items-center justify-center gap-1.5 font-mono text-[9px] text-neutral-500 leading-none">
            <Sparkles size={11} className="text-neutral-600" />
            <span>IOS STANDALONE RUNTIME READY</span>
          </div>
        )}
      </div>

    </div>
  );
}
