# Admin System - Quick Reference Guide

## Import Everything You Need

```typescript
// Admin User Management
import { AdminUserManagementPanel } from '../components/AdminUserManagementPanel';
import { useAdminUserSync } from '../hooks/useAdminUserSync';
import { adminUserManagementService } from '../services/adminUserManagementService';

// Real-Time Sync
import { AdminChangeNotification, PointsChangeIndicator, TierChangeIndicator } from '../components/AdminChangeNotification';
import { useRealtimeUserSync } from '../hooks/useRealtimeUserSync';

// Admin Authentication
import { ProtectedAdminRoute, AdminInfoBadge, IfHasPermission } from '../components/ProtectedAdminRoute';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { adminAuthService } from '../services/adminAuthService';
```

## Basic Setup

### 1. Protect Admin Routes
```typescript
<ProtectedAdminRoute>
  <AdminUserManagementPanel />
</ProtectedAdminRoute>
```

### 2. Add Notifications
```typescript
<AdminChangeNotification />
```

### 3. Display Admin Info
```typescript
<AdminInfoBadge />
```

## Common Tasks

### Get Admin Status
```typescript
const { isAdmin, adminUser, hasPermission } = useAdminAuth();
```

### Check Permission
```typescript
const { hasPermission } = useAdminAuth();

if (hasPermission('canManageUsers')) {
  // Show user management
}
```

### Get Real-Time User Data
```typescript
const { points, tier, hasChanged } = useRealtimeUserSync();
```

### Display Points with Animation
```typescript
<PointsChangeIndicator />
```

### Display Tier with Animation
```typescript
<TierChangeIndicator />
```

### Conditional Rendering by Permission
```typescript
<IfHasPermission permission="canManageUsers">
  <UserManagement />
</IfHasPermission>
```

### Create Admin User
```typescript
const result = await adminAuthService.createAdmin(
  userId,
  'admin@example.com',
  'Admin Name',
  'admin'
);
```

### Update Admin Role
```typescript
const result = await adminAuthService.updateAdminRole(userId, 'super_admin');
```

### Get All Users
```typescript
const { users } = useAdminUserSync();
```

### Search Users
```typescript
const { searchUsers } = useAdminUserSync();
await searchUsers('user@gmail.com');
```

### Update User Points
```typescript
const { updateUserPoints } = useAdminUserSync();
await updateUserPoints(userId, 5000, 'Bonus points');
```

### Update User Tier
```typescript
const { updateUserTier } = useAdminUserSync();
await updateUserTier(userId, 'Gold', 'Promoted');
```

## Admin Roles

### Super Admin
```typescript
await adminAuthService.createAdmin(userId, email, name, 'super_admin');
```

### Admin
```typescript
await adminAuthService.createAdmin(userId, email, name, 'admin');
```

### Moderator
```typescript
await adminAuthService.createAdmin(userId, email, name, 'moderator');
```

## Permissions

### Check Specific Permission
```typescript
const { hasPermission } = useAdminAuth();

hasPermission('canManageUsers')      // true/false
hasPermission('canManageDiscounts')  // true/false
hasPermission('canManageOrders')     // true/false
hasPermission('canViewAnalytics')    // true/false
hasPermission('canManageAdmins')     // true/false
```

## Hooks Reference

### useAdminAuth()
```typescript
const {
  isAuthenticated,
  isAdmin,
  adminUser,
  loading,
  error,
  userId,
  hasPermission,
  isSuperAdmin,
  isAdminRole,
  isModerator
} = useAdminAuth();
```

### useAdminUserSync()
```typescript
const {
  users,
  selectedUser,
  logs,
  statistics,
  loading,
  error,
  isAdmin,
  selectUser,
  searchUsers,
  updateUserPoints,
  updateUserTier,
  updateUserNotes,
  refreshData,
  getUserLogs,
  clearError
} = useAdminUserSync();
```

### useRealtimeUserSync()
```typescript
const {
  points,
  tier,
  totalPointsEarned,
  lastUpdated,
  hasChanged,
  changeType,
  userId
} = useRealtimeUserSync();
```

## Components Reference

### ProtectedAdminRoute
```typescript
<ProtectedAdminRoute requiredPermission="canManageUsers">
  <YourComponent />
</ProtectedAdminRoute>
```

### AdminUserManagementPanel
```typescript
<AdminUserManagementPanel />
```

### AdminChangeNotification
```typescript
<AdminChangeNotification />
```

### AdminInfoBadge
```typescript
<AdminInfoBadge />
```

### PointsChangeIndicator
```typescript
<PointsChangeIndicator showAnimation={true} />
```

### TierChangeIndicator
```typescript
<TierChangeIndicator showAnimation={true} />
```

### IfHasPermission
```typescript
<IfHasPermission permission="canManageUsers">
  <UserManagement />
</IfHasPermission>
```

## Complete Example

```typescript
import { ProtectedAdminRoute, AdminInfoBadge } from '../components/ProtectedAdminRoute';
import { AdminUserManagementPanel } from '../components/AdminUserManagementPanel';
import { AdminChangeNotification } from '../components/AdminChangeNotification';
import { useAdminAuth } from '../hooks/useAdminAuth';

function AdminDashboard() {
  const { isAdmin, adminUser } = useAdminAuth();

  if (!isAdmin) {
    return <div>Not authorized</div>;
  }

  return (
    <ProtectedAdminRoute>
      <div>
        <AdminInfoBadge />
        <AdminChangeNotification />
        <AdminUserManagementPanel />
      </div>
    </ProtectedAdminRoute>
  );
}
```

## Data Flow

```
Admin Panel
    ↓
Admin selects user by email
    ↓
Admin edits user data
    ↓
Admin clicks save
    ↓
Firebase updates
    ↓
Real-time listener detects change
    ↓
Website updates automatically
    ↓
User sees changes instantly
```

## Files Location

- Services: `services/`
- Hooks: `hooks/`
- Components: `components/`
- Documentation: Root directory

## Status

✅ Phase 1: Admin User Management
✅ Phase 2: Real-Time Sync
✅ Phase 3: Admin Authentication
→ Phase 4: Standalone Admin Panel
→ Phase 5: Advanced Features

## Next Steps

1. Import components into your app
2. Wrap admin routes with `ProtectedAdminRoute`
3. Add `AdminChangeNotification` to app
4. Use hooks in components
5. Test with sample users
6. Deploy to production

That's it! Your admin system is ready to use.
