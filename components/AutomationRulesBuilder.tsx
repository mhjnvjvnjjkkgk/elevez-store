import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Power, Save } from 'lucide-react';
import { Collection } from '../services/collectionService';
import { collectionAutomationService, AutomationRule } from '../services/collectionAutomationService';

interface AutomationRulesBuilderProps {
  collection: Collection;
  onBack: () => void;
}

export const AutomationRulesBuilder: React.FC<AutomationRulesBuilderProps> = ({
  collection,
  onBack
}) => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    trigger: 'product_added' as const,
    condition: 'equals' as const,
    value: '',
    action: 'add_to_collection' as const,
    enabled: true
  });

  useEffect(() => {
    loadRules();
  }, [collection.id]);

  const loadRules = async () => {
    try {
      setLoading(true);
      const data = await collectionAutomationService.getRulesForCollection(collection.id);
      setRules(data);
    } catch (error) {
      console.error('Error loading rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a rule name');
      return;
    }

    try {
      await collectionAutomationService.createRule({
        collectionId: collection.id,
        name: formData.name,
        trigger: formData.trigger,
        condition: formData.condition,
        value: formData.value,
        action: formData.action,
        enabled: formData.enabled
      });
      await loadRules();
      setShowForm(false);
      setFormData({
        name: '',
        trigger: 'product_added',
        condition: 'equals',
        value: '',
        action: 'add_to_collection',
        enabled: true
      });
    } catch (error) {
      console.error('Error creating rule:', error);
      alert('Failed to create rule');
    }
  };

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      await collectionAutomationService.updateRule(ruleId, { enabled: !enabled });
      await loadRules();
    } catch (error) {
      console.error('Error updating rule:', error);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (window.confirm('Delete this rule?')) {
      try {
        await collectionAutomationService.deleteRule(ruleId);
        await loadRules();
      } catch (error) {
        console.error('Error deleting rule:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 pb-20 px-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-3 border-[#00ff88]/20 border-t-[#00ff88] rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading rules...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            Back to Collections
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Automation Rules</h2>
              <p className="text-gray-400">Collection: {collection.name}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-[#00ff88] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#00dd77] transition-colors"
            >
              <Plus size={20} />
              New Rule
            </motion.button>
          </div>
        </motion.div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-white/10 rounded-lg p-6 mb-8"
          >
            <h3 className="text-xl font-bold text-white mb-4">Create New Rule</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Rule Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Add new products automatically"
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Trigger</label>
                  <select
                    value={formData.trigger}
                    onChange={(e) => setFormData({ ...formData, trigger: e.target.value as any })}
                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ff88]"
                  >
                    <option value="product_added">Product Added</option>
                    <option value="product_updated">Product Updated</option>
                    <option value="price_changed">Price Changed</option>
                    <option value="stock_changed">Stock Changed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ff88]"
                  >
                    <option value="equals">Equals</option>
                    <option value="greater_than">Greater Than</option>
                    <option value="less_than">Less Than</option>
                    <option value="contains">Contains</option>
                    <option value="in_range">In Range</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Value</label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="Enter condition value"
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <label className="flex items-center gap-2 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span>Enable Rule</span>
                </label>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddRule}
                    className="flex items-center gap-2 px-6 py-2 bg-[#00ff88] text-black rounded-lg font-bold hover:bg-[#00dd77] transition-colors"
                  >
                    <Save size={16} />
                    Save Rule
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="space-y-4">
          {rules.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-zinc-900 border border-white/10 rounded-lg"
            >
              <p className="text-gray-400">No automation rules yet. Create one to get started!</p>
            </motion.div>
          ) : (
            rules.map((rule, index) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-[#00ff88]/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">{rule.name}</h3>
                    <div className="space-y-1 text-sm text-gray-400">
                      <p>Trigger: <span className="text-[#00ff88]">{rule.trigger}</span></p>
                      <p>Condition: <span className="text-blue-400">{rule.condition}</span> {rule.value}</p>
                      <p>Status: <span className={rule.enabled ? 'text-green-400' : 'text-red-400'}>{rule.enabled ? 'Active' : 'Inactive'}</span></p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleToggleRule(rule.id, rule.enabled)}
                      className={`p-2 rounded-lg transition-colors ${
                        rule.enabled
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/40'
                          : 'bg-red-500/20 text-red-400 hover:bg-red-500/40'
                      }`}
                      title={rule.enabled ? 'Disable' : 'Enable'}
                    >
                      <Power size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
