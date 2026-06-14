import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Swords, Wrench, History, Settings, Coins } from 'lucide-react';
import { useShipStore } from '../../store/useShipStore';

export const NavBar: React.FC = () => {
  const location = useLocation();
  const { rewardPoints, stats } = useShipStore();

  const navItems = [
    { path: '/', icon: Swords, label: '战斗' },
    { path: '/upgrade', icon: Wrench, label: '改装' },
    { path: '/history', icon: History, label: '战报' },
    { path: '/config', icon: Settings, label: '设置' },
  ];

  return (
    <nav className="glass-panel neon-border rounded-xl p-2 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚀</span>
          <h1 className="text-xl font-display font-bold text-neon-blue hidden sm:block">
            星舰骰子指挥
          </h1>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-1 sm:gap-2 px-3 py-2 rounded-lg
                transition-all duration-200
                ${isActive 
                  ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/50' 
                  : 'text-gray-400 hover:text-white hover:bg-space-700'}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-neon-yellow">
              <Coins className="w-4 h-4" />
              <span className="font-display font-bold">{rewardPoints}</span>
            </div>
            <div className="text-gray-400">
              胜场: <span className="text-neon-green font-display">{stats.victories}</span>
            </div>
            <div className="text-gray-400">
              连胜: <span className="text-neon-purple font-display">{stats.currentStreak}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
