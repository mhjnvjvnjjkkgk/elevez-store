# Admin User Management System - Implementation Plan

## Overview
Create an admin panel that allows admins to:
1. View all users with their email/username
2. Select a user to edit
3. Manually change user points/tier
4. See changes sync to Firebase
5. See changes automatically update on the user's website in real-time

## Architecture

### Data Flow
```
Admin Panel
    ↓
Admin selects user (by email)
    ↓
Admin views user data (points, tier, orders)
    ↓
Admin edits values (points, tier)
    ↓
Admin clicks "Save"
    ↓
Update sent to Firebase
    ↓
Real-time listener on website detects change
    ↓
User's website updates automatically
    ↓
User sees new points/tier instantly
```

## Implementation Steps

### Phase 1: Admin User List Service
**File:** `services/adminUserManagementService.ts`
- Get all users from Firestore
- Search users by email
- Get user details (points, tier, orders)
- Update user data

### Phase 2: Admin Panel Component
**File:** `components/AdminUserManagementPanel.tsx`
- Display list of all users
- Search/filter users by email
- Select user to edit
- Show user details
- Edit form for points/tier
- Save button with sync

### Phase 3: Real-Time Sync Hook
**File:** `hooks/useAdminUserSync.ts`
- Listen to user data changes
- Update admin panel when data changes
- Sync changes to website in real-time

### Phase 4: Website Real-Time Listener
**Update:** `hooks/useOptimizedFirebaseSync.ts`
- Add listener for admin changes
- Detect when admin updates user data
- Automatically update user's view

### Phase 5: Admin Panel HTML
**File:** `admin-panel/user-management.html`
- Standalone admin interface
- User list with search
- Edit form
- Real-time updates

## Database Structure

### Users Collection
```
users/{userId}
  - email: string
  - displayName: string
  - points: number
  - tier: string
  - totalPointsEarned: number
  - createdAt: timestamp
  - updatedAt: timestamp
  - lastLogin: timestamp
  - adminNotes?: string
```

### Admin Logs Collection
```
adminLogs/{logId}
  - adminId: string
  - userId: string
  - userEmail: string
  - action: string (e.g., "updated_points")
  - oldValue: any
  - newValue: any
  - timestamp: timestamp
  - reason?: string
```

## Security Considerations

1. Only admins can access user management
2. All changes logged in adminLogs
3. Firestore rules enforce admin-only access
4. Audit trail for compliance

## Firestore Security Rules

```javascript
// Admin users collection - only admins can read/write
match /users/{userId} {
  allow read: if request.auth.uid == userId || isAdmin();
  allow write: if isAdmin();
}

// Admin logs - only admins can read/write
match /adminLogs/{logId} {
  allow read, write: if isAdmin();
}

// Helper function
function isAdmin() {
  return get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.isAdmin == true;
}
```

## Implementation Order

1. ✅ Create admin user management service
2. ✅ Create admin panel component
3. ✅ Create real-time sync hook
4. ✅ Update website listener
5. ✅ Create admin panel HTML
6. ✅ Add security rules
7. ✅ Test end-to-end

## Expected Behavior

### Admin Workflow
1. Admin logs in to admin panel
2. Admin sees list of all users with emails
3. Admin searches for user by email
4. Admin clicks on user to view details
5. Admin sees current points, tier, orders
6. Admin changes points value
7. Admin clicks "Save"
8. Data syncs to Firebase
9. Admin sees confirmation

### User Workflow (Real-Time)
1. User is on website viewing their points
2. Admin changes user's points in admin panel
3. Firebase updates user data
4. Real-time listener on website detects change
5. User's points display updates automatically
6. User sees new points without refreshing

## Files to Create

1. `services/adminUserManagementService.ts` - User management logic
2. `components/AdminUserManagementPanel.tsx` - React component
3. `hooks/useAdminUserSync.ts` - Real-time sync hook
4. `admin-panel/user-management.html` - Standalone admin interface
5. `ADMIN-USER-MANAGEMENT-IMPLEMENTATION.md` - Implementation guide

## Testing Plan

1. Create test users in Firebase
2. Test admin can view all users
3. Test admin can search users
4. Test admin can edit user points
5. Test changes sync to Firebase
6. Test website updates in real-time
7. Test multiple admins editing
8. Test audit logs are created

## Success Criteria

✅ Admin can view all users by email
✅ Admin can select and edit user
✅ Changes sync to Firebase
✅ Website updates in real-time
✅ Audit logs created
✅ No data loss
✅ Performance optimized
✅ Security enforced
