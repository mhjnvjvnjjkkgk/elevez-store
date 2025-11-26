# Admin Authentication - Phase 3 Implementation Guide

## Overview

Phase 3 implements admin authentication and authorization. Only authorized admins can access the admin panel, and permissions are role-based.

## What Was Created

### 1. Admin Auth Service (300+ lines)
**File:** `services/adminAuthService.ts`

**Features:**
- Check if user is admin
- Get admin user data
- Check specific permissions
- Create admin users
- Update admin roles
- Remove admin access
- Get all admins
- Get admins by role
- Role-based permissions

### 2. Admin Auth Hook (200+ lines)
**File:** `hooks/useAdminAuth.ts`

**Hooks Provided:**
- `useAdminAuth()` - Main authentication hook
- `useAdminPermission()` - Check specific permission
- `useAdminRole()` - Get admin role
- `useRequireAdmin()` - Require admin access
- `useRequirePermission()` - Require specific permission

### 3. Protected Admin Route Component (300+ lines)
**File:** `components/ProtectedAdminRoute.tsx`

**Components Provided:**
- `ProtectedAdminRoute` - Route protection wrapper
- `AdminInfoBadge` - Display admin role badge
- `AdminAccessIndicator` - Show admin access info
- `IfHasPermission` - Conditional rendering by permission
- `IfAdminRole` - Conditional rendering by role

## Admin Roles and Permissions

### Super Admin
- Can manage users
- Can manage discounts
- Can manage orders
- Can view analytics
- Can manage admins

### Admin
- Can manage users
- Can manage discounts
- Can manage orders
- Can view analytics
- Cannot manage admins

### Moderator
- Can manage users
- Cannot manage discounts
- Cannot manage orders
- Cannot view analytics
- Cannot manage admins

## How It Works

### Authentication Flow

```
User logs in
    ↓
Check if user is authenticated
    ↓
Check if user is admin
    ↓
Get admin user data
    ↓
Check admin role and permissions
    ↓
Grant or deny access
```

### Authorization Flow

```
Admin tries to access feature
    ↓
Check if admin
    ↓
Check if has required permission
    ↓
Grant or deny access
```

## Integration Steps

### Step 1: Protect Admin Routes

```typescript
import { ProtectedAdminRoute } from '../components/ProtectedAdminRoute';
import { AdminUserManagementPanel } from '../components/AdminUserManagementPanel';

function AdminDashboard() {
  return (
    <ProtectedAdminRoute>
      <AdminUserManagementPanel />
    </ProtectedAdminRoute>
  );
}
```

### Step 2: Check Permissions in Components

```typescript
import { useAdminAuth } from '../hooks/useAdminAuth';

function AdminPanel() {
  const { isAdmin, hasPermission } = useAdminAuth();

  if (!isAdmin) {
    return <div>Not authorized</div>;
  }

  return (
    <div>
      {hasPermission('canManageUsers') && <UserManagement />}
      {hasPermission('canManageDiscounts') && <DiscountManagement />}
    </div>
  );
}
```

### Step 3: Use Conditional Components

```typescript
import { IfHasPermission, IfAdminRole } from '../components/ProtectedAdminRoute';

function Dashboard() {
  return (
    <div>
      <IfHasPermission permission="canManageUsers">
        <UserManagement />
      </IfHasPermission>

      <IfAdminRole role="super_admin">
        <AdminManagement />
      </IfAdminRole>
    </div>
  );
}
```

### Step 4: Display Admin Info

```typescript
import { AdminInfoBadge, AdminAccessIndicator } from '../components/ProtectedAdminRoute';

function App() {
  return (
    <div>
      <AdminInfoBadge />
      <AdminAccessIndicator />
      {/* Rest of app */}
    </div>
  );
}
```

## Hook Usage

### useAdminAuth()

Main authentication hook.

```typescript
const {
  isAuthenticated,    // Is user logged in
  isAdmin,            // Is user admin
  adminUser,          // Admin user data
  loading,            // Loading state
  error,              // Error message
  userId,             // Current user ID
  hasPermission,      // Check permission function
  isSuperAdmin,       // Check if super admin
  isAdminRole,        // Check if admin
  isModerator         // Check if moderator
} = useAdminAuth();
```

### useAdminPermission()

Check specific permission.

```typescript
const { hasPermission, loading } = useAdminPermission('canManageUsers');

if (hasPermission) {
  // Show user management
}
```

