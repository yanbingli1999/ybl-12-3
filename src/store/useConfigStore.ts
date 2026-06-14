import { create } from 'zustand';
import type { GameConfig } from '../types';
import { defaultConfig } from '../data/defaultConfig';
import { loadConfig, saveConfig } from '../utils/storage';

interface ConfigState {
  config: GameConfig;
  setConfig: (config: GameConfig) => void;
  updateConfig: <K extends keyof GameConfig>(key: K, value: GameConfig[K]) => void;
  resetConfig: () => void;
  loadSavedConfig: () => void;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  config: defaultConfig,
  
  setConfig: (config) => {
    set({ config });
    saveConfig(config);
  },
  
  updateConfig: (key, value) => {
    const newConfig = { ...get().config, [key]: value };
    set({ config: newConfig });
    saveConfig(newConfig);
  },
  
  resetConfig: () => {
    set({ config: defaultConfig });
    saveConfig(defaultConfig);
  },
  
  loadSavedConfig: () => {
    const saved = loadConfig();
    set({ config: saved });
  },
}));
