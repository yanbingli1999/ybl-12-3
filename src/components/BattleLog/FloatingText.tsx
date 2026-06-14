import React, { useEffect, useState } from 'react';
import type { BattleLogEntry } from '../../types';

interface FloatingTextProps {
  logs: BattleLogEntry[];
}

interface FloatingMessage {
  id: string;
  text: string;
  color: string;
  x: number;
  y: number;
}

const textColors: Record<BattleLogEntry['type'], string> = {
  damage: '#ff3366',
  heal: '#33ff66',
  shield: '#00ffcc',
  effect: '#9933ff',
  system: '#888888',
  crit: '#ffcc00',
  miss: '#666666',
};

export const FloatingText: React.FC<FloatingTextProps> = ({ logs }) => {
  const [messages, setMessages] = useState<FloatingMessage[]>([]);

  useEffect(() => {
    if (logs.length === 0) return;
    
    const latestLog = logs[logs.length - 1];
    if (latestLog.type === 'system') return;
    
    const newMessage: FloatingMessage = {
      id: latestLog.id,
      text: latestLog.value ? `${latestLog.message} ${latestLog.value}` : latestLog.message,
      color: textColors[latestLog.type],
      x: 30 + Math.random() * 40,
      y: 40 + Math.random() * 20,
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    const timer = setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== newMessage.id));
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [logs.length]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {messages.map(msg => (
        <div
          key={msg.id}
          className="absolute animate-damage-float font-display font-bold text-2xl"
          style={{
            left: `${msg.x}%`,
            top: `${msg.y}%`,
            color: msg.color,
            textShadow: `0 0 10px ${msg.color}, 0 0 20px ${msg.color}`,
          }}
        >
          {msg.text}
        </div>
      ))}
    </div>
  );
};
