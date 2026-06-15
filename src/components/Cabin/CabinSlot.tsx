import React from 'react';
import { Flame, AlertTriangle, Snowflake, ArrowRight } from 'lucide-react';
import type { Cabin, Die, CabinType, HeatTransfer } from '../../types';
import { useConfigStore } from '../../store/useConfigStore';
import { getCabinHeatStatus, getHeatRiskColor, getHeatRiskBgColor } from '../../utils/battle';

interface CabinSlotProps {
  cabin: Cabin;
  assignedDice: Die[];
  totalPoints: number;
  onDrop: (cabinType: CabinType, dieId: string) => void;
  onRemoveDie: (dieId: string) => void;
  onUseCoolant?: () => void;
  heatTransfers?: HeatTransfer[];
  allCabins: Cabin[];
  disabled?: boolean;
  canUseCoolant?: boolean;
}

const cabinColors: Record<CabinType, { bg: string; border: string; text: string; icon: string }> = {
  engine: { bg: 'bg-neon-purple/10', border: 'border-neon-purple', text: 'text-neon-purple', icon: '🚀' },
  shield: { bg: 'bg-neon-cyan/10', border: 'border-neon-cyan', text: 'text-neon-cyan', icon: '🛡️' },
  weapon: { bg: 'bg-neon-red/10', border: 'border-neon-red', text: 'text-neon-red', icon: '⚔️' },
  repair: { bg: 'bg-neon-green/10', border: 'border-neon-green', text: 'text-neon-green', icon: '🔧' },
  scanner: { bg: 'bg-neon-yellow/10', border: 'border-neon-yellow', text: 'text-neon-yellow', icon: '📡' },
};

const cabinNameMap: Record<CabinType, string> = {
  engine: '引擎舱',
  shield: '护盾舱',
  weapon: '武器舱',
  repair: '维修舱',
  scanner: '扫描舱',
};

export const CabinSlot: React.FC<CabinSlotProps> = ({
  cabin,
  assignedDice,
  totalPoints,
  onDrop,
  onRemoveDie,
  onUseCoolant,
  heatTransfers = [],
  allCabins,
  disabled,
  canUseCoolant = false,
}) => {
  const colors = cabinColors[cabin.type];
  const { config } = useConfigStore();
  const isOverheated = totalPoints > config.overheatThreshold;
  const isDamaged = cabin.damaged;
  const heatStatus = getCabinHeatStatus(cabin, config, allCabins);
  const isRepairCabin = cabin.type === 'repair';
  
  const incomingTransfers = heatTransfers.filter(t => t.to === cabin.type);
  const outgoingTransfers = heatTransfers.filter(t => t.from === cabin.type);

  const handleDragOver = (e: React.DragEvent) => {
    if (!disabled && !isDamaged) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled || isDamaged) return;
    
    const dieId = e.dataTransfer.getData('dieId');
    if (dieId) {
      onDrop(cabin.type, dieId);
    }
  };

  const handleUseCoolant = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUseCoolant && heatStatus.canUseCoolant && canUseCoolant && isRepairCabin) {
      onUseCoolant();
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        cabin-slot relative
        ${colors.bg}
        ${isDamaged ? 'cabin-slot.damaged' : assignedDice.length > 0 ? 'cabin-slot.active' : ''}
        ${isOverheated ? 'ring-2 ring-neon-red' : ''}
        ${disabled || isDamaged ? 'opacity-60 cursor-not-allowed' : 'hover:border-opacity-60 cursor-pointer'}
        transition-all duration-200
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{colors.icon}</span>
          <div>
            <h4 className={`font-display font-bold ${colors.text}`}>
              {cabin.name}
              <span className="ml-2 text-xs text-gray-400">Lv.{cabin.level}</span>
            </h4>
            <p className="text-xs text-gray-500">{cabin.description}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          {isDamaged && (
            <div className="flex items-center gap-1 text-neon-red">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
              <span className="text-xs">损坏中 ({cabin.cooldown})</span>
            </div>
          )}
          
          {isOverheated && (
            <div className="flex items-center gap-1 text-neon-red animate-pulse">
              <Flame className="w-4 h-4" />
              <span className="text-xs">过热!</span>
            </div>
          )}
          
          {!isDamaged && (
            <div className={`flex items-center gap-1 ${getHeatRiskColor(heatStatus.riskLevel)}`}>
              <Flame className="w-4 h-4" />
              <span className="text-xs font-bold">{heatStatus.riskText}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>温度: {cabin.temperature}/{cabin.maxTemperature}°</span>
          {isRepairCabin && (
            <div className="flex items-center gap-1">
              <Snowflake className="w-3 h-3" />
              <span>{heatStatus.coolantAvailable}/{cabin.maxCoolant}</span>
            </div>
          )}
        </div>
        <div className="stat-bar">
          <div
            className={`stat-bar-fill ${getHeatRiskBgColor(heatStatus.riskLevel)}`}
            style={{ width: `${heatStatus.tempPercent}%` }}
          />
        </div>
      </div>

      {!isDamaged && (incomingTransfers.length > 0 || outgoingTransfers.length > 0) && (
        <div className="mb-2 text-xs">
          {incomingTransfers.map((t, i) => (
            <div key={`in-${i}`} className="text-neon-cyan flex items-center gap-1">
              <ArrowRight className="w-3 h-3 rotate-180" />
              来自 {cabinNameMap[t.from]}: +{t.amount}
            </div>
          ))}
          {outgoingTransfers.map((t, i) => (
            <div key={`out-${i}`} className="text-neon-orange flex items-center gap-1">
              <ArrowRight className="w-3 h-3" />
              传向 {cabinNameMap[t.to]}: -{t.amount}
            </div>
          ))}
        </div>
      )}

      {!isDamaged && (
        <div className="mb-2 text-xs text-gray-400">
          相邻: {cabin.neighbors.map(n => cabinNameMap[n]).join(', ')}
        </div>
      )}

      {assignedDice.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {assignedDice.map(die => (
            <div
              key={die.id}
              className={`
                w-10 h-10 rounded-lg flex items-center justify-center
                font-display font-bold text-lg
                ${colors.bg} border ${colors.border}
                hover:scale-110 cursor-pointer transition-transform
              `}
              onClick={() => !disabled && onRemoveDie(die.id)}
            >
              {die.value}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        {totalPoints > 0 && (
          <div className={`text-right font-display font-bold ${isOverheated ? 'text-neon-red' : colors.text}`}>
            总点数: {totalPoints}
            {isOverheated && (
              <span className="text-xs ml-2 text-neon-red">
                (超过阈值 {config.overheatThreshold})
              </span>
            )}
          </div>
        )}
        
        {isRepairCabin && onUseCoolant && heatStatus.canUseCoolant && canUseCoolant && !isDamaged && (
          <button
            onClick={handleUseCoolant}
            className="px-2 py-1 bg-neon-cyan/20 border border-neon-cyan text-neon-cyan text-xs rounded flex items-center gap-1 hover:bg-neon-cyan/30 transition-colors"
            title="释放冷却剂给温度最高的舱室降温"
          >
            <Snowflake className="w-3 h-3" />
            释放冷却剂
          </button>
        )}
      </div>

      {isDamaged && (
        <div className="absolute inset-0 bg-neon-red/10 rounded-lg pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-red/20 to-transparent animate-scan-line" />
        </div>
      )}
    </div>
  );
};
