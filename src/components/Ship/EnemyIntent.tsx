import React from 'react';
import { getIntentColor } from '../../utils/battle';
import type { Enemy } from '../../types';

interface EnemyIntentProps {
  enemy: Enemy;
}

const intentIcons: Record<string, string> = {
  attack: '⚔️',
  defend: '🛡️',
  charge: '⚡',
  special: '💥',
  repair: '🔧',
};

const intentLabels: Record<string, string> = {
  attack: '攻击',
  defend: '防御',
  charge: '蓄力',
  special: '特殊技能',
  repair: '维修',
};

export const EnemyIntent: React.FC<EnemyIntentProps> = ({ enemy }) => {
  const colorClass = getIntentColor(enemy.intent);

  return (
    <div className="glass-panel neon-border-yellow p-4 rounded-xl">
      <h4 className="text-sm font-display text-neon-yellow mb-3">敌方意图</h4>
      
      <div className="flex items-center gap-3">
        <div className={`text-3xl ${enemy.intent.type === 'charge' ? 'animate-pulse' : ''}`}>
          {intentIcons[enemy.intent.type] || '❓'}
        </div>
        <div className="flex-1">
          <div className={`font-display font-bold ${colorClass}`}>
            {intentLabels[enemy.intent.type] || '未知'}
          </div>
          <p className="text-xs text-gray-400">{enemy.intent.description}</p>
          {enemy.intent.value > 0 && (
            <div className="text-sm font-display text-white mt-1">
              预估数值: <span className={colorClass}>{enemy.intent.value}</span>
            </div>
          )}
        </div>
      </div>

      {enemy.abilities.length > 0 && (
        <div className="mt-3 pt-3 border-t border-space-600">
          <div className="text-xs text-gray-400 mb-2">可用技能:</div>
          <div className="flex flex-wrap gap-1">
            {enemy.abilities.map(ability => (
              <div
                key={ability.id}
                className={`
                  px-2 py-1 rounded text-xs
                  ${ability.currentCooldown > 0 
                    ? 'bg-space-700 text-gray-500' 
                    : 'bg-neon-purple/20 text-neon-purple border border-neon-purple/30'}
                `}
                title={ability.description}
              >
                {ability.name}
                {ability.currentCooldown > 0 && ` (${ability.currentCooldown})`}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
