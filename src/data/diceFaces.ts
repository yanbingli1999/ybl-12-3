import type { DiceFace } from '../types';

export const standardDiceFaces: DiceFace[] = [
  { value: 1, type: 'normal', color: '#e0e0e0' },
  { value: 2, type: 'normal', color: '#e0e0e0' },
  { value: 3, type: 'normal', color: '#e0e0e0' },
  { value: 4, type: 'normal', color: '#e0e0e0' },
  { value: 5, type: 'normal', color: '#e0e0e0' },
  { value: 6, type: 'normal', color: '#e0e0e0' },
];

export const advancedDiceFaces: DiceFace[] = [
  { value: 1, type: 'normal', color: '#e0e0e0' },
  { value: 2, type: 'energy', color: '#ffcc00', effect: '+1 能量' },
  { value: 3, type: 'normal', color: '#e0e0e0' },
  { value: 4, type: 'critical', color: '#ff3366', effect: '+10% 暴击' },
  { value: 5, type: 'normal', color: '#e0e0e0' },
  { value: 6, type: 'wild', color: '#9933ff', effect: '万能骰面' },
];

export const legendaryDiceFaces: DiceFace[] = [
  { value: 2, type: 'normal', color: '#e0e0e0' },
  { value: 3, type: 'energy', color: '#ffcc00', effect: '+2 能量' },
  { value: 4, type: 'critical', color: '#ff3366', effect: '+15% 暴击' },
  { value: 4, type: 'wild', color: '#9933ff', effect: '万能骰面' },
  { value: 5, type: 'normal', color: '#e0e0e0' },
  { value: 6, type: 'critical', color: '#ff3366', effect: '+20% 暴击' },
];
