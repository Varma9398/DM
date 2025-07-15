import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Copy, Trash2, Search, Filter, Star, Zap, Crown } from 'lucide-react';
import { FavoriteCard } from '../types';

interface FavoritesVaultProps {
  favorites: FavoriteCard[];
  onRemoveFromFavorites: (cardId: string) => void;
}

const FavoritesVault: React.FC<FavoritesVaultProps> = ({ favorites, onRemoveFromFavorites }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');

  const filteredAndSortedFavorites = favorites
    .filter(card => 
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
        case 'oldest':
          return new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const handleCopyMessage = (message: string) => {
    navigator.clipboard.writeText(message);
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Star className="w-4 h-4 text-gray-400" />;
      case 'rare': return <Zap className="w-4 h-4 text-blue-400" />;
      case 'ultra': return <Crown className="w-4 h-4 text-purple-400" />;
      default: return <Star className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-500/30';
      case 'rare': return 'border-blue-500/30';
      case 'ultra': return 'border-purple-500/30';
      default: return 'border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center">
          <Heart className="w-8 h-8 mr-3 text-red-500" fill="currentColor" />
          Favorites Vault
        </h1>
        <p className="text-gray-300 text-lg">
          Your saved cold DM cards and custom creations ({favorites.length} saved)
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-12 max-w-2xl mx-auto">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">No favorites yet</h3>
            <p className="text-gray-300 text-lg mb-8">
              Start exploring the deck or create your own cards to build your collection
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-medium">
                Browse Deck
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium">
                Create Card
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Search and Sort Controls */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search your favorites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'alphabetical')}
                className="px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                <option value="newest" className="bg-gray-800">Newest First</option>
                <option value="oldest" className="bg-gray-800">Oldest First</option>
                <option value="alphabetical" className="bg-gray-800">Alphabetical</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-300">
              Showing {filteredAndSortedFavorites.length} of {favorites.length} favorites
            </p>
          </div>

          {/* Favorites Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredAndSortedFavorites.map((card) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  layout
                  className={`bg-white/5 backdrop-blur-sm rounded-xl border-2 ${getRarityColor(card.rarity)} p-6 hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 group`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {getRarityIcon(card.rarity)}
                      <span className="text-sm font-medium text-gray-300 capitalize">{card.rarity}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Heart className="w-5 h-5 text-red-500" fill="currentColor" />
                      <button
                        onClick={() => onRemoveFromFavorites(card.id)}
                        className="p-1 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {card.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 mb-4">
                    <p className="text-gray-300 text-sm leading-relaxed">{card.message}</p>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
                    <p className="text-amber-400 text-sm">
                      <strong>💡 Tip:</strong> {card.tip}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <span>Saved {formatDate(card.savedAt)}</span>
                    <span className="capitalize">{card.category}</span>
                  </div>

                  <button
                    onClick={() => handleCopyMessage(card.message)}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-medium"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Message</span>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredAndSortedFavorites.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No favorites found matching "{searchQuery}"</p>
              <p className="text-gray-500 mt-2">Try searching for different keywords.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FavoritesVault;