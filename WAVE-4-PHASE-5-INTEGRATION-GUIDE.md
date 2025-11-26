# WAVE 4 - PHASE 5: Integration Guide

**Date**: November 24, 2025
**Purpose**: Guide for integrating Hour 1 components into existing admin system

---

## 🔗 INTEGRATION STEPS

### Step 1: Update AdminDashboard.tsx

**Location**: `components/AdminDashboard.tsx`

**Add Import**:
```typescript
import { AdminContextProvider } from './AdminContext';
import { AdvancedFilterPanel } from './AdvancedFilterPanel';
```

**Wrap Component**:
```typescript
export const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminId, onLogout }) => {
  return (
    <AdminContextProvider adminId={adminId}>
      {/* Existing dashboard content */}
    </AdminContextProvider>
  );
};
```

**Add Filter Panel State**:
```typescript
const [isFilterOpen, setIsFilterOpen] = useState(false);
const [activeFilter, setActiveFilter] = useState<FilterConfig | null>(null);
```

**Add Filter Panel Component**:
```typescript
<AdvancedFilterPanel
  isOpen={isFilterOpen}
  onClose={() => setIsFilterOpen(false)}
  dataType={activeTab as 'discounts' | 'users' | 'points'}
  onFiltersApply={(filter) => {
    setActiveFilter(filter);
    // Apply filter to current tab data
  }}
  onFiltersClear={() => {
    setActiveFilter(null);
    // Clear filters
  }}
/>
```

---

### Step 2: Update AdminDiscountPanel.tsx

**Location**: `components/AdminDiscountPanel.tsx`

**Add Imports**:
```typescript
import { useAdminContext, useDiscounts } from '../hooks/useAdminContext';
import { useEventBus, useOnDiscountCreated, useOnDiscountUpdated, useOnDiscountDeleted } from '../hooks/useEventBus';
import { getFilterService } from '../services/filterService';
```

**Replace State Management**:
```typescript
// Old way (if using local state)
// const [discounts, setDiscounts] = useState<DiscountCode[]>([]);

// New way (using context)
const { discounts, createDiscount, updateDiscount, deleteDiscount } = useDiscounts();
const { subscribe } = useEventBus();

// Listen to events
useOnDiscountCreated((event) => {
  console.log('Discount created:', event.payload);
});

useOnDiscountUpdated((event) => {
  console.log('Discount updated:', event.payload);
});

useOnDiscountDeleted((event) => {
  console.log('Discount deleted:', event.payload);
});
```

**Update Create Handler**:
```typescript
const handleCreateDiscount = async (formData: DiscountCode) => {
  try {
    await createDiscount(formData);
    // Success feedback
  } catch (error) {
    // Error handling
  }
};
```

**Update Delete Handler**:
```typescript
const handleDeleteDiscount = async (id: string) => {
  try {
    await deleteDiscount(id);
    // Success feedback
  } catch (error) {
    // Error handling
  }
};
```

---

### Step 3: Update AdminPointsPanel.tsx

**Location**: `components/AdminPointsPanel.tsx`

**Add Imports**:
```typescript
import { useAdminContext, usePoints } from '../hooks/useAdminContext';
import { useEventBus, useOnPointsAdded, useOnPointsRemoved } from '../hooks/useEventBus';
```

**Replace State Management**:
```typescript
const { points, addPoints, removePoints, getPointsHistory } = usePoints();

// Listen to events
useOnPointsAdded((event) => {
  console.log('Points added:', event.payload);
});

useOnPointsRemoved((event) => {
  console.log('Points removed:', event.payload);
});
```

**Update Add Points Handler**:
```typescript
const handleAddPoints = async (userId: string, amount: number, reason: string) => {
  try {
    await addPoints(userId, amount, reason);
    // Success feedback
  } catch (error) {
    // Error handling
  }
};
```

**Update Remove Points Handler**:
```typescript
const handleRemovePoints = async (userId: string, amount: number, reason: string) => {
  try {
    await removePoints(userId, amount, reason);
    // Success feedback
  } catch (error) {
    // Error handling
  }
};
```

---

### Step 4: Update AdminUserManagement.tsx

**Location**: `components/AdminUserManagement.tsx`

