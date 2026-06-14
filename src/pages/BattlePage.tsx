import React, { useEffect, useState } from 'react';
import { Play, Flag, SkipForward, RotateCcw, Trophy, Skull } from 'lucide-react';
import { DiceArea } from '../components/Dice/DiceArea';
import { CabinArea } from '../components/Cabin/CabinArea';
import { ShipStatus } from '../components/Ship/ShipStatus';
import { EnemyIntent } from '../components/Ship/EnemyIntent';
import { BattleLog } from '../components/BattleLog/BattleLog';
import { FloatingText } from '../components/BattleLog/FloatingText';
import { Modal } from '../components/UI/Modal';
import { useGameStore } from '../store/useGameStore';
import { useDiceStore } from '../store/useDiceStore';
import { useShipStore } from '../store/useShipStore';
import { hasAnyDiceAssigned } from '../utils/dice';

export const BattlePage: React.FC = () => {
  const { 
    battleState, 
    currentDifficulty,
    startBattle, 
    confirmTurn, 
    fleeBattle, 
    resetBattle,
    setDifficulty,
    isReplaying,
  } = useGameStore();
  const { dice } = useDiceStore();
  const { rewardPoints, addRewardPoints } = useShipStore();
  const [showResultModal, setShowResultModal] = useState(false);

  useEffect(() => {
    if (battleState && battleState.result !== 'ongoing') {
      setShowResultModal(true);
    }
  }, [battleState?.result]);

  const handleStartBattle = () => {
    startBattle();
    setShowResultModal(false);
  };

  const handleConfirmTurn = () => {
    if (!hasAnyDiceAssigned(dice)) {
      alert('请至少分配一个骰子到舱位！');
      return;
    }
    confirmTurn();
  };

  const handleCloseModal = () => {
    setShowResultModal(false);
  };

  const handleBackToMenu = () => {
    resetBattle();
    setShowResultModal(false);
  };

  const isPlayerPhase = battleState?.phase === 'player';
  const canConfirm = isPlayerPhase && hasAnyDiceAssigned(dice) && !isReplaying;

  const getResultIcon = () => {
    if (!battleState) return null;
    switch (battleState.result) {
      case 'victory': return <Trophy className="w-16 h-16 text-neon-yellow" />;
      case 'defeat': return <Skull className="w-16 h-16 text-neon-red" />;
      case 'fled': return <Flag className="w-16 h-16 text-gray-500" />;
      default: return null;
    }
  };

  const getResultTitle = () => {
    if (!battleState) return '';
    switch (battleState.result) {
      case 'victory': return '胜利！';
      case 'defeat': return '战败...';
      case 'fled': return '成功撤退';
      default: return '';
    }
  };

  if (!battleState) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="glass-panel neon-border p-8 rounded-xl max-w-md w-full text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-display font-bold text-neon-blue mb-4">
            准备战斗
          </h2>
          <p className="text-gray-400 mb-6">
            选择难度，开始你的太空冒险！
          </p>
          
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">难度选择</label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map(diff => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`
                    w-12 h-12 rounded-lg font-display font-bold
                    transition-all duration-200
                    ${currentDifficulty === diff
                      ? 'bg-neon-blue text-space-900'
                      : 'bg-space-700 text-gray-400 hover:bg-space-600'}
                  `}
                >
                  {diff}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              当前: 难度 {currentDifficulty} - {
                currentDifficulty <= 2 ? '新手' : 
                currentDifficulty <= 3 ? '普通' : 
                currentDifficulty <= 4 ? '困难' : '地狱'
              }
            </p>
          </div>

          <div className="mb-6 p-4 bg-space-900/50 rounded-lg">
            <div className="text-sm text-gray-400">当前点数</div>
            <div className="text-2xl font-display font-bold text-neon-yellow">
              💰 {rewardPoints}
            </div>
          </div>

          <button
            onClick={handleStartBattle}
            className="btn-primary w-full flex items-center justify-center gap-2 text-lg"
          >
            <Play className="w-6 h-6" />
            开始战斗
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <FloatingText logs={battleState.logs} />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="glass-panel px-4 py-2 rounded-lg">
            <span className="text-gray-400 text-sm">回合</span>
            <span className="ml-2 text-2xl font-display font-bold text-neon-blue">
              {battleState.turn}
            </span>
          </div>
          <div className="glass-panel px-4 py-2 rounded-lg">
            <span className="text-gray-400 text-sm">难度</span>
            <span className="ml-2 text-lg font-display font-bold text-neon-yellow">
              {currentDifficulty}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fleeBattle}
            disabled={!isPlayerPhase || isReplaying}
            className="px-4 py-2 bg-space-700 border border-space-600 rounded-lg text-gray-400 hover:bg-space-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Flag className="w-5 h-5" />
          </button>
          <button
            onClick={handleBackToMenu}
            className="px-4 py-2 bg-space-700 border border-space-600 rounded-lg text-gray-400 hover:bg-space-600 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <ShipStatus ship={battleState.player} isPlayer={true} />
        
        <div className="flex flex-col gap-4">
          <EnemyIntent enemy={battleState.enemy} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-2 animate-float">⚔️</div>
              <div className="text-sm text-gray-400">
                {isPlayerPhase ? '你的回合' : '敌方回合'}
              </div>
            </div>
          </div>
        </div>
        
        <ShipStatus ship={battleState.enemy} isPlayer={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <DiceArea disabled={!isPlayerPhase || isReplaying} />
          
          {isPlayerPhase && !isReplaying && (
            <div className="flex justify-center gap-4">
              <button
                onClick={handleConfirmTurn}
                disabled={!canConfirm}
                className={`
                  btn-success flex items-center gap-2
                  ${!canConfirm ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <SkipForward className="w-5 h-5" />
                确认回合
              </button>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <CabinArea disabled={!isPlayerPhase || isReplaying} />
        </div>
      </div>

      <div className="mt-4">
        <BattleLog logs={battleState.logs} />
      </div>

      <Modal
        isOpen={showResultModal}
        onClose={handleCloseModal}
        title="战斗结束"
        maxWidth="max-w-md"
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            {getResultIcon()}
          </div>
          <h3 className="text-3xl font-display font-bold text-white mb-2">
            {getResultTitle()}
          </h3>
          <p className="text-gray-400 mb-6">
            战斗持续 {battleState.turn} 回合
          </p>

          {battleState.result === 'victory' && (
            <div className="bg-neon-yellow/10 border border-neon-yellow/30 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-400 mb-1">获得奖励</div>
              <div className="text-3xl font-display font-bold text-neon-yellow">
                +{battleState.rewardPoints} 💰
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="bg-space-900/50 p-3 rounded-lg">
              <div className="text-gray-400">剩余HP</div>
              <div className="text-xl font-display font-bold text-neon-green">
                {battleState.player.hp} / {battleState.player.maxHp}
              </div>
            </div>
            <div className="bg-space-900/50 p-3 rounded-lg">
              <div className="text-gray-400">敌方HP</div>
              <div className="text-xl font-display font-bold text-neon-red">
                {battleState.enemy.hp} / {battleState.enemy.maxHp}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleBackToMenu}
              className="flex-1 px-4 py-3 bg-space-700 border border-space-600 rounded-lg text-white hover:bg-space-600 transition-colors"
            >
              返回菜单
            </button>
            <button
              onClick={handleStartBattle}
              className="flex-1 btn-primary"
            >
              再战一场
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
