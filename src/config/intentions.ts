import { PREDICATE_IDS } from '../config'

/** Hex color for each intention label */
export const INTENTION_COLORS: Record<string, string> = {
  Trusted: '#22C55E',
  Distrusted: '#EF4444',
  Work: '#3B82F6',
  Learning: '#06B6D4',
  Fun: '#F59E0B',
  Inspiration: '#8B5CF6',
  Buying: '#EC4899',
  Music: '#FF5722',
  Attending: '#10B981',
  Valued: '#F97316',
}

/** Map on-chain predicate ID → display intention label */
export const PREDICATE_TO_INTENTION: Record<string, string> = {
  [PREDICATE_IDS.TRUSTS]: 'Trusted',
  [PREDICATE_IDS.DISTRUST]: 'Distrusted',
  [PREDICATE_IDS.VISITS_FOR_WORK]: 'Work',
  [PREDICATE_IDS.VISITS_FOR_LEARNING]: 'Learning',
  [PREDICATE_IDS.VISITS_FOR_FUN]: 'Fun',
  [PREDICATE_IDS.VISITS_FOR_INSPIRATION]: 'Inspiration',
}

/** Map human-readable predicate label → display intention label */
export const LABEL_TO_INTENTION: Record<string, string> = {
  trusts: 'Trusted',
  distrust: 'Distrusted',
  'visits for work': 'Work',
  'visits for learning': 'Learning',
  'visits for fun': 'Fun',
  'visits for inspiration': 'Inspiration',
  'visits for buying': 'Buying',
  'visits for music': 'Music',
  attending: 'Attending',
  'has value': 'Valued',
}

/** Quest badge config: tag label → { display name, category } */
export const QUEST_BADGES: Record<string, { name: string; category: string }> = {
  'daily certification': { name: 'Daily Certification', category: 'daily' },
  'daily voter': { name: 'Daily Voter', category: 'daily' },
  'first signal': { name: 'First Signal', category: 'milestone' },
  'first step': { name: 'First Step', category: 'discovery' },
  'first coins': { name: 'First Coins', category: 'gold' },
  'first vote': { name: 'First Vote', category: 'vote' },
  'first follow': { name: 'First Follow', category: 'social' },
  'first trust': { name: 'First Trust', category: 'social' },
  'trailblazer': { name: 'Trailblazer', category: 'discovery' },
  'saver': { name: 'Saver', category: 'gold' },
  'committed': { name: 'Committed', category: 'streak' },
  'dedicated': { name: 'Dedicated', category: 'streak' },
  'relentless': { name: 'Relentless', category: 'streak' },
  'critic': { name: 'Critic', category: 'vote' },
  'judge': { name: 'Judge', category: 'vote' },
  'engaged voter': { name: 'Engaged Voter', category: 'vote' },
  'civic duty': { name: 'Civic Duty', category: 'vote' },
  'signal rookie': { name: 'Signal Rookie', category: 'milestone' },
  'signal maker': { name: 'Signal Maker', category: 'milestone' },
  'centurion': { name: 'Centurion', category: 'milestone' },
  'signal pro': { name: 'Signal Pro', category: 'milestone' },
  'social butterfly': { name: 'Social Butterfly', category: 'social' },
  'networker': { name: 'Networker', category: 'social' },
  'explorer': { name: 'Explorer', category: 'discovery' },
  'pathfinder': { name: 'Pathfinder', category: 'discovery' },
  'collector': { name: 'Collector', category: 'milestone' },
  'gold digger': { name: 'Gold Digger', category: 'gold' },
  'treasurer': { name: 'Treasurer', category: 'gold' },
  'midas touch': { name: 'Midas Touch', category: 'gold' },
  'discord linked': { name: 'Discord Linked', category: 'social' },
  'youtube linked': { name: 'YouTube Linked', category: 'social' },
  'spotify linked': { name: 'Spotify Linked', category: 'social' },
  'twitch linked': { name: 'Twitch Linked', category: 'social' },
  'twitter linked': { name: 'Twitter Linked', category: 'social' },
  'social linked': { name: 'Social Linked', category: 'social' },
}
