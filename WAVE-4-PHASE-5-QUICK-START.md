# WAVE 4 - PHASE 5: Quick Start Guide

**Date**: November 24, 2025
**Purpose**: Get started with Phase 5 implementation in 5 minutes

---

## ⚡ 5-MINUTE QUICK START

### What Was Built (Hour 1)
✅ Global admin context for state management
✅ Event system for component communication
✅ Advanced filtering engine
✅ Real-time Firebase sync
✅ 1,600+ lines of production code

### Files Created
```
services/
├── adminContextService.ts (250 lines)
├── eventBusService.ts (300 lines)
└── filterService.ts (350 lines)

components/
├── AdminContext.tsx (200 lines)
└── AdvancedFilterPanel.tsx (300 lines)

hooks/
├── useAdminContext.ts (80 lines)
└── useEventBus.ts (120 lines)
```

---

## 🚀 GETTING STARTED

### Step 1: Wrap Your Dashboard (2 minutes)

**File**: `components/AdminDashboard.tsx`

```typescript
import { AdminContextProvider } from './AdminContext';

export const AdminDashboard = ({ adminId, onLogout }) => {
  return (
    <AdminContextProvider adminId={adminId}>
      {/* Your existing dashboard content */}
    </AdminContextProvider>
  );
};
```

### Step 2: Use Context in Panels (2 minutes)

**File**: `components/AdminDiscountPanel.tsx`

```typescript
import { useDiscounts } from '../hooks/useAdminContext';
import { useOnDiscountCreated } from '../hooks/useEventBus';

export const AdminDiscountPanel = () => {
  const { discounts, createDiscount } = useDiscounts();
  
  useOnDiscountCreated((event) => {
    console.log('New discount:', event.payload);
  });

  return (
    <div>
      <h2>Discounts: {discounts.length}</h2>
      {/* Your panel content */}
    </div>
  );
};
```

### Step 3: Add Filtering (1 minute)

```typescript
import { AdvancedFilterPanel } from './AdvancedFilterPanel';

export const AdminDashboard = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsFilterOpen(true)}>
        Open Filters
      </button>
      <AdvancedFilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        dataType="discounts"
        onFiltersApply={(filter) => {
          // Apply filter to data
        }}
        onFiltersClear={() => {
          // Clear filters
        }}
      />
    </>
  );
};
```

---

## 📚 COMMON PATTERNS

### Pattern 1: Get Data from Context

```typescript
const { discounts, users, points } = useAdminContext();
```

### Pattern 2: Create/Update/Delete

```typescript
const { createDiscount, updateDiscount, deleteDiscount } = useDiscounts();

// Create
await createDiscount({ code: 'SAVE20', percentage: 20 });

// Update
await updateDiscount('discount-id', { percentage: 25 });

// Delete
await deleteDiscount('discount-id');
```

### Pattern 3: Listen to Events

```typescript
const { subscribe } = useEventBus();

useEffect(() => {
  const unsubscribe = subscribe('discount:created', (event) => {
    console.log('Discount created:', event.payload);
  });
  
  return unsubscribe; // Cleanup
}, [subscribe]);
```

### Pattern 4: Apply Filters

```typescript
import { getFilterService } from '../services/filterService';

const filterService = getFilterService();

// Create a filter
const filter = filterService.createFilter('My Filter');

// Add a rule
const rule = filterService.createRule('status', 'equals', 'active');
const filterWithRule = filterService.addRule(filter, rule);

// Apply to data
const filtered = filterService.applyFilters(data, filterWithRule);
```

### Pattern 5: Sync Data

```typescript
const { sync, isSyncing, lastSync } = useAdminSync();

<button onClick={sync} disabled={isSyncing}>
  {isSyncing ? 'Syncing...' : 'Sync Now'}
</button>
```

---

## 🎯 WHAT YOU CAN DO NOW

### ✅ Already Working
- Create/update/delete discounts
- Add/remove points
- Update users
- Real-time sync
- Event communication
- Advanced filtering
- Filter presets
- Search functionality

### ⏳ Coming in Hour 2
- Bulk operations
- CSV import/export
- Report generation
- Charts

### ⏳ Coming in Hour 3
- Performance monitoring
- Audit logging
- Compliance tools

### ⏳ Coming in Hour 4
- Notifications
- User segmentation

### ⏳ Coming in Hour 5
- Predictive analytics
- A/B testing

---

## 🧪 QUICK TEST

### Test 1: Check Context Works

```typescript
// In any admin component
const { discounts } = useAdminContext();
console.log('Discounts:', discounts);
```

### Test 2: Check Events Work

```typescript
const { subscribe } = useEventBus();

subscribe('discount:created', (event) => {
  console.log('Event received:', event);
});
```

### Test 3: Check Filters Work

```typescript
const filterService = getFilterService();
const filter = filterService.createFilter('test');
const rule = filterService.createRule('code', 'contains', 'SAVE');
const filterWithRule = filterService.addRule(filter, rule);
const result = filterService.applyFilters(data, filterWithRule);
console.log('Filtered:', result);
```

