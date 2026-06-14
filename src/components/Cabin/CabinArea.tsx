import React from 'react';
import { useDiceStore } from '../../store/useDiceStore';
import { useShipStore } from '../../store/useShipStore';
import { useGameStore } from '../../store/useGameStore';
import { CabinSlot } from './CabinSlot';
import type { CabinType } from '../../types';

interface CabinAreaProps {
  disabled?: boolean;
}

export const CabinArea: React.FC<CabinAreaProps> = ({ disabled }) => {
  const { dice, assignDie } = useDiceStore();
  const { ship } = useShipStore();
  const { lastHeatTransfers, useCoolant, battleState, isReplaying } = useGameStore();

  const handleDrop = (cabinType: CabinType, dieId: string) => {
    assignDie(dieId, cabinType);
  };

  const handleRemoveDie = (dieId: string) => {
    assignDie(dieId, null);
  };

  const handleUseCoolant = (cabinType: CabinType) => {
    useCoolant(cabinType);
  };

  const getDiceForCabin = (cabinType: CabinType) => {
    return dice.filter(d => d.assignedTo === cabinType);
  };

  const getTotalPoints = (cabinType: CabinType) => {
    return getDiceForCabin(cabinType).reduce((sum, d) => sum + d.value, 0);
  };

  const cabinOrder: CabinType[] = ['engine', 'shield', 'weapon', 'repair', 'scanner'];
  const canUseCoolant = battleState?.phase === 'player' && !isReplaying;

  const totalHeat = ship.cabins.reduce((sum, c) => sum + c.temperature, 0);
  const avgHeat = Math.round(totalHeat / ship.cabins.length);

  return (
    <div className="glass-panel neon-border p-6 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-display font-bold text-neon-blue">舱位分配</h3>
        <div className="text-sm text-gray-400">
          平均温度: <span className="text-neon-orange font-bold">{avgHeat}°</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {cabinOrder.map(cabinType => {
          const cabin = ship.cabins.find(c => c.type === cabinType);
          if (!cabin) return null;
          
          return (
            <CabinSlot
              key={cabin.id}
              cabin={cabin}
              assignedDice={getDiceForCabin(cabinType)}
              totalPoints={getTotalPoints(cabinType)}
              onDrop={handleDrop}
              onRemoveDie={handleRemoveDie}
              onUseCoolant={handleUseCoolant}
              heatTransfers={lastHeatTransfers}
              disabled={disabled}
              canUseCoolant={canUseCoolant}
            />
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-500 mt-4">
        将骰子拖放到对应舱位来分配点数，点击已分配的骰子可收回
      </p>
      <p className="text-center text-xs text-neon-cyan mt-1">
        提示：维修舱工作时会补充冷却剂，高温时可释放冷却剂降温
      </p>
    </div>
  );
};
