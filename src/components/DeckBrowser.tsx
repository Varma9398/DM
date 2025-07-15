import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Copy, Heart, Star, Zap, Crown } from 'lucide-react';
import { CardData, FavoriteCard } from '../types';
import { sampleCards } from '../data/sampleCards';

interface DeckBrowserProps {
  favorites: FavoriteCard[];
  onAddToFavorites: (card: CardData) => void;
  onRemoveFromFavorites: (cardId: string) => void;
  isCardFavorited: (cardTitle: string) => boolean;
}

const DeckBrowser: React.FC<DeckBrowserProps> = ({
  favorites,
  onAddToFavorites,
  onRemoveFromFavorites,
  isCardFavorited
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTone, setSelectedTone] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['all', 'creator', 'saas', 'freelance', 'networking', 'sales'];
  const tones = ['all', 'friendly', 'professional', 'bold', 'casual'];
  const rarities = ['all', 'common', 'rare', 'ultra'];

  const filteredCards = useMemo(() => {
    return sampleCards.filter(card => {
      const matchesSearch = card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           card.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           card.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || card.category === selectedCategory;
      const matchesTone = selectedTone === 'all' || card.tone === selectedTone;
      const matchesRarity = selectedRarity === 'all' || card.rarity === selectedRarity;
      
      return matchesSearch && matchesCategory && matchesTone && matchesRarity;
    });
  }, [searchQuery, selectedCategory, selectedTone, selectedRarity]);

  const handleCopyMessage = (message: string) => {
    navigator.clipboard.writeText(message);
    // You could add a toast notification here
  };

  const handleToggleFavorite = (card: CardData) => {
    if (isCardFavorited(card.title)) {
      const favoriteCard = favorites.find(fav => fav.title === card.title);
      if (favoriteCard) {
        onRemoveFromFavorites(favoriteCard.id);
      }
    } else {
      onAddToFavorites(card);
    }
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

  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Browse Deck</h1>
        <p className="text-gray-300 text-lg">Explore cold DM templates and save your favorites</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search cards, messages, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    {categories.map(category => (
                      <option key={category} value={category} className="bg-gray-800">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tone</label>
                  <select
                    value={selectedTone}
                    onChange={(e) => setSelectedTone(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    {tones.map(tone => (
                      <option key={tone} value={tone} className="bg-gray-800">
                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rarity</label>
                  <select
                    value={selectedRarity}
                    onChange={(e) => setSelectedRarity(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    {rarities.map(rarity => (
                      <option key={rarity} value={rarity} className="bg-gray-800">
                        {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-300">
          Showing {filteredCards.length} of {sampleCards.length} cards
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`bg-white/5 backdrop-blur-sm rounded-xl border-2 ${getRarityColor(card.rarity)} p-6 hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                {getRarityIcon(card.rarity)}
                <span className="text-sm font-medium text-gray-300 capitalize">{card.rarity}</span>
              </div>
              <button
                onClick={() => handleToggleFavorite(card)}
                className={`p-2 rounded-lg transition-colors ${
                  isCardFavorited(card.title)
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-red-400'
                }`}
              >
                <Heart className="w-5 h-5" fill={isCardFavorited(card.title) ? 'currentColor' : 'none'} />
              </button>
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

            <button
              onClick={() => handleCopyMessage(card.message)}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-medium"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Message</span>
            </button>
          </motion.div>
        ))}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No cards found matching your criteria.</p>
          <p className="text-gray-500 mt-2">Try adjusting your search or filter settings.</p>
        </div>
      )}
    </div>
  );
};

export default DeckBrowser;