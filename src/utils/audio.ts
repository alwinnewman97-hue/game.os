/**
 * Procedural minimalist synthesizer using Web Audio API for a vintage tactile clicking feel.
 * Runs completely client-side with zero external assets, perfect for robust offline PWAs.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

export function playClickSound(soundType: 'click' | 'success' | 'build' | 'research' | 'wood' | 'error' | 'upgrade' | 'achievement' = 'click') {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    if (soundType === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);
      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.linearRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } 
    else if (soundType === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554, now + 0.08);
      osc.frequency.setValueAtTime(659, now + 0.16);
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.linearRampToValueAtTime(0.001, now + 0.24);
      osc.start(now);
      osc.stop(now + 0.24);
    } 
    else if (soundType === 'build') {
      // Classic tactile sci-fi building/construction sound
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(280, now + 0.15);
      gainNode.gain.setValueAtTime(0.03, now);
      gainNode.gain.linearRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } 
    else if (soundType === 'upgrade') {
      // Classic sci-fi "charge-up" sound sweeping upwards
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.4);
      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.linearRampToValueAtTime(0.05, now + 0.3);
      gainNode.gain.linearRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    }
    else if (soundType === 'research') {
      // Soft, high-precision digital "chirp" (rapid double chime)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.05); // A6
      gainNode.gain.setValueAtTime(0.04, now);
      gainNode.gain.linearRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);

      const osc2 = ctx.createOscillator();
      const gainNode2 = ctx.createGain();
      osc2.connect(gainNode2);
      gainNode2.connect(ctx.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1320, now + 0.06); // E6
      osc2.frequency.exponentialRampToValueAtTime(2640, now + 0.11); // E7
      gainNode2.gain.setValueAtTime(0.04, now + 0.06);
      gainNode2.gain.linearRampToValueAtTime(0.001, now + 0.11);
      osc2.start(now + 0.06);
      osc2.stop(now + 0.11);
    }
    else if (soundType === 'achievement') {
      // Triumphant, warm, layered synth arpeggiated major chord (C Major)
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((freq, index) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        
        o.type = index % 2 === 0 ? 'triangle' : 'sine';
        o.frequency.setValueAtTime(freq, now + index * 0.04);
        o.frequency.exponentialRampToValueAtTime(freq * 1.01, now + index * 0.04 + 0.5);
        
        g.gain.setValueAtTime(0.001, now + index * 0.04);
        g.gain.linearRampToValueAtTime(0.035, now + index * 0.04 + 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, now + index * 0.04 + 0.5);
        
        o.start(now + index * 0.04);
        o.stop(now + index * 0.04 + 0.5);
      });
    }
    else if (soundType === 'wood') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(60, now + 0.1);
      gainNode.gain.setValueAtTime(0.09, now);
      gainNode.gain.linearRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    }
    else if (soundType === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.setValueAtTime(100, now + 0.1);
      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.linearRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch (err) {
    // browser blocked or unsupported context
  }
}

/**
 * Triggers standard lightweight device vibration patterns on supported mobile environments
 */
export function triggerHaptic(type: 'click' | 'success' | 'build' | 'research' | 'wood' | 'error') {
  try {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      if (type === 'build') {
        navigator.vibrate(22); // Single punchy tactile click for building construction
      } else if (type === 'research') {
        navigator.vibrate([15, 30, 20]); // double pulse pattern for smart dimensional breakthrough
      } else if (type === 'success') {
        navigator.vibrate([15, 45, 15]); // joyous rapid double tap for progress milestones
      } else if (type === 'wood') {
        navigator.vibrate(10); // Extra short micro-tap for physical manual gathering clicks
      } else if (type === 'click') {
        navigator.vibrate(8); // Soft micro-vibration for general menu elements
      } else if (type === 'error') {
        navigator.vibrate([40, 50, 40]); // Dual buzz alert pattern for failed constraints
      }
    }
  } catch (err) {
    // Unsupported or blocked context
  }
}
