import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Save, Download, Upload } from 'lucide-react';
import { getFilterService, FilterConfig, FilterRule, FilterOperator } from '../services/filterService';
import { getEventBus } from '../services/eventBusService';

interface AdvancedFilterPanelProps {
  onFiltersApply: (filter: FilterConfig) => void;
  onFiltersClear: () => void;
  dataType: 'discounts' | 'users' | 'points';
  isOpen: boolean;
  onClose: () => void;
}

export const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({
  onFiltersApply,
  onFiltersClear,
  dataType,
  isOpen,
  onClose,
}) => {
  const filterService = getFilterService();
  const eventBus = getEventBus();
  const [currentFilter, setCurrentFilter] = useState<FilterConfig>(
    filterService.createFilter(`${dataType} Filter`)
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [presetName, setPresetName] = useState('');
  const [showPresetSave, setShowPresetSave] = useState(false);

  const handleAddRule = useCallback(() => {
    const newRule = filterService.createRule('', 'equals', '');
    setCurrentFilter(filterService.addRule(currentFilter, newRule));
  }, [currentFilter, filterService]);

  const handleRemoveRule = useCallback((ruleId: string) => {
    setCurrentFilter(filterService.removeRule(currentFilter, ruleId));
  }, [currentFilter, filterService]);

  const handleUpdateRule = useCallback((ruleId: string, updates: Partial<FilterRule>) => {
    setCurrentFilter(filterService.updateRule(currentFilter, ruleId, updates));
  }, [currentFilter, filterService]);

  const handleApplyFilters = useCallback(() => {
    onFiltersApply(currentFilter);
    eventBus.publish('filter:applied', { filter: currentFilter }, 'filter-panel');
  }, [currentFilter, onFiltersApply, eventBus]);

  const handleClearFilters = useCallback(() => {
    setCurrentFilter(filterService.createFilter(`${dataType} Filter`));
    setSearchTerm('');
    onFiltersClear();
    eventBus.publish('filter:cleared', {}, 'filter-panel');
  }, [dataType, filterService, onFiltersClear, eventBus]);

  const handleSavePreset = useCallback(() => {
    if (presetName.trim()) {
      const preset = {
        id: `preset_${Date.now()}`,
        name: presetName,
        config: currentFilter,
      };
      filterService.savePreset(preset);
      setPresetName('');
      setShowPresetSave(false);
      eventBus.publish('preset:saved', { preset }, 'filter-panel');
    }
  }, [presetName, currentFilter, filterService, eventBus]);

  const handleLoadPreset = useCallback((presetId: string) => {
    const preset = filterService.getPreset(presetId);
    if (preset) {
      setCurrentFilter(preset.config);
    }
  }, [filterService]);

  const getFieldOptions = (): string[] => {
    switch (dataType) {
      case 'discounts':
        return ['code', 'type', 'percentage', 'status', 'createdAt', 'expiresAt', 'usedCount'];
      case 'users':
        return ['name', 'email', 'tier', 'points', 'createdAt', 'lastActivity'];
      case 'points':
        return ['userId', 'type', 'points', 'reason', 'timestamp'];
      default:
        return [];
    }
  };

  const getOperatorOptions = (): FilterOperator[] => {
    return ['equals', 'contains', 'startsWith', 'endsWith', 'gt', 'gte', 'lt', 'lte', 'between', 'in', 'exists'];
  };

  const presets = filterService.getAllPresets();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            className="fixed left-0 top-0 h-full w-96 bg-zinc-900 border-r border-white/10 z-50 overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Advanced Filters</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search */}
              <div>
                <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">
                  Quick Search
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]"
                />
              </div>

              {/* Filter Rules */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold uppercase text-gray-400">
                    Filter Rules
                  </label>
                  <button
                    onClick={handleAddRule}
                    className="flex items-center gap-1 text-[#00ff88] hover:text-white text-xs font-bold transition-colors"
                  >
                    <Plus size={14} />
                    Add Rule
                  </button>
                </div>

                <div className="space-y-3">
                  {currentFilter.rules.map((rule) => (
                    <motion.div
                      key={rule.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-zinc-800 border border-white/10 rounded-lg p-3 space-y-2"
                    >
                      <div className="flex gap-2">
                        <select
                          value={rule.field}
                          onChange={(e) => handleUpdateRule(rule.id, { field: e.target.value })}
                          className="flex-1 bg-zinc-700 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#00ff88]"
                        >
                          <option value="">Select Field</option>
                          {getFieldOptions().map(field => (
                            <option key={field} value={field}>{field}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleRemoveRule(rule.id)}
                          className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <select
                          value={rule.operator}
                          onChange={(e) => handleUpdateRule(rule.id, { operator: e.target.value as FilterOperator })}
                          className="flex-1 bg-zinc-700 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#00ff88]"
                        >
                          {getOperatorOptions().map(op => (
                            <option key={op} value={op}>{op}</option>
                          ))}
                        </select>
                      </div>

                      <input
                        type="text"
                        value={rule.value}
                        onChange={(e) => handleUpdateRule(rule.id, { value: e.target.value })}
                        placeholder="Value"
                        className="w-full bg-zinc-700 border border-white/10 rounded px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Logic */}
              <div>
                <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">
                  Logic
                </label>
                <div className="flex gap-2">
                  {(['AND', 'OR'] as const).map(logic => (
                    <button
                      key={logic}
                      onClick={() => setCurrentFilter({ ...currentFilter, logic })}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                        currentFilter.logic === logic
                          ? 'bg-[#00ff88] text-black'
                          : 'bg-zinc-800 text-white hover:bg-zinc-700'
                      }`}
                    >
                      {logic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Presets */}
              {presets.length > 0 && (
                <div>
                  <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">
                    Saved Presets
                  </label>
                  <div className="space-y-2">
                    {presets.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => handleLoadPreset(preset.id)}
                        className="w-full text-left px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-lg text-xs text-white transition-colors"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Preset */}
              <AnimatePresence>
                {showPresetSave && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-zinc-800 border border-white/10 rounded-lg p-3 space-y-2"
                  >
                    <input
                      type="text"
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      placeholder="Preset name..."
                      className="w-full bg-zinc-700 border border-white/10 rounded px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSavePreset}
                        className="flex-1 bg-[#00ff88] text-black py-1 rounded text-xs font-bold hover:bg-white transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setShowPresetSave(false)}
                        className="flex-1 bg-zinc-700 text-white py-1 rounded text-xs font-bold hover:bg-zinc-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="space-y-2 pt-4 border-t border-white/10">
                <button
                  onClick={handleApplyFilters}
                  className="w-full bg-[#00ff88] text-black py-2 rounded-lg font-bold hover:bg-white transition-colors"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => setShowPresetSave(true)}
                  className="w-full flex items-center justify-center gap-2 bg-zinc-800 text-white py-2 rounded-lg font-bold hover:bg-zinc-700 transition-colors"
                >
                  <Save size={16} />
                  Save as Preset
                </button>
                <button
                  onClick={handleClearFilters}
                  className="w-full bg-red-500/20 text-red-400 py-2 rounded-lg font-bold hover:bg-red-500/30 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
