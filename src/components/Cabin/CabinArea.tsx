import React from 'react';
import { useDiceStore } from '../../store/useDiceStore';
import { useShipStore } from '../../store/useShipStore';
import { CabinSlot } from './CabinSlot';
import type { CabinType } from '../../types';

interface CabinAreaProps {
  disabled?: boolean;
}

export const CabinArea: React.FC<CabinAreaProps> = ({ disabled }) => {
  const { dice, assignDie } = useDiceStore();
  const { ship } = useShipStore();

  const handleDrop = (cabinType: CabinType, dieId: string) => {
    assignDie(dieId, cabinType);
  };

  const handleRemoveDie = (dieId: string) => {
    assignDie(dieId, null);
  };

  const getDiceForCabin = (cabinType: CabinType) => {
    return dice.filter(d => d.assignedTo === cabinType);
  };

  const getTotalPoints = (cabinType: CabinType) => {
    return getDiceForCabin(cabinType).reduce((sum, d) => sum + d.value, 0);
  };

  const cabinOrder: CabinType[] = ['engine', 'shield', 'weapon', 'repair', 'scanner'];

  return (
    <div className="glass-panel neon-border p-6 rounded-xl">
      <h3 className="text-xl font-display font-bold text-neon-blue mb-4">舱位分配</h3>
      
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
              disabled={disabled}
            />
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-500 mt-4">
        将骰子拖放到对应舱位来分配点数，点击已分配的骰子可收回
      </p>
    </div>
  );
};
