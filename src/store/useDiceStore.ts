import { create } from 'zustand';
import type { Die, CabinType } from '../types';
import { 
  createInitialDice, 
  rollDice, 
  toggleLock, 
  assignDieToCabin, 
  unassignAllDice,
  resetRollingState,
} from '../utils/dice';
import { useConfigStore } from './useConfigStore';

interface DiceState {
  dice: Die[];
  rerollsRemaining: number;
  isRolling: boolean;
  
  initializeDice: () => void;
  roll: () => void;
  finishRolling: () => void;
  toggleDieLock: (dieId: string) => void;
  assignDie: (dieId: string, cabinType: CabinType | null) => void;
  unassignAll: () => void;
  resetDice: () => void;
  setDice: (dice: Die[]) => void;
}

export const useDiceStore = create<DiceState>((set, get) => ({
  dice: [],
  rerollsRemaining: 0,
  isRolling: false,
  
  initializeDice: () => {
    const config = useConfigStore.getState().config;
    set({
      dice: createInitialDice(config.diceCount),
      rerollsRemaining: config.maxRerolls,
    });
  },
  
  roll: () => {
    const { dice, rerollsRemaining } = get();
    if (rerollsRemaining <= 0 && dice.some(d => d.value > 0)) return;
    
    const rolledDice = rollDice(dice);
    set({
      dice: rolledDice,
      rerollsRemaining: dice[0]?.value > 0 ? rerollsRemaining - 1 : rerollsRemaining,
      isRolling: true,
    });
    
    setTimeout(() => {
      get().finishRolling();
    }, 500);
  },
  
  finishRolling: () => {
    const { dice } = get();
    set({
      dice: resetRollingState(dice),
      isRolling: false,
    });
  },
  
  toggleDieLock: (dieId) => {
    const { dice } = get();
    set({ dice: toggleLock(dice, dieId) });
  },
  
  assignDie: (dieId, cabinType) => {
    const { dice } = get();
    set({ dice: assignDieToCabin(dice, dieId, cabinType) });
  },
  
  unassignAll: () => {
    const { dice } = get();
    set({ dice: unassignAllDice(dice) });
  },
  
  resetDice: () => {
    const config = useConfigStore.getState().config;
    set({
      dice: createInitialDice(config.diceCount),
      rerollsRemaining: config.maxRerolls,
      isRolling: false,
    });
  },
  
  setDice: (dice) => {
    set({ dice });
  },
}));
