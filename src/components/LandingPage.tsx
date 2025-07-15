import React from 'react';
import { motion } from 'framer-motion';
import { Car as Cards, Wand2, Heart, Zap, Target, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onModeChange: (mode: 'browse' | 'build' | 'favorites') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onModeChange }) => {
  const features = [
    {
      icon: Cards,
      title: "Browse Deck",
      description: "Explore cold DM cards with filters & search",
      gradient: "from-cyan-400 to-blue-500",
      action: () => onModeChange('browse')
    },
    {
      icon: Wand2,
      title: "Build Cards",
      description: "Create animated 9:16 visual cards with themes & effects",
      gradient: "from-purple-400 to-pink-500",
      action: () => onModeChange('build')
    },
    {
      icon: Heart,
      title: "Favorites Vault",
      description: "Save and organize your most-used messages and cards",
      gradient: "from-red-400 to-pink-500",
      action: () => onModeChange('favorites')
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16 mt-12"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-3xl mb-8 shadow-2xl shadow-cyan-500/20"
        >
          <Cards className="w-12 h-12 text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
        >
          Cold DM
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {' '}Battlecards
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
        >
          Create, customize, and share cold outreach messages as beautifully animated tactical cards — 
          part swipeable deck, part visual toolkit, part creator weapon.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-white">100% Free to Start</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <Target className="w-4 h-4 text-green-400" />
            {/* Removed 'Proven Templates' */}
          </div>
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-white">Animated Exports</span>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="group cursor-pointer"
              onClick={feature.action}
            >
              <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl mb-6 shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                  {feature.title}
                </h3>

                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  {feature.description}
                </p>

                <div className="flex items-center text-cyan-400 font-medium group-hover:text-cyan-300 transition-colors duration-300">
                  <span>Get Started</span>
                  <motion.div
                    className="ml-2"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="mt-16 text-center"
      >
        <p className="text-gray-400 text-sm">
          No login required • Local storage only
        </p>
      </motion.div>
    </div>
  );
};

export default LandingPage;