### useAdminRole()

Get admin role.

```typescript
const { role, loading } = useAdminRole();

if (role === 'super_admin') {
  // Show super admin features
}
```

### useRequireAdmin()

Require admin access.

```typescript
const { authorized, loading, userId } = useRequireAdmin();

if (!authorized) {
  return <div>Not authorized</div>;
}
```

### useRequirePermission()

Require specific permission.

```typescript
const { authorized, loading } = useRequirePermission('canManageUsers');

if (!authorized) {
  return <div>Permission denied</div>;
}
```

## Component Usage

### ProtectedAdminRoute

Protect entire routes.

```typescript
<ProtectedAdminRoute requiredPermission="canManageUsers">
  <UserManagement />
</ProtectedAdminRoute>
```

### AdminInfoBadge

Display admin role.

```typescript
<AdminInfoBadge />
// Shows: SUPER ADMIN, ADMIN, or MODERATOR
```

### AdminAccessIndicator

Show admin access info.

```typescript
<AdminAccessIndicator />
// Shows admin email and role in bottom right
```

### IfHasPermission

Conditional rendering by permission.

```typescript
<IfHasPermission permission="canManageUsers">
  <UserManagement />
</IfHasPermission>
```

### IfAdminRole

Conditional rendering by role.

```typescript
<IfAdminRole role="super_admin">
  <AdminManagement />
</IfAdminRole>
```

## Creating Admins

### Create Super Admin

```typescript
import { adminAuthService } from '../services/adminAuthService';

const result = await adminAuthService.createAdmin(
  userId,
  'admin@example.com',
  'Admin Name',
  'super_admin'
);
```

### Create Admin

```typescript
const result = await adminAuthService.createAdmin(
  userId,
  'admin@example.com',
  'Admin Name',
  'admin'
);
```

### Create Moderator

```typescript
const result = await adminAuthService.createAdmin(
  userId,
  'moderator@example.com',
  'Moderator Name',
  'moderator'
);
```

## Firestore Security Rules

```javascript
// Admin collection - only admins can read/write
match /admins/{userId} {
  allow read: if request.auth.uid == userId || isAdmin();
  allow write: if isSuperAdmin();
}

// Helper functions
function isAdmin() {
  return get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.isAdmin == true;
}

function isSuperAdmin() {
  return get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'super_admin';
}
```

## Permission Levels

### canManageUsers
- View all users
- Edit user points
- Edit user tier
- Edit user notes
- View user history

### canManageDiscounts
- Create discounts
- Edit discounts
- Delete discounts
- View discount usage

### canManageOrders
- View all orders
- Update order status
- View order details
- Export orders

### canViewAnalytics
- View user statistics
- View sales analytics
- View points analytics
- View discount analytics

### canManageAdmins
- Create admins
- Update admin roles
- Remove admin access
- View admin logs

## Testing

### Test Checklist
- [ ] Non-admin cannot access admin panel
- [ ] Admin can access admin panel
- [ ] Super admin can manage admins
- [ ] Admin cannot manage admins
- [ ] Moderator can only manage users
- [ ] Permissions are enforced
- [ ] Admin info displays correctly
- [ ] Role badges show correctly

### Manual Testing

1. Create test admin user
2. Log in as admin
3. Verify access to admin panel
4. Check permissions work
5. Try accessing restricted features
6. Verify access denied

## Files Created

1. ✅ `services/adminAuthService.ts` - Admin auth service
2. ✅ `hooks/useAdminAuth.ts` - Admin auth hooks
3. ✅ `components/ProtectedAdminRoute.tsx` - Protected route component
4. ✅ `ADMIN-AUTHENTICATION-IMPLEMENTATION.md` - This guide

## Code Quality

✅ No TypeScript errors
✅ No linting errors
✅ Type-safe implementation
✅ Comprehensive error handling
✅ Well-commented code
✅ Best practices followed

## Status

**✅ PHASE 3 COMPLETE**

Admin authentication implemented:
- ✅ Admin auth service
- ✅ Admin auth hooks
- ✅ Protected routes
- ✅ Role-based permissions
- ✅ Permission checking
- ✅ Admin info display

**Ready for:** Integration into your app

## Next: Phase 4 - Standalone Admin Panel

Create a standalone HTML admin interface that doesn't require React.