**Add Imports**:
```typescript
import { useAdminContext, useUsers } from '../hooks/useAdminContext';
import { useEventBus, useOnUserUpdated, useOnUserTierChanged } from '../hooks/useEventBus';
```

**Replace State Management**:
```typescript
const { users, updateUser } = useUsers();

// Listen to events
useOnUserUpdated((event) => {
  console.log('User updated:', event.payload);
});

useOnUserTierChanged((event) => {
  console.log('User tier changed:', event.payload);
});
```

**Update User Handler**:
```typescript
const handleUpdateUser = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    await updateUser(userId, updates);
    // Success feedback
  } catch (error) {
    // Error handling
  }
};
```

---

### Step 5: Update AdminAnalyticsDashboard.tsx

**Location**: `components/AdminAnalyticsDashboard.tsx`

**Add Imports**:
```typescript
import { useAdminContext, useAdminSync } from '../hooks/useAdminContext';
import { useEventBus, useOnSyncCompleted } from '../hooks/useEventBus';
```

**Add Sync Listener**:
```typescript
const { isSyncing, lastSync, sync } = useAdminSync();

useOnSyncCompleted((event) => {
  console.log('Sync completed:', event.payload);
  // Refresh analytics
});
```

**Add Manual Sync Button**:
```typescript
<button
  onClick={sync}
  disabled={isSyncing}
  className="flex items-center gap-2 bg-[#00ff88] text-black px-4 py-2 rounded-lg font-bold hover:bg-white transition-colors disabled:opacity-50"
>
  {isSyncing ? 'Syncing...' : 'Sync Now'}
</button>
```

---

## 🎯 USAGE EXAMPLES

### Example 1: Using Admin Context in a Component

```typescript
import { useAdminContext } from '../hooks/useAdminContext';

export const MyAdminComponent = () => {
  const { discounts, createDiscount, state } = useAdminContext();

  const handleCreate = async () => {
    try {
      await createDiscount({
        id: 'new-code',
        code: 'SAVE20',
        percentage: 20,
        type: 'percentage',
        // ... other fields
      });
    } catch (error) {
      console.error('Failed to create discount:', error);
    }
  };

  return (
    <div>
      <h2>Discounts: {discounts.length}</h2>
      <button onClick={handleCreate}>Create Discount</button>
      {state.loading && <p>Loading...</p>}
      {state.error && <p>Error: {state.error}</p>}
    </div>
  );
};
```

### Example 2: Using Event Bus

```typescript
import { useEventBus } from '../hooks/useEventBus';

export const MyEventComponent = () => {
  const { subscribe, publish } = useEventBus();

  useEffect(() => {
    const unsubscribe = subscribe('discount:created', (event) => {
      console.log('New discount created:', event.payload);
      // Update UI
    });

    return unsubscribe;
  }, [subscribe]);

  const handleAction = () => {
    publish('custom:action', { data: 'value' }, 'my-component');
  };

  return <button onClick={handleAction}>Trigger Action</button>;
};
```

### Example 3: Using Filters

```typescript
import { getFilterService } from '../services/filterService';

export const MyFilterComponent = () => {
  const filterService = getFilterService();
  const [filteredData, setFilteredData] = useState([]);

  const handleApplyFilter = (filter) => {
    const filtered = filterService.applyFilters(data, filter);
    setFilteredData(filtered);
  };

  return (
    <div>
      <AdvancedFilterPanel
        isOpen={true}
        onFiltersApply={handleApplyFilter}
        dataType="discounts"
      />
      <p>Filtered results: {filteredData.length}</p>
    </div>
  );
};
```

---

## 🔄 DATA FLOW EXAMPLES

### Creating a Discount

```
User clicks "Create Discount"
    ↓
Form submitted
    ↓
createDiscount() called
    ↓
AdminContextService.createDiscount()
    ↓
Firebase addDoc()
    ↓
Real-time listener triggered
    ↓
State updated
    ↓
Event published: 'discount:created'
    ↓
All subscribers notified
    ↓
UI components re-render
    ↓
Success message shown
```

### Filtering Discounts

