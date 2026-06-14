import React from 'react';
import { Coins, ArrowUp, Zap, Heart, Shield, Target, Crosshair, Navigation, Wrench } from 'lucide-react';
import { useShipStore } from '../store/useShipStore';
import { ShipStatus } from '../components/Ship/ShipStatus';
import type { CabinType } from '../types';

const upgradeIcons: Record<string, React.ReactNode> = {
  hp: <Heart className="w-5 h-5" />,
  shield: <Shield className="w-5 h-5" />,
  attack: <Target className="w-5 h-5" />,
  defense: <Shield className="w-5 h-5" />,
  evasion: <Navigation className="w-5 h-5" />,
  crit: <Crosshair className="w-5 h-5" />,
  energy: <Zap className="w-5 h-5" />,
  cabin: <Wrench className="w-5 h-5" />,
};

const upgradeColors: Record<string, string> = {
  hp: 'text-neon-green border-neon-green',
  shield: 'text-neon-cyan border-neon-cyan',
  attack: 'text-neon-red border-neon-red',
  defense: 'text-neon-blue border-neon-blue',
  evasion: 'text-neon-purple border-neon-purple',
  crit: 'text-neon-yellow border-neon-yellow',
  energy: 'text-neon-yellow border-neon-yellow',
  cabin: 'text-neon-blue border-neon-blue',
};

const cabinNames: Record<CabinType, string> = {
  engine: '引擎舱',
  shield: '护盾舱',
  weapon: '武器舱',
  repair: '维修舱',
  scanner: '扫描舱',
};

export const UpgradePage: React.FC = () => {
  const { ship, upgrades, rewardPoints, buyUpgrade, applyUpgradeEffects } = useShipStore();

  const handleBuyUpgrade = (upgradeId: string) => {
    const success = buyUpgrade(upgradeId);
    if (success) {
      applyUpgradeEffects();
    }
  };

  const getUpgradeCost = (upgrade: typeof upgrades[0]) => {
    return Math.floor(upgrade.cost * Math.pow(upgrade.costMultiplier, upgrade.currentLevel));
  };

  const canAfford = (upgrade: typeof upgrades[0]) => {
    return rewardPoints >= getUpgradeCost(upgrade) && upgrade.currentLevel < upgrade.maxLevel;
  };

  const basicUpgrades = upgrades.filter(u => u.type !== 'cabin');
  const cabinUpgrades = upgrades.filter(u => u.type === 'cabin');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold text-neon-blue">
          舰船改装
        </h2>
        <div className="flex items-center gap-2 bg-space-800 px-4 py-2 rounded-lg">
          <Coins className="w-5 h-5 text-neon-yellow" />
          <span className="text-xl font-display font-bold text-neon-yellow">
            {rewardPoints}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ShipStatus ship={ship} isPlayer={true} />
          
          <div className="mt-4 glass-panel neon-border p-4 rounded-xl">
            <h3 className="text-lg font-display font-bold text-neon-blue mb-3">升级说明</h3>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• 使用战斗获得的点数进行升级</li>
              <li>• 基础属性升级提升舰船性能</li>
              <li>• 舱室升级增强对应舱位效果</li>
              <li>• 升级后效果立即生效</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-neon-yellow" />
              基础属性升级
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {basicUpgrades.map(upgrade => {
                const colorClass = upgradeColors[upgrade.type];
                const cost = getUpgradeCost(upgrade);
                const affordable = canAfford(upgrade);
                const isMaxed = upgrade.currentLevel >= upgrade.maxLevel;

                return (
                  <div
                    key={upgrade.id}
                    className={`
                      glass-panel p-4 rounded-xl border
                      ${colorClass}
                      ${isMaxed ? 'opacity-60' : ''}
                    `}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`${colorClass}`}>
                          {upgradeIcons[upgrade.type]}
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-white">
                            {upgrade.name}
                          </h4>
                          <p className="text-xs text-gray-400">
                            {upgrade.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-display text-gray-400">
                          Lv.{upgrade.currentLevel}/{upgrade.maxLevel}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="stat-bar">
                        <div
                          className="stat-bar-fill bg-current opacity-60"
                          style={{ width: `${(upgrade.currentLevel / upgrade.maxLevel) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-neon-yellow" />
                        <span className={`font-display ${affordable ? 'text-neon-yellow' : 'text-gray-500'}`}>
                          {isMaxed ? '已满级' : cost}
                        </span>
                      </div>
                      <button
                        onClick={() => handleBuyUpgrade(upgrade.id)}
                        disabled={!affordable || isMaxed}
                        className={`
                          px-3 py-1 rounded flex items-center gap-1 text-sm
                          ${affordable && !isMaxed
                            ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue hover:bg-neon-blue/30'
                            : 'bg-space-700 text-gray-500 border border-space-600 cursor-not-allowed'}
                          transition-all duration-200
                        `}
                      >
                        <ArrowUp className="w-4 h-4" />
                        升级
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-neon-blue" />
              舱室升级
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cabinUpgrades.map(upgrade => {
                const colorClass = upgradeColors[upgrade.type];
                const cost = getUpgradeCost(upgrade);
                const affordable = canAfford(upgrade);
                const isMaxed = upgrade.currentLevel >= upgrade.maxLevel;
                const cabinName = upgrade.cabinType ? cabinNames[upgrade.cabinType] : '';

                return (
                  <div
                    key={upgrade.id}
                    className={`
                      glass-panel p-4 rounded-xl border
                      ${colorClass}
                      ${isMaxed ? 'opacity-60' : ''}
                    `}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`${colorClass}`}>
                          {upgradeIcons[upgrade.type]}
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-white">
                            {cabinName}
                          </h4>
                          <p className="text-xs text-gray-400">
                            {upgrade.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-sm text-gray-400">
                        等级: <span className="font-display text-white">{upgrade.currentLevel}/{upgrade.maxLevel}</span>
                      </div>
                      <div className="stat-bar mt-1">
                        <div
                          className="stat-bar-fill bg-current opacity-60"
                          style={{ width: `${(upgrade.currentLevel / upgrade.maxLevel) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-neon-yellow" />
                        <span className={`font-display ${affordable ? 'text-neon-yellow' : 'text-gray-500'}`}>
                          {isMaxed ? '已满级' : cost}
                        </span>
                      </div>
                      <button
                        onClick={() => handleBuyUpgrade(upgrade.id)}
                        disabled={!affordable || isMaxed}
                        className={`
                          px-3 py-1 rounded flex items-center gap-1 text-sm
                          ${affordable && !isMaxed
                            ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue hover:bg-neon-blue/30'
                            : 'bg-space-700 text-gray-500 border border-space-600 cursor-not-allowed'}
                          transition-all duration-200
                        `}
                      >
                        <ArrowUp className="w-4 h-4" />
                        升级
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
