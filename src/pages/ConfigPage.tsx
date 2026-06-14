import React, { useState } from 'react';
import { Settings, RotateCcw, Save, Flame, Shield, Crosshair, Wrench, Zap, Info } from 'lucide-react';
import { useConfigStore } from '../store/useConfigStore';
import { useShipStore } from '../store/useShipStore';
import { Modal } from '../components/UI/Modal';
import { resetSaveData, exportSaveData, importSaveData } from '../utils/storage';
import { defaultConfig } from '../data/defaultConfig';

export const ConfigPage: React.FC = () => {
  const { config, updateConfig, resetConfig } = useConfigStore();
  const { resetShip } = useShipStore();
  const [showResetModal, setShowResetModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');

  const handleSliderChange = (key: keyof typeof config, value: number) => {
    updateConfig(key, value);
  };

  const handleResetConfig = () => {
    resetConfig();
  };

  const handleResetAllData = () => {
    resetSaveData();
    resetShip();
    resetConfig();
    setShowResetModal(false);
    window.location.reload();
  };

  const handleExportData = () => {
    const data = exportSaveData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `starship_dice_save_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = () => {
    try {
      const success = importSaveData(importText);
      if (success) {
        setImportError('');
        setShowImportModal(false);
        setImportText('');
        window.location.reload();
      } else {
        setImportError('导入失败，请检查数据格式');
      }
    } catch (e) {
      setImportError('导入失败：JSON格式错误');
    }
  };

  const configItems = [
    {
      key: 'overheatThreshold' as const,
      name: '过热阈值',
      description: '单舱位分配点数超过此值将导致舱室过热损坏',
      icon: Flame,
      color: 'text-neon-red',
      min: 5,
      max: 20,
      step: 1,
      unit: '点',
    },
    {
      key: 'shieldAbsorptionRate' as const,
      name: '护盾吸收率',
      description: '护盾能够吸收的伤害比例',
      icon: Shield,
      color: 'text-neon-cyan',
      min: 0.1,
      max: 0.9,
      step: 0.05,
      unit: '%',
      displayMultiplier: 100,
    },
    {
      key: 'critMultiplier' as const,
      name: '暴击倍率',
      description: '暴击时的伤害倍率',
      icon: Crosshair,
      color: 'text-neon-yellow',
      min: 1.5,
      max: 4,
      step: 0.1,
      unit: 'x',
    },
    {
      key: 'critBonusRate' as const,
      name: '暴击加成率',
      description: '每个6点骰子额外增加的暴击率',
      icon: Crosshair,
      color: 'text-neon-yellow',
      min: 0,
      max: 0.3,
      step: 0.01,
      unit: '%',
      displayMultiplier: 100,
    },
    {
      key: 'repairCooldown' as const,
      name: '维修冷却',
      description: '舱室损坏后需要冷却的回合数',
      icon: Wrench,
      color: 'text-neon-green',
      min: 1,
      max: 5,
      step: 1,
      unit: '回合',
    },
    {
      key: 'engineEvasionBonus' as const,
      name: '引擎闪避加成',
      description: '每点引擎点数增加的闪避率',
      icon: Zap,
      color: 'text-neon-purple',
      min: 0.01,
      max: 0.15,
      step: 0.01,
      unit: '%',
      displayMultiplier: 100,
    },
    {
      key: 'scanEvasionReduction' as const,
      name: '扫描削弱效果',
      description: '每点扫描点数降低的敌方闪避率',
      icon: Zap,
      color: 'text-neon-blue',
      min: 0.01,
      max: 0.15,
      step: 0.01,
      unit: '%',
      displayMultiplier: 100,
    },
    {
      key: 'maxRerolls' as const,
      name: '最大重掷次数',
      description: '每回合可以重掷骰子的次数',
      icon: RotateCcw,
      color: 'text-white',
      min: 0,
      max: 5,
      step: 1,
      unit: '次',
    },
    {
      key: 'diceCount' as const,
      name: '骰子数量',
      description: '每回合可用的骰子数量',
      icon: Settings,
      color: 'text-white',
      min: 3,
      max: 8,
      step: 1,
      unit: '颗',
    },
    {
      key: 'energyCostPerPoint' as const,
      name: '能量消耗系数',
      description: '每点骰子点数消耗的能量（保留功能）',
      icon: Zap,
      color: 'text-neon-yellow',
      min: 0,
      max: 3,
      step: 0.5,
      unit: '能量/点',
    },
    {
      key: 'enemyDamageVariance' as const,
      name: '敌人伤害波动',
      description: '敌人伤害的随机波动范围',
      icon: Crosshair,
      color: 'text-neon-red',
      min: 0,
      max: 0.5,
      step: 0.05,
      unit: '%',
      displayMultiplier: 100,
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold text-neon-blue flex items-center gap-2">
        <Settings className="w-7 h-7" />
        游戏设置
      </h2>

      <div className="glass-panel neon-border p-4 rounded-xl mb-6">
        <div className="flex items-start gap-3 p-3 bg-neon-blue/10 rounded-lg">
          <Info className="w-5 h-5 text-neon-blue flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-neon-blue font-medium">关于游戏设置</p>
            <p className="text-sm text-gray-400 mt-1">
              调整这些参数可以改变游戏体验。所有设置会自动保存到本地。
              点击"重置为默认值"可以恢复原始设置。
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {configItems.map(item => {
          const Icon = item.icon;
          const displayValue = item.displayMultiplier 
            ? (config[item.key] * item.displayMultiplier).toFixed(0)
            : config[item.key];
          const defaultDisplayValue = item.displayMultiplier
            ? (defaultConfig[item.key] * item.displayMultiplier).toFixed(0)
            : defaultConfig[item.key];
          const isModified = config[item.key] !== defaultConfig[item.key];

          return (
            <div
              key={item.key}
              className={`glass-panel p-4 rounded-xl border ${isModified ? 'border-neon-yellow/50' : 'border-space-600'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${item.color}`} />
                  <div>
                    <h4 className="font-display font-bold text-white flex items-center gap-2">
                      {item.name}
                      {isModified && (
                        <span className="text-xs px-2 py-0.5 bg-neon-yellow/20 text-neon-yellow rounded">
                          已修改
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-gray-400">{item.description}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    当前: <span className={`font-display font-bold ${item.color}`}>{displayValue}{item.unit}</span>
                  </span>
                  <span className="text-xs text-gray-500">
                    默认: {defaultDisplayValue}{item.unit}
                  </span>
                </div>
                
                <input
                  type="range"
                  min={item.min}
                  max={item.max}
                  step={item.step}
                  value={config[item.key]}
                  onChange={(e) => handleSliderChange(item.key, parseFloat(e.target.value))}
                  className="w-full h-2 bg-space-700 rounded-lg appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-neon-blue
                    [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,212,255,0.5)]
                    [&::-webkit-slider-thumb]:cursor-pointer
                  "
                />

                <div className="flex justify-between text-xs text-gray-500">
                  <span>{item.min}{item.unit}</span>
                  <span>{item.max}{item.unit}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-4 mt-8">
        <button
          onClick={handleResetConfig}
          className="px-4 py-2 bg-space-700 border border-space-600 rounded-lg text-white hover:bg-space-600 transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          重置为默认值
        </button>
        
        <button
          onClick={handleExportData}
          className="px-4 py-2 bg-neon-green/20 border border-neon-green text-neon-green rounded-lg hover:bg-neon-green/30 transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          导出存档
        </button>
        
        <button
          onClick={() => setShowImportModal(true)}
          className="px-4 py-2 bg-neon-blue/20 border border-neon-blue text-neon-blue rounded-lg hover:bg-neon-blue/30 transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          导入存档
        </button>
        
        <button
          onClick={() => setShowResetModal(true)}
          className="px-4 py-2 bg-neon-red/20 border border-neon-red text-neon-red rounded-lg hover:bg-neon-red/30 transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          重置所有数据
        </button>
      </div>

      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="确认重置"
        maxWidth="max-w-md"
      >
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-display font-bold text-neon-red mb-2">
            确定要重置所有数据吗？
          </h3>
          <p className="text-gray-400 mb-6">
            此操作将清除所有游戏进度，包括舰船升级、战斗记录、设置等。
            <br />
            <span className="text-neon-red font-bold">此操作无法撤销！</span>
          </p>
          
          <div className="flex gap-4">
            <button
              onClick={() => setShowResetModal(false)}
              className="flex-1 px-4 py-3 bg-space-700 border border-space-600 rounded-lg text-white hover:bg-space-600 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleResetAllData}
              className="flex-1 btn-danger"
            >
              确认重置
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportText('');
          setImportError('');
        }}
        title="导入存档"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            将导出的存档JSON数据粘贴到下方文本框中，然后点击导入。
          </p>
          
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='{"ship": {...}, "upgrades": [...], ...}'
            className="w-full h-40 bg-space-900 border border-space-600 rounded-lg p-3 text-sm font-mono text-white resize-none focus:border-neon-blue focus:outline-none"
          />
          
          {importError && (
            <p className="text-sm text-neon-red">{importError}</p>
          )}
          
          <div className="flex gap-4">
            <button
              onClick={() => {
                setShowImportModal(false);
                setImportText('');
                setImportError('');
              }}
              className="flex-1 px-4 py-3 bg-space-700 border border-space-600 rounded-lg text-white hover:bg-space-600 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleImportData}
              disabled={!importText.trim()}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              导入
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
