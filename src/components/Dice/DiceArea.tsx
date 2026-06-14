import React from 'react';
import { RefreshCw, Dices } from 'lucide-react';
import { useDiceStore } from '../../store/useDiceStore';
import { useConfigStore } from '../../store/useConfigStore';
import { Dice } from './Dice';
import type { CabinType } from '../../types';

interface DiceAreaProps {
  disabled?: boolean;
}

export const DiceArea: React.FC<DiceAreaProps> = ({ disabled }) => {
  const { dice, rerollsRemaining, isRolling, roll, toggleDieLock, assignDie, unassignAll } = useDiceStore();
  const { config } = useConfigStore();

  const canRoll = !disabled && !isRolling && (rerollsRemaining > 0 || dice.every(d => d.value === 0));

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dieId = e.dataTransfer.getData('dieId');
    if (dieId) {
      assignDie(dieId, null);
    }
  };

  const handleQuickAssign = (dieId: string, cabinType: CabinType) => {
    const die = dice.find(d => d.id === dieId);
    if (die && !die.locked && die.value > 0) {
      assignDie(dieId, cabinType);
    }
  };

  return (
    <div 
      className="glass-panel neon-border p-6 rounded-xl"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-display font-bold text-neon-blue flex items-center gap-2">
          <Dices className="w-6 h-6" />
          骰子区
        </h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            剩余重掷: <span className="text-neon-yellow font-bold">{rerollsRemaining}</span> / {config.maxRerolls}
          </span>
          {dice.some(d => d.assignedTo) && (
            <button
              onClick={unassignAll}
              className="px-3 py-1 text-sm bg-space-700 border border-space-600 rounded hover:bg-space-600 transition-colors"
            >
              重置分配
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-center mb-6">
        {dice.map(die => (
          <div key={die.id} className="relative">
            <Dice
              die={die}
              onToggleLock={toggleDieLock}
              onAssign={assignDie}
              disabled={disabled || isRolling}
            />
            
            {die.value > 0 && !die.assignedTo && !die.locked && !disabled && (
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
                {(['engine', 'shield', 'weapon', 'repair', 'scanner'] as CabinType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => handleQuickAssign(die.id, type)}
                    className="w-6 h-6 text-xs rounded bg-space-700 hover:bg-space-600 border border-space-600"
                    title={type}
                  >
                    {type[0].toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={roll}
          disabled={!canRoll}
          className={`
            btn-primary flex items-center gap-2
            ${!canRoll ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <RefreshCw className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
          {dice.every(d => d.value === 0) ? '掷骰子' : `重掷 (${rerollsRemaining})`}
        </button>
      </div>

      <p className="text-center text-xs text-gray-500 mt-4">
        点击骰子锁定/解锁，拖放骰子到舱位分配点数，或点击骰子后使用快速分配按钮
      </p>
    </div>
  );
};
