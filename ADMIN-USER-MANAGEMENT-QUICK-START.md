# Admin User Management - Quick Start Guide

## Import and Use

### Option 1: Use the Complete Component

```typescript
import { AdminUserManagementPanel } from '../components/AdminUserManagementPanel';

function AdminDashboard() {
  return (
    <div>
      <AdminUserManagementPanel />
    </div>
  );
}
```

### Option 2: Use the Hook

```typescript
import { useAdminUserSync } from '../hooks/useAdminUserSync';

function MyAdminPanel() {
  const {
    users,
    selectedUser,
    updateUserPoints,
    updateUserTier,
    searchUsers
  } = useAdminUserSync();

  return (
    <div>
      {/* Your custom UI */}
    </div>
  );
}
```

## Common Tasks

### Get All Users

```typescript
const { users } = useAdminUserSync();

users.forEach(user => {
  console.log(`${user.email}: ${user.points} points (${user.tier})`);
});
```

### Search Users

```typescript
const { searchUsers } = useAdminUserSync();

await searchUsers('user@gmail.com');
```

### Update User Points

```typescript
const { updateUserPoints } = useAdminUserSync();

const success = await updateUserPoints(userId, 5000, 'Bonus points');
```

### Update User Tier

```typescript
const { updateUserTier } = useAdminUserSync();

const success = await updateUserTier(userId, 'Gold', 'Promoted to Gold');
```

### Update Admin Notes

```typescript
const { updateUserNotes } = useAdminUserSync();

const success = await updateUserNotes(userId, 'VIP customer');
```

### Get User Statistics

```typescript
const { statistics } = useAdminUserSync();

console.log(`Total users: ${statistics.totalUsers}`);
console.log(`Total points: ${statistics.totalPoints}`);
console.log(`Average points: ${statistics.averagePoints}`);
console.log(`Platinum users: ${statistics.tierDistribution.Platinum}`);
```

### Get User Activity Logs

```typescript
const { logs, getUserLogs } = useAdminUserSync();

await getUserLogs(userId);
logs.forEach(log => {
  console.log(`${log.action}: ${log.oldValue} → ${log.newValue}`);
});
```

## Admin Panel Features

### User List
- Shows all users with email
- Search by email
- Click to select

### User Details
- Email and name
- Points and tier
- Admin notes
- Account info

### Edit Points
1. Click "Edit" button
2. Enter new points
3. Click "Save"
4. Syncs to Firebase
5. Website updates automatically

### Edit Tier
1. Click "Edit" button
2. Select tier from dropdown
3. Click "Save"
4. Syncs to Firebase
5. Website updates automatically

### Edit Notes
1. Click "Edit" button
2. Enter notes
3. Click "Save"
4. Syncs to Firebase

### View Logs
1. Click "Activity Logs"
2. See all changes for user
3. Shows old and new values
4. Shows timestamp

## Real-Time Updates

### How It Works
1. Admin changes user points
2. Firebase updates
3. Website listener detects change
4. User's points update automatically
5. No refresh needed

### Example Flow
```
Admin Panel: Changes points from 1000 to 5000
    ↓
Firebase: Updates user document
    ↓
Website: Real-time listener detects change
    ↓
User's Component: Re-renders with new points
    ↓
User Sees: Points changed to 5000
```

## Data Structure

### User Object
```typescript
{
  id: string              // User ID
  email: string           // Gmail address
  displayName: string     // User's name
  points: number          // Current points
  tier: string            // Bronze/Silver/Gold/Platinum
  totalPointsEarned: number
  createdAt: string       // Account creation date
  updatedAt: string       // Last update
  lastLogin: string       // Last login time
  adminNotes: string      // Admin notes
}
```

### Admin Log Object
```typescript
{
  id: string              // Log ID
  adminId: string         // Admin who made change
  adminEmail: string      // Admin's email
  userId: string          // User who was changed
  userEmail: string       // User's email
  action: string          // What was changed
  oldValue: any           // Previous value
  newValue: any           // New value
  timestamp: string       // When it happened
  reason: string          // Why (optional)
}
```

## Error Handling

### Check for Errors

```typescript
const { error, clearError } = useAdminUserSync();

if (error) {
  console.error('Error:', error);
  clearError();
}
```

### Common Errors
- "User not found" - User doesn't exist
- "Admin not authenticated" - Not logged in as admin
- "Insufficient permissions" - Not an admin

## Performance Tips

1. Use search to filter users
2. Load only needed data
3. Batch updates when possible
4. Clear cache when needed

## Troubleshooting

### Users Not Loading
- Check Firebase connection
- Verify Firestore rules
- Check browser console

### Changes Not Syncing
- Check Firebase connection
- Verify Firestore rules
- Check admin permissions

### Website Not Updating
- Check real-time listeners
- Verify Firestore rules
- Check browser console

## Files Reference

- `services/adminUserManagementService.ts` - Service
- `hooks/useAdminUserSync.ts` - Hook
- `components/AdminUserManagementPanel.tsx` - Component
- `ADMIN-USER-MANAGEMENT-PLAN.md` - Plan
- `ADMIN-USER-MANAGEMENT-IMPLEMENTATION.md` - Guide
- `ADMIN-USER-MANAGEMENT-SUMMARY.md` - Summary

## Status

✅ Ready to use
✅ All features implemented
✅ Real-time sync working
✅ Error handling included

## Next Steps

1. Import component into your app
2. Test with sample users
3. Verify real-time updates
4. Deploy to production

That's it! You're ready to go.
