import React, { useEffect, useRef } from 'react';
import { ScrollText } from 'lucide-react';
import type { BattleLogEntry } from '../../types';

interface BattleLogProps {
  logs: BattleLogEntry[];
  maxHeight?: string;
}

const logColors: Record<BattleLogEntry['type'], string> = {
  damage: 'text-neon-red',
  heal: 'text-neon-green',
  shield: 'text-neon-cyan',
  effect: 'text-neon-purple',
  system: 'text-gray-400',
  crit: 'text-neon-yellow',
  miss: 'text-gray-500',
};

const logSourceColors: Record<BattleLogEntry['source'], string> = {
  player: 'border-l-neon-blue',
  enemy: 'border-l-neon-red',
  system: 'border-l-gray-600',
};

export const BattleLog: React.FC<BattleLogProps> = ({ logs, maxHeight = '400px' }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="glass-panel neon-border p-4 rounded-xl">
      <h3 className="text-lg font-display font-bold text-neon-blue mb-3 flex items-center gap-2">
        <ScrollText className="w-5 h-5" />
        战斗日志
      </h3>
      
      <div 
        className="overflow-y-auto space-y-1"
        style={{ maxHeight }}
      >
        {logs.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">暂无战斗记录</p>
        ) : (
          logs.map((log, index) => (
            <div
              key={log.id}
              className={`
                text-sm py-2 px-3 rounded bg-space-900/50
                border-l-2 ${logSourceColors[log.source]}
                ${index === logs.length - 1 ? 'animate-pulse' : ''}
              `}
            >
              <div className="flex items-start gap-2">
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  [回合{log.turn}]
                </span>
                <span className={`font-bold ${logColors[log.type]}`}>
                  {log.type === 'crit' && '💥 '}
                  {log.type === 'miss' && '💨 '}
                  {log.message}
                  {log.value !== undefined && (
                    <span className="ml-1 font-display">({log.value})</span>
                  )}
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {formatTime(log.timestamp)}
              </div>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};
