import { create } from 'zustand';
import type { Ship, Upgrade, GameStats } from '../types';
import { createDefaultShip, createDefaultUpgrades } from '../data/defaultShip';
import { defaultStats } from '../utils/storage';
import { 
  loadShip, saveShip, 
  loadUpgrades, saveUpgrades,
  loadRewardPoints, saveRewardPoints,
  loadStats, updateStats,
} from '../utils/storage';

interface ShipState {
  ship: Ship;
  upgrades: Upgrade[];
  rewardPoints: number;
  stats: GameStats;
  
  loadSavedData: () => void;
  updateShip: (ship: Partial<Ship>) => void;
  setShip: (ship: Ship) => void;
  buyUpgrade: (upgradeId: string) => boolean;
  addRewardPoints: (points: number) => void;
  spendRewardPoints: (points: number) => boolean;
  applyUpgradeEffects: () => void;
  resetShip: () => void;
}

export const useShipStore = create<ShipState>((set, get) => ({
  ship: createDefaultShip(),
  upgrades: createDefaultUpgrades(),
  rewardPoints: 0,
  stats: defaultStats,
  
  loadSavedData: () => {
    const ship = loadShip();
    const upgrades = loadUpgrades();
    const rewardPoints = loadRewardPoints();
    const stats = loadStats();
    
    set({ ship, upgrades, rewardPoints, stats });
  },
  
  updateShip: (updates) => {
    const { ship } = get();
    const newShip = { ...ship, ...updates };
    set({ ship: newShip });
    saveShip(newShip);
  },
  
  setShip: (ship) => {
    set({ ship });
    saveShip(ship);
  },
  
  buyUpgrade: (upgradeId) => {
    const { upgrades, rewardPoints } = get();
    const upgrade = upgrades.find(u => u.id === upgradeId);
    
    if (!upgrade || upgrade.currentLevel >= upgrade.maxLevel) return false;
    
    const cost = Math.floor(upgrade.cost * Math.pow(upgrade.costMultiplier, upgrade.currentLevel));
    if (rewardPoints < cost) return false;
    
    const newUpgrades = upgrades.map(u => {
      if (u.id === upgradeId) {
        return { ...u, currentLevel: u.currentLevel + 1 };
      }
      return u;
    });
    
    set({
      upgrades: newUpgrades,
      rewardPoints: rewardPoints - cost,
    });
    
    saveUpgrades(newUpgrades);
    saveRewardPoints(rewardPoints - cost);
    get().applyUpgradeEffects();
    
    return true;
  },
  
  addRewardPoints: (points) => {
    const { rewardPoints, stats } = get();
    const newPoints = rewardPoints + points;
    const newStats = {
      ...stats,
      totalRewardPoints: stats.totalRewardPoints + points,
    };
    
    set({ rewardPoints: newPoints, stats: newStats });
    saveRewardPoints(newPoints);
    updateStats(newStats);
  },
  
  spendRewardPoints: (points) => {
    const { rewardPoints } = get();
    if (rewardPoints < points) return false;
    
    const newPoints = rewardPoints - points;
    set({ rewardPoints: newPoints });
    saveRewardPoints(newPoints);
    return true;
  },
  
  applyUpgradeEffects: () => {
    const { ship, upgrades } = get();
    const baseShip = createDefaultShip();
    
    let newShip = { ...ship };
    
    const hpUpgrade = upgrades.find(u => u.id === 'upgrade_hp');
    const shieldUpgrade = upgrades.find(u => u.id === 'upgrade_shield');
    const attackUpgrade = upgrades.find(u => u.id === 'upgrade_attack');
    const defenseUpgrade = upgrades.find(u => u.id === 'upgrade_defense');
    const evasionUpgrade = upgrades.find(u => u.id === 'upgrade_evasion');
    const critUpgrade = upgrades.find(u => u.id === 'upgrade_crit');
    const energyUpgrade = upgrades.find(u => u.id === 'upgrade_energy');
    
    newShip.maxHp = baseShip.maxHp + (hpUpgrade?.currentLevel || 0) * hpUpgrade!.effect;
    newShip.maxShield = baseShip.maxShield + (shieldUpgrade?.currentLevel || 0) * shieldUpgrade!.effect;
    newShip.attack = baseShip.attack + (attackUpgrade?.currentLevel || 0) * attackUpgrade!.effect;
    newShip.defense = baseShip.defense + (defenseUpgrade?.currentLevel || 0) * defenseUpgrade!.effect;
    newShip.evasion = baseShip.evasion + (evasionUpgrade?.currentLevel || 0) * evasionUpgrade!.effect;
    newShip.critRate = baseShip.critRate + (critUpgrade?.currentLevel || 0) * critUpgrade!.effect;
    newShip.maxEnergy = baseShip.maxEnergy + (energyUpgrade?.currentLevel || 0) * energyUpgrade!.effect;
    
    newShip.hp = Math.min(newShip.hp, newShip.maxHp);
    newShip.shield = Math.min(newShip.shield, newShip.maxShield);
    newShip.energy = Math.min(newShip.energy, newShip.maxEnergy);
    
    const cabinUpgrades = upgrades.filter(u => u.type === 'cabin' && u.cabinType);
    newShip.cabins = newShip.cabins.map(cabin => {
      const cabinUpgrade = cabinUpgrades.find(u => u.cabinType === cabin.type);
      if (cabinUpgrade) {
        return {
          ...cabin,
          level: 1 + cabinUpgrade.currentLevel,
          bonus: cabinUpgrade.currentLevel * cabinUpgrade.effect,
        };
      }
      return cabin;
    });
    
    set({ ship: newShip });
    saveShip(newShip);
  },
  
  resetShip: () => {
    const newShip = createDefaultShip();
    const newUpgrades = createDefaultUpgrades();
    
    set({
      ship: newShip,
      upgrades: newUpgrades,
      rewardPoints: 0,
    });
    
    saveShip(newShip);
    saveUpgrades(newUpgrades);
    saveRewardPoints(0);
  },
}));
