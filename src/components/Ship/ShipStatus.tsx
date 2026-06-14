import React from 'react';
import { Heart, Shield, Zap, Target, Crosshair, Navigation } from 'lucide-react';
import type { Ship, Enemy } from '../../types';

interface ShipStatusProps {
  ship: Ship | Enemy;
  isPlayer?: boolean;
}

export const ShipStatus: React.FC<ShipStatusProps> = ({ ship, isPlayer = true }) => {
  const hpPercent = (ship.hp / ship.maxHp) * 100;
  const shieldPercent = (ship.shield / ship.maxShield) * 100;
  const energyPercent = isPlayer && 'energy' in ship 
    ? (ship.energy / ship.maxEnergy) * 100 
    : 0;
  const critRate = 'critRate' in ship ? ship.critRate : 0.1;

  const getHpColor = () => {
    if (hpPercent > 60) return 'bg-neon-green';
    if (hpPercent > 30) return 'bg-neon-yellow';
    return 'bg-neon-red';
  };

  return (
    <div className={`glass-panel p-4 rounded-xl ${isPlayer ? 'neon-border' : 'neon-border-red'}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="text-4xl">{isPlayer ? '🚀' : '👾'}</div>
        <div className="flex-1">
          <h3 className="text-lg font-display font-bold text-white">{ship.name}</h3>
          <p className="text-xs text-gray-400">{isPlayer ? '玩家舰船' : '敌方舰船'}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center gap-1 text-sm text-neon-red">
              <Heart className="w-4 h-4" />
              船体
            </span>
            <span className="text-sm font-display">
              {ship.hp} / {ship.maxHp}
            </span>
          </div>
          <div className="stat-bar">
            <div 
              className={`stat-bar-fill ${getHpColor()}`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center gap-1 text-sm text-neon-cyan">
              <Shield className="w-4 h-4" />
              护盾
            </span>
            <span className="text-sm font-display">
              {ship.shield} / {ship.maxShield}
            </span>
          </div>
          <div className="stat-bar">
            <div 
              className="stat-bar-fill bg-neon-cyan"
              style={{ width: `${shieldPercent}%` }}
            />
          </div>
        </div>

        {isPlayer && 'energy' in ship && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1 text-sm text-neon-yellow">
                <Zap className="w-4 h-4" />
                能量
              </span>
              <span className="text-sm font-display">
                {ship.energy} / {ship.maxEnergy}
              </span>
            </div>
            <div className="stat-bar">
              <div 
                className="stat-bar-fill bg-neon-yellow"
                style={{ width: `${energyPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-space-600">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
              <Target className="w-3 h-3" />
              攻击
            </div>
            <div className="text-neon-red font-display font-bold">{ship.attack}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
              <Crosshair className="w-3 h-3" />
              暴击
            </div>
            <div className="text-neon-yellow font-display font-bold">{(critRate * 100).toFixed(0)}%</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
              <Navigation className="w-3 h-3" />
              闪避
            </div>
            <div className="text-neon-purple font-display font-bold">{(ship.evasion * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};
