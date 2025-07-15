import React from 'react';
import { motion } from 'framer-motion';
import { Car as Cards, Wand2, Heart, Home } from 'lucide-react';

interface NavigationProps {
  currentMode: string;
  onModeChange: (mode: 'landing' | 'browse' | 'build' | 'favorites') => void;
  favoritesCount: number;
}

const Navigation: React.FC<NavigationProps> = ({ currentMode, onModeChange, favoritesCount }) => {
  const navItems = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'browse', label: 'Browse Deck', icon: Cards },
    { id: 'build', label: 'Build Card', icon: Wand2 },
    { id: 'favorites', label: 'Favorites', icon: Heart, count: favoritesCount },
  ];

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Cards className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Cold DM Battlecards</span>
          </div>

          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentMode === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => onModeChange(item.id as any)}
                  className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-400 shadow-lg shadow-cyan-500/20'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.count}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg"
                      style={{ zIndex: -1 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;