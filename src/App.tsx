import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';
import DeckBrowser from './components/DeckBrowser';
import CardBuilder from './components/CardBuilder';
import FavoritesVault from './components/FavoritesVault';
import Navigation from './components/Navigation';
import { CardData, FavoriteCard } from './types';

type AppMode = 'landing' | 'browse' | 'build' | 'favorites';

function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('landing');
  const [favorites, setFavorites] = useState<FavoriteCard[]>([]);

  // Load favorites from localStorage on app start
  useEffect(() => {
    const savedFavorites = localStorage.getItem('coldDM_favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('coldDM_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = (card: CardData) => {
    const favoriteCard: FavoriteCard = {
      id: Date.now().toString(),
      ...card,
      savedAt: new Date().toISOString(),
    };
    setFavorites(prev => [...prev, favoriteCard]);
  };

  const removeFromFavorites = (cardId: string) => {
    setFavorites(prev => prev.filter(card => card.id !== cardId));
  };

  const isCardFavorited = (cardTitle: string) => {
    return favorites.some(card => card.title === cardTitle);
  };

  const renderCurrentMode = () => {
    switch (currentMode) {
      case 'landing':
        return <LandingPage onModeChange={setCurrentMode} />;
      case 'browse':
        return (
          <DeckBrowser
            favorites={favorites}
            onAddToFavorites={addToFavorites}
            onRemoveFromFavorites={removeFromFavorites}
            isCardFavorited={isCardFavorited}
          />
        );
      case 'build':
        return <CardBuilder onAddToFavorites={addToFavorites} />;
      case 'favorites':
        return (
          <FavoritesVault
            favorites={favorites}
            onRemoveFromFavorites={removeFromFavorites}
          />
        );
      default:
        return <LandingPage onModeChange={setCurrentMode} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_70%)]" />
      
      {currentMode !== 'landing' && (
        <Navigation
          currentMode={currentMode}
          onModeChange={setCurrentMode}
          favoritesCount={favorites.length}
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="relative z-10"
        >
          {renderCurrentMode()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;