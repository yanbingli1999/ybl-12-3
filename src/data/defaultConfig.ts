import type { GameConfig } from '../types';

export const defaultConfig: GameConfig = {
  overheatThreshold: 10,
  shieldAbsorptionRate: 0.7,
  critMultiplier: 2.0,
  critBonusRate: 0.25,
  repairCooldown: 2,
  energyCostPerPoint: 1,
  scanEvasionReduction: 0.1,
  engineEvasionBonus: 0.05,
  maxRerolls: 2,
  diceCount: 5,
  enemyDamageVariance: 0.2,
};
