import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp, Sparkles } from 'lucide-react';
import { smartSearchService } from '../services/smartSearchService';

interface SmartSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const SmartSearchBar: React.FC<SmartSearchBarProps> = ({
  onSearch,
  placeholder = 'Search products...',
  autoFocus = false
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [popularSearches] = useState(smartSearchService.getPopularSearches());
  const [trendingSearches] = useState(smartSearchService.getTrendingSearches());
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    // Load search history
    setSearchHistory(smartSearchService.getSearchHistory());
  }, []);

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Save to history
    smartSearchService.saveSearchHistory(searchQuery);
    setSearchHistory(smartSearchService.getSearchHistory());

    // Trigger search
    onSearch(searchQuery);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handleClearHistory = () => {
    smartSearchService.clearSearchHistory();
    setSearchHistory([]);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`relative flex items-center bg-white/5 border rounded-xl overflow-hidden transition-all ${
            isFocused ? 'border-[#00ff88] shadow-lg shadow-[#00ff88]/20' : 'border-white/10'
          }`}
        >
          <Search
            size={20}
            className={`absolute left-4 transition-colors ${
              isFocused ? 'text-[#00ff88]' : 'text-gray-400'
            }`}
          />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(true);
            }}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-4 bg-transparent text-white placeholder-gray-400 outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={18} className="text-gray-400" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (isFocused || query) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-black border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50"
          >
            <div className="max-h-96 overflow-y-auto">
              {/* Search History */}
              {searchHistory.length > 0 && !query && (
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-gray-400 flex items-center gap-2">
                      <Clock size={16} />
                      Recent Searches
                    </h4>
                    <button
                      onClick={handleClearHistory}
                      className="text-xs text-gray-500 hover:text-white transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-1">
                    {searchHistory.slice(0, 5).map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(item)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              {!query && trendingSearches.length > 0 && (
                <div className="p-4 border-b border-white/10">
                  <h4 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
                    <TrendingUp size={16} className="text-[#00ff88]" />
                    Trending Now
                  </h4>
                  <div className="space-y-1">
                    {trendingSearches.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(item)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm flex items-center gap-2"
                      >
                        <Sparkles size={14} className="text-[#00ff88]" />
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              {!query && popularSearches.length > 0 && (
                <div className="p-4">
                  <h4 className="text-sm font-bold text-gray-400 mb-3">Popular Searches</h4>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(item)}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00ff88]/50 rounded-full text-sm transition-all"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {query && searchHistory.length === 0 && (
                <div className="p-8 text-center text-gray-400">
                  <Search size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Start typing to search...</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
