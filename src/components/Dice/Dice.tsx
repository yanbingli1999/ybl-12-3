import React from 'react';
import { Lock } from 'lucide-react';
import type { Die, CabinType } from '../../types';

interface DiceProps {
  die: Die;
  onToggleLock: (id: string) => void;
  onAssign: (id: string, cabinType: CabinType | null) => void;
  disabled?: boolean;
}

const diceColors: Record<CabinType | 'none', string> = {
  engine: 'border-neon-purple bg-neon-purple/20 text-neon-purple',
  shield: 'border-neon-cyan bg-neon-cyan/20 text-neon-cyan',
  weapon: 'border-neon-red bg-neon-red/20 text-neon-red',
  repair: 'border-neon-green bg-neon-green/20 text-neon-green',
  scanner: 'border-neon-yellow bg-neon-yellow/20 text-neon-yellow',
  none: 'border-space-600 bg-space-700 text-white',
};

export const Dice: React.FC<DiceProps> = ({ die, onToggleLock, onAssign, disabled }) => {
  const colorClass = die.assignedTo ? diceColors[die.assignedTo] : diceColors.none;
  const lockClass = die.locked ? 'border-neon-gold shadow-[0_0_15px_rgba(255,215,0,0.6)]' : '';
  const rollingClass = die.isRolling ? 'animate-spin' : '';

  const handleDragStart = (e: React.DragEvent) => {
    if (disabled || die.locked || die.value === 0) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('dieId', die.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleClick = () => {
    if (disabled || die.value === 0) return;
    
    if (die.assignedTo) {
      onAssign(die.id, null);
    } else {
      onToggleLock(die.id);
    }
  };

  return (
    <div
      draggable={!disabled && !die.locked && die.value > 0}
      onDragStart={handleDragStart}
      onClick={handleClick}
      className={`
        dice-face relative select-none
        ${colorClass}
        ${lockClass}
        ${rollingClass}
        ${disabled || die.value === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
        transition-all duration-200
      `}
    >
      <span className="text-2xl font-display font-bold">{die.value || '?'}</span>
      {die.locked && !die.assignedTo && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-neon-gold rounded-full flex items-center justify-center">
          <Lock size={12} className="text-space-900" />
        </div>
      )}
      {die.assignedTo && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAssign(die.id, null);
          }}
          className="absolute -top-2 -right-2 w-5 h-5 bg-neon-red rounded-full flex items-center justify-center text-xs hover:bg-neon-red/80"
        >
          ×
        </button>
      )}
    </div>
  );
};
