import { GameState } from '../types';

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  quote: string;
  badgeEmoji: string;
  category: 'resources' | 'citadel' | 'citizens' | 'quantum';
  conditionDesc: string;
  check: (state: GameState) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'catnip_1k',
    name: 'Mega Seed Gatherer',
    desc: 'Amass a surplus of high-density intelligence-enhancing seeds.',
    quote: 'These are Mega Seeds, Morty! They\'re incredibly valuable!',
    badgeEmoji: '🟢',
    category: 'resources',
    conditionDesc: 'Reach 1,000 Mega Seeds in storage',
    check: (state) => (state.resources?.catnip?.amount ?? 0) >= 1000
  },
  {
    id: 'catnip_1m',
    name: 'Galactic Seed Overlord',
    desc: 'Hoard an absolute warehouse of interdimensional assets.',
    quote: 'We\'re gonna be rich, Morty! Richer than the Galactic Federation!',
    badgeEmoji: '🌿',
    category: 'resources',
    conditionDesc: 'Reach 1,000,000 Mega Seeds in storage',
    check: (state) => (state.resources?.catnip?.amount ?? 0) >= 1000000
  },
  {
    id: 'wood_100',
    name: 'Dimensional Arborist',
    desc: 'Gather a substantial batch of high-temperature Plutonium.',
    quote: 'Turns out alternative timelines have alternative lumber yards.',
    badgeEmoji: '🪵',
    category: 'resources',
    conditionDesc: 'Accumulate 100 Plutonium',
    check: (state) => (state.resources?.wood?.amount ?? 0) >= 100
  },
  {
    id: 'minerals_5k',
    name: 'Pluto-Mine Prospector',
    desc: 'Harvest a magnificent vault of dark matter space minerals.',
    quote: 'They\'re just shiny rocks, Morty! Very lucrative shiny rocks.',
    badgeEmoji: '💎',
    category: 'resources',
    conditionDesc: 'Reach 5,000 Minerals in storage',
    check: (state) => (state.resources?.minerals?.amount ?? 0) >= 5000
  },
  {
    id: 'iron_1k',
    name: 'Neutra-Plate Machinist',
    desc: 'Stockpile strong quantities of raw Neutrium iron.',
    quote: 'This alloy can withstand a direct blast from a Purge planet tank.',
    badgeEmoji: '⚙️',
    category: 'resources',
    conditionDesc: 'Reach 1,000 raw Iron',
    check: (state) => (state.resources?.iron?.amount ?? 0) >= 1000
  },
  {
    id: 'science_5k',
    name: 'Immersive Portal Calculus',
    desc: 'Generate vast quantities of computing power for C-137 research.',
    quote: 'I practically invented this branch of quantum physics.',
    badgeEmoji: '🧪',
    category: 'quantum',
    conditionDesc: 'Store 5,000 Portal Tech (Science)',
    check: (state) => (state.resources?.science?.amount ?? 0) >= 5000
  },
  {
    id: 'science_all_tech',
    name: 'Master of the Multimodal Tree',
    desc: 'Submit and complete research on all primary branch technologies.',
    quote: 'We researched it all, Morty. From basic calendars to high theology!',
    badgeEmoji: '🧠',
    category: 'quantum',
    conditionDesc: 'Unlock all 7 Science research node directories',
    check: (state) => Object.values(state.researched || {}).filter(Boolean).length >= 7
  },
  {
    id: 'kittens_10',
    name: 'Morty Cadet Corps',
    desc: 'Enlist several alternative clones into your labor force.',
    quote: 'A-Aw gee, Rick... there\'s... there\'s so many of me in this room.',
    badgeEmoji: '👦',
    category: 'citizens',
    conditionDesc: 'Maintain 10 active Clone Mortys (Kittens)',
    check: (state) => (state.village?.kittens?.length ?? 0) >= 10
  },
  {
    id: 'kittens_50',
    name: 'Citadel Shadow Council',
    desc: 'Amass an elite corps of specialized cloned assistants.',
    quote: 'The Council of Ricks hereby grants you administrative control.',
    badgeEmoji: '👑',
    category: 'citizens',
    conditionDesc: 'Maintain 50 active Clone Mortys (Kittens)',
    check: (state) => (state.village?.kittens?.length ?? 0) >= 50
  },
  {
    id: 'kittens_100',
    name: 'The One True Morty',
    desc: 'Unlock legendary collective consciousness among the population.',
    quote: 'HE IS THE CHOSEN ONE! Praise the holy yellow shirt!',
    badgeEmoji: '🙏',
    category: 'citizens',
    conditionDesc: 'Maintain 100 active Clone Mortys (Kittens)',
    check: (state) => (state.village?.kittens?.length ?? 0) >= 100
  },
  {
    id: 'culture_10k',
    name: 'Galactic Rockstar',
    desc: 'Amass massive amounts of Schwifty Vibes to influence the cosmos.',
    quote: 'Get Schwifty! Show them what you got!',
    badgeEmoji: '🎵',
    category: 'quantum',
    conditionDesc: 'Gather 10,000 Schwifty Vibes',
    check: (state) => (state.resources?.culture?.amount ?? 0) >= 10000
  },
  {
    id: 'total_buildings_50',
    name: 'High-Density Architect',
    desc: 'Expand infrastructure across multiple districts.',
    quote: 'Look at this pristine space station. Built C-137 tough.',
    badgeEmoji: '🏛️',
    category: 'citadel',
    conditionDesc: 'Construct 50 total structures / buildings',
    check: (state) => Object.values(state.buildings || {}).reduce((acc, current) => acc + (current || 0), 0) >= 50
  },
  {
    id: 'certificates_any',
    name: 'Exemption Registry Approved',
    desc: 'Synthesise a Morty Certificate booster to increase productivity.',
    quote: 'Welcome to the Citadel administrative team, Bureaucrat-C.',
    badgeEmoji: '🎟️',
    category: 'citizens',
    conditionDesc: 'Synthesise any tier of Morty Certificate multi-booster',
    check: (state) => Object.values(state.craftedCertificatesCount || {}).some(v => v > 0)
  },
  {
    id: 'unlocked_all_regions',
    name: 'Sovereign Core Control',
    desc: 'Activate all major material systems and village sectors.',
    quote: 'Everything is fully operational. We control the timeline.',
    badgeEmoji: '🌀',
    category: 'citadel',
    conditionDesc: 'Unlock all 7 main progression systems in the HUD',
    check: (state) => Boolean(
      state.unlocks?.wood &&
      state.unlocks?.minerals &&
      state.unlocks?.iron &&
      state.unlocks?.science &&
      state.unlocks?.village &&
      state.unlocks?.workshop &&
      state.unlocks?.culture
    )
  }
];