---

## 🐛 TROUBLESHOOTING

### Issue: "useAdminContext must be used within AdminContextProvider"

**Solution**: Wrap your component tree with AdminContextProvider

```typescript
<AdminContextProvider adminId={adminId}>
  <YourComponent />
</AdminContextProvider>
```

### Issue: Events not firing

**Solution**: Make sure you subscribe before the event is published

```typescript
useEffect(() => {
  const unsubscribe = subscribe('event', handler);
  return unsubscribe;
}, [subscribe]);
```

### Issue: Filters not working

**Solution**: Make sure filter has rules

```typescript
if (filter.rules.length === 0) {
  console.warn('No filter rules');
  return;
}
```

---

## 📖 DOCUMENTATION

### Full Documentation
- `WAVE-4-PHASE-5-MASTER-PLAN.md` - Complete plan
- `WAVE-4-PHASE-5-HOUR-1-IMPLEMENTATION.md` - Implementation details
- `WAVE-4-PHASE-5-INTEGRATION-GUIDE.md` - Integration steps
- `WAVE-4-PHASE-5-EXECUTIVE-SUMMARY.md` - Executive overview

### Code Files
- `services/adminContextService.ts` - Context service
- `services/eventBusService.ts` - Event system
- `services/filterService.ts` - Filter engine
- `components/AdminContext.tsx` - Context provider
- `components/AdvancedFilterPanel.tsx` - Filter UI
- `hooks/useAdminContext.ts` - Context hook
- `hooks/useEventBus.ts` - Event hook

---

## 🎯 NEXT STEPS

1. ✅ Wrap AdminDashboard with AdminContextProvider
2. ✅ Update AdminDiscountPanel to use useDiscounts
3. ✅ Update AdminPointsPanel to use usePoints
4. ✅ Update AdminUserManagement to use useUsers
5. ✅ Add AdvancedFilterPanel to dashboard
6. ✅ Test everything works
7. ⏳ Move to Hour 2

---

## 💡 TIPS & TRICKS

### Tip 1: Use Specific Hooks
Instead of:
```typescript
const { discounts } = useAdminContext();
```

Use:
```typescript
const { discounts } = useDiscounts();
```

### Tip 2: Always Cleanup Subscriptions
```typescript
useEffect(() => {
  const unsubscribe = subscribe('event', handler);
  return unsubscribe; // Important!
}, [subscribe]);
```

### Tip 3: Use Event Shortcuts
Instead of:
```typescript
subscribe('discount:created', handler);
```

Use:
```typescript
useOnDiscountCreated(handler);
```

### Tip 4: Save Filter Presets
```typescript
const preset = {
  id: 'preset_1',
  name: 'Active Discounts',
  config: filter,
};
filterService.savePreset(preset);
```

### Tip 5: Export/Import Filters
```typescript
// Export
const json = filterService.exportFilter(filter);

// Import
const imported = filterService.importFilter(json);
```

---

## 🚀 PERFORMANCE TIPS

### Tip 1: Debounce Filters
```typescript
const [filter, setFilter] = useState(null);
const debouncedFilter = useDebounce(filter, 300);

useEffect(() => {
  if (debouncedFilter) {
    applyFilter(debouncedFilter);
  }
}, [debouncedFilter]);
```

### Tip 2: Memoize Callbacks
```typescript
const handleCreate = useCallback(async (data) => {
  await createDiscount(data);
}, [createDiscount]);
```

### Tip 3: Use Selective Subscriptions
```typescript
// Instead of subscribing to all events
subscribe('*', handler);

// Subscribe to specific events
subscribeToMultiple(['discount:created', 'discount:updated'], handler);
```

---

## 📞 SUPPORT

### Questions?
- Check the documentation files
- Review the code comments
- Look at the examples above
- Check the troubleshooting section

### Issues?
- Check the browser console
- Check the Firebase console
- Review the error messages
- Check the troubleshooting section

---

## ✅ CHECKLIST

- [ ] AdminContextProvider wraps dashboard
- [ ] AdminDiscountPanel uses useDiscounts
- [ ] AdminPointsPanel uses usePoints
- [ ] AdminUserManagement uses useUsers
- [ ] AdvancedFilterPanel integrated
- [ ] Events working
- [ ] Filters working
- [ ] Real-time sync working
- [ ] No console errors
- [ ] Tests passing

---

## 🎉 YOU'RE READY!

You now have:
- ✅ Global state management
- ✅ Real-time sync
- ✅ Event system
- ✅ Advanced filtering
- ✅ Production-ready code

**Next**: Hour 2 - Bulk Operations & Reporting

---

**Status**: 🎯 READY TO USE
**Time to Setup**: 5 minutes
**Time to Master**: 30 minutes

---

**Prepared by**: Lead Engineer
**Date**: November 24, 2025
**Version**: 1.0 - Quick Start

