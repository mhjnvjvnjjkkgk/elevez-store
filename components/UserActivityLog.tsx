import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Filter } from 'lucide-react';
import { userActivityService, UserActivity } from '../services/userActivityService';

interface UserActivityLogProps {
  userId: string;
}

export const UserActivityLog: React.FC<UserActivityLogProps> = ({ userId }) => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    loadActivities();
  }, [userId]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const userActivities = await userActivityService.getUserActivities(userId);
      setActivities(userActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return '🔓';
      case 'purchase': return '🛍️';
      case 'points_earned': return '⭐';
      case 'points_spent': return '💸';
      case 'admin_change': return '⚙️';
      case 'profile_update': return '👤';
      default: return '📝';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'login': return 'text-blue-400';
      case 'purchase': return 'text-green-400';
      case 'points_earned': return 'text-yellow-400';
      case 'points_spent': return 'text-red-400';
      case 'admin_change': return 'text-purple-400';
      case 'profile_update': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

  const filteredActivities = selectedType === 'all' 
    ? activities 
    : activities.filter(a => a.type === selectedType);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block w-8 h-8 border-3 border-[#00ff88]/20 border-t-[#00ff88] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 border border-white/10 rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Activity History</h3>
        <div className="flex gap-2">
          {['all', 'login', 'purchase', 'points_earned', 'points_spent', 'admin_change'].map(type => (
            <motion.button
              key={type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedType === type
                  ? 'bg-[#00ff88] text-black'
                  : 'bg-black/50 text-gray-400 border border-white/10 hover:border-[#00ff88]'
              }`}
            >
              {type === 'all' ? 'All' : type.replace('_', ' ').toUpperCase()}
            </motion.button>
          ))}
        </div>
      </div>

      {filteredActivities.length === 0 ? (
        <div className="text-center py-8">
          <Calendar size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No activities found</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredActivities.map((activity, index) => (
            <motion.div
              key={activity.activityId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-4 p-4 bg-black/50 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
            >
              <span className="text-2xl">{getActivityIcon(activity.type)}</span>
              <div className="flex-1">
                <p className={`font-bold ${getActivityColor(activity.type)}`}>
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {activity.timestamp.toLocaleString()}
                </p>
                {activity.details && Object.keys(activity.details).length > 0 && (
                  <div className="text-xs text-gray-600 mt-2 space-y-1">
                    {Object.entries(activity.details).map(([key, value]) => (
                      <p key={key}>
                        <span className="text-gray-500">{key}:</span> {String(value)}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
