// Protected Admin Route Component
// Restricts access to admin panel to authorized admins only

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, AlertCircle, Loader } from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';

export interface ProtectedAdminRouteProps {
  children: React.ReactNode;
  requiredPermission?: keyof import('../services/adminAuthService').AdminUser['permissions'];
  fallback?: React.ReactNode;
}

/**
 * Protected route component for admin pages
 */
export const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({
  children,
  requiredPermission,
  fallback,
}) => {
  const { isAdmin, loading, adminUser, hasPermission } = useAdminAuth();

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-[#00ff88]"
        >
          <Loader size={40} />
        </motion.div>
      </div>
    );
  }

  // Not authenticated
  if (!isAdmin) {
    return (
      fallback || (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center min-h-screen bg-black p-4"
        >
          <div className="bg-zinc-900 border border-red-500 rounded-lg p-8 max-w-md text-center space-y-4">
            <div className="flex justify-center">
              <Lock size={48} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-gray-400">
              You don't have permission to access the admin panel. Only authorized administrators can access this area.
            </p>
            <p className="text-sm text-gray-500">
              If you believe this is an error, please contact your system administrator.
            </p>
          </div>
        </motion.div>
      )
    );
  }

  // Check specific permission if required
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      fallback || (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center min-h-screen bg-black p-4"
        >
          <div className="bg-zinc-900 border border-yellow-500 rounded-lg p-8 max-w-md text-center space-y-4">
            <div className="flex justify-center">
              <AlertCircle size={48} className="text-yellow-500" />
            </div>
            <h1 className="text-2xl font-bold">Insufficient Permissions</h1>
            <p className="text-gray-400">
              Your admin role doesn't have permission to access this feature.
            </p>
            <p className="text-sm text-gray-500">
              Required permission: {requiredPermission}
            </p>
          </div>
        </motion.div>
      )
    );
  }

  // Authorized - render children
  return <>{children}</>;
};

/**
 * Admin info badge component
 */
export const AdminInfoBadge: React.FC = () => {
  const { adminUser } = useAdminAuth();

  if (!adminUser) return null;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-500/20 border-red-500 text-red-500';
      case 'admin':
        return 'bg-[#00ff88]/20 border-[#00ff88] text-[#00ff88]';
      case 'moderator':
        return 'bg-blue-500/20 border-blue-500 text-blue-500';
      default:
        return 'bg-gray-500/20 border-gray-500 text-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`border rounded-lg px-3 py-2 text-sm font-bold ${getRoleColor(adminUser.role)}`}
    >
      {adminUser.role.replace('_', ' ').toUpperCase()}
    </motion.div>
  );
};

/**
 * Admin access indicator component
 */
export const AdminAccessIndicator: React.FC = () => {
  const { isAdmin, adminUser } = useAdminAuth();

  if (!isAdmin || !adminUser) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-4 right-4 bg-zinc-900 border border-[#00ff88] rounded-lg p-3 text-sm"
    >
      <p className="text-gray-400">Admin: <span className="text-[#00ff88] font-bold">{adminUser.email}</span></p>
      <p className="text-gray-500 text-xs mt-1">Role: {adminUser.role.replace('_', ' ')}</p>
    </motion.div>
  );
};

/**
 * Permission-based component visibility
 */
export const IfHasPermission: React.FC<{
  permission: keyof import('../services/adminAuthService').AdminUser['permissions'];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ permission, children, fallback }) => {
  const { adminUser } = useAdminAuth();

  if (!adminUser || !adminUser.permissions[permission]) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

/**
 * Role-based component visibility
 */
export const IfAdminRole: React.FC<{
  role: 'super_admin' | 'admin' | 'moderator';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ role, children, fallback }) => {
  const { adminUser } = useAdminAuth();

  if (!adminUser || adminUser.role !== role) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};