```
User opens filter panel
    ↓
Adds filter rules
    ↓
Clicks "Apply Filters"
    ↓
onFiltersApply() called
    ↓
FilterService.applyFilters()
    ↓
Data filtered
    ↓
Event published: 'filter:applied'
    ↓
UI updated with filtered results
```

### Real-Time Sync

```
Admin A creates discount
    ↓
Firebase updated
    ↓
Real-time listener triggered on Admin B's dashboard
    ↓
State updated
    ↓
Event published
    ↓
Admin B's UI updated automatically
```

---

## 🧪 TESTING INTEGRATION

### Test 1: Context Initialization

```typescript
test('AdminContext initializes correctly', () => {
  const { getByText } = render(
    <AdminContextProvider adminId="test-admin">
      <TestComponent />
    </AdminContextProvider>
  );
  
  expect(getByText('Discounts: 0')).toBeInTheDocument();
});
```

### Test 2: Event Publishing

```typescript
test('Events are published correctly', () => {
  const handler = jest.fn();
  const { eventBus } = useEventBus();
  
  eventBus.subscribe('discount:created', handler);
  eventBus.publish('discount:created', { id: '1' });
  
  expect(handler).toHaveBeenCalled();
});
```

### Test 3: Filter Application

```typescript
test('Filters are applied correctly', () => {
  const filterService = getFilterService();
  const data = [
    { code: 'SAVE20', type: 'percentage' },
    { code: 'FIXED10', type: 'fixed' },
  ];
  
  const filter = filterService.createFilter('test');
  const rule = filterService.createRule('type', 'equals', 'percentage');
  const filterWithRule = filterService.addRule(filter, rule);
  
  const result = filterService.applyFilters(data, filterWithRule);
  
  expect(result).toHaveLength(1);
  expect(result[0].code).toBe('SAVE20');
});
```

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] All imports added
- [ ] AdminContextProvider wraps dashboard
- [ ] All panels updated with hooks
- [ ] Event listeners added
- [ ] Filter panel integrated
- [ ] Tests passing
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Documentation updated

---

## 📝 COMMON ISSUES & SOLUTIONS

### Issue 1: "useAdminContext must be used within AdminContextProvider"

**Solution**: Ensure AdminContextProvider wraps the component tree:
```typescript
<AdminContextProvider adminId={adminId}>
  <AdminDashboard />
</AdminContextProvider>
```

### Issue 2: Events not being received

**Solution**: Ensure subscription happens before event is published:
```typescript
useEffect(() => {
  const unsubscribe = subscribe('discount:created', handler);
  return unsubscribe; // Cleanup
}, [subscribe]);
```

### Issue 3: Filters not applying

**Solution**: Ensure filter config has rules:
```typescript
if (filter.rules.length === 0) {
  console.warn('No filter rules defined');
  return;
}
```

### Issue 4: Memory leaks

**Solution**: Always cleanup subscriptions:
```typescript
useEffect(() => {
  const unsubscribe = subscribe('event', handler);
  return () => unsubscribe(); // Cleanup on unmount
}, [subscribe]);
```

---

## 📚 REFERENCE LINKS

- AdminContextService: `services/adminContextService.ts`
- EventBusService: `services/eventBusService.ts`
- FilterService: `services/filterService.ts`
- AdminContext: `components/AdminContext.tsx`
- AdvancedFilterPanel: `components/AdvancedFilterPanel.tsx`
- useAdminContext: `hooks/useAdminContext.ts`
- useEventBus: `hooks/useEventBus.ts`

---

## 🎯 NEXT STEPS

1. ✅ Review this integration guide
2. ⏳ Update AdminDashboard.tsx
3. ⏳ Update AdminDiscountPanel.tsx
4. ⏳ Update AdminPointsPanel.tsx
5. ⏳ Update AdminUserManagement.tsx
6. ⏳ Update AdminAnalyticsDashboard.tsx
7. ⏳ Test all integrations
8. ⏳ Move to Hour 2

---

**Status**: 🎯 READY FOR INTEGRATION
**Estimated Time**: 30 minutes
**Target Completion**: Before Hour 2

---

**Prepared by**: Lead Engineer
**Date**: November 24, 2025
**Version**: 1.0 - Integration Guide

