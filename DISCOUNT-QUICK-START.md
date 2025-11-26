# Discount Management - Quick Start Guide

## Accessing Discount Management

### From Admin Panel
1. Open admin panel at `admin-panel/index.html`
2. Click "💰 Discounts" in the sidebar
3. You'll be taken to the discount management dashboard

### Direct Access
- Navigate to `admin-panel/discount-panel.html`

---

## Creating a Discount

### Step 1: Click "➕ New Discount"
Opens the discount creation modal

### Step 2: Fill in Details

**Required Fields:**
- **Code:** Unique discount code (e.g., SAVE10)
  - Click "Generate" for auto-generated code
- **Name:** Display name (e.g., "10% Off Everything")
- **Type:** Choose from:
  - Percentage (%) - e.g., 10% off
  - Fixed Amount (₹) - e.g., ₹20 off
  - Free Shipping - Waives shipping
  - Bundle - Percentage off for multiple items
- **Value:** Amount or percentage
- **Start Date:** When discount becomes active
- **End Date:** When discount expires
- **Usage Limit:** Max number of times code can be used

**Optional Fields:**
- **Description:** Details about the discount
- **Minimum Purchase:** Minimum order amount required
- **Active:** Toggle to enable/disable

### Step 3: Save
Click "Save Discount" to create

---

## Managing Discounts

### View All Discounts
- Click "All Discounts" tab
- See all created discounts in table format

### View Active Discounts
- Click "Active" tab
- Shows only currently active, non-expired discounts

### View Expired Discounts
- Click "Expired" tab
- Shows discounts that have passed their end date

### Edit Discount
1. Find discount in table
2. Click "Edit" button
3. Modify details
4. Click "Save Discount"

### Delete Discount
1. Find discount in table
2. Click "Delete" button
3. Confirm deletion

---

## Analytics & Statistics

### Dashboard Stats
- **Total Discounts:** Count of all discounts
- **Active Discounts:** Count of currently active discounts
- **Total Uses:** Total times any discount was applied
- **Discount Types:** Number of different discount types

### Analytics Tab
- **Discount Types Distribution:** Visual breakdown by type
- **Top Discounts by Usage:** Most-used discounts with usage percentage

---

## Discount Types Explained

### Percentage Discount
- Applies percentage off subtotal
- Example: 10% off ₹100 = ₹10 discount
- Best for: General promotions

### Fixed Amount Discount
- Applies fixed rupee amount off
- Example: ₹20 off any order
- Best for: Specific discount amounts

### Free Shipping
- Waives shipping charges
- Assumes ₹100 shipping cost
- Best for: Shipping promotions

### Bundle Discount
- Percentage off when buying multiple items
- Example: Buy 3+ items, get 15% off
- Best for: Encouraging larger purchases

---

## Import/Export

### Export Discounts
1. Click "📥 Export" button
2. Downloads `discounts.json` file
3. Contains all discount data

### Import Discounts
1. Click "📤 Import" button
2. Select previously exported `.json` file
3. Confirms number of discounts imported

---

## Using Discounts at Checkout

### Customer Flow
1. Add items to cart
2. Proceed to checkout
3. Complete shipping details
4. On payment page, enter discount code
5. Click "Apply" button
6. Discount applied to order total
7. Complete purchase

### Valid Discount Requirements
- Code must exist
- Must be active
- Must not be expired
- Usage limit not reached
- Subtotal meets minimum purchase

### Error Messages
- "Discount code not found" - Code doesn't exist
- "This discount code is inactive" - Disabled by admin
- "This discount code has expired" - Past end date
- "This discount code has reached its usage limit" - No uses left
- "Minimum purchase of ₹X required" - Order too small

---

## Best Practices

### Creating Effective Discounts

1. **Use Clear Codes**
   - SAVE10, SUMMER20, WELCOME15
   - Avoid confusing characters

2. **Set Realistic Limits**
   - Don't set usage limit too low
   - Monitor usage in analytics

3. **Plan Dates**
   - Set end dates for time-limited offers
   - Leave buffer time before expiration

4. **Minimum Purchase**
   - Prevents abuse of high-value discounts
   - Encourages larger orders

5. **Monitor Usage**
   - Check analytics regularly
   - Adjust limits if needed

### Discount Strategy

- **New Customers:** Welcome discount (e.g., WELCOME15)
- **Seasonal:** Time-limited offers (e.g., SUMMER20)
- **Loyalty:** Repeat customer codes (e.g., LOYAL10)
- **Bulk:** Bundle discounts for multiple items
- **Clearance:** High-value discounts for old stock

---

## Troubleshooting

### Discount Not Applying
**Check:**
- Is code active? (Check admin panel)
- Has it expired? (Check end date)
- Usage limit reached? (Check usage count)
- Minimum purchase met? (Check order amount)

### Can't Create Discount
**Check:**
- All required fields filled
- Code is unique (not duplicate)
- Dates are valid (start before end)
- Value is positive number

### Discount Disappeared
**Check:**
- Was it deleted? (Check deleted discounts)
- Did it expire? (Check end date)
- Was it deactivated? (Check active status)

---

## Example Discounts

### Welcome Discount
```
Code: WELCOME15
Name: Welcome to ELEVEZ
Type: Percentage
Value: 15%
Start: Today
End: 30 days from now
Usage Limit: 1000
Min Purchase: ₹0
Active: Yes
```

### Summer Sale
```
Code: SUMMER20
Name: Summer Sale - 20% Off
Type: Percentage
Value: 20%
Start: June 1
End: August 31
Usage Limit: 5000
Min Purchase: ₹500
Active: Yes
```

### Free Shipping
```
Code: FREESHIP
Name: Free Shipping on Orders
Type: Free Shipping
Value: 0
Start: Today
End: 90 days from now
Usage Limit: 10000
Min Purchase: ₹100
Active: Yes
```

### Bundle Deal
```
Code: BUNDLE15
Name: Buy 3+ Items, Get 15% Off
Type: Bundle
Value: 15%
Start: Today
End: 60 days from now
Usage Limit: 2000
Min Purchase: ₹0
Active: Yes
```

---

## Mobile Responsiveness

### Admin Panel on Mobile
- Responsive design adapts to screen size
- All features accessible on mobile
- Touch-friendly buttons and inputs
- Scrollable tables on small screens

### Checkout on Mobile
- Discount code input visible
- Easy to apply/remove discounts
- Clear error messages
- Discount amount shown in summary

---

## Performance Tips

1. **Regular Cleanup**
   - Delete expired discounts
   - Archive old discounts

2. **Monitor Usage**
   - Check analytics weekly
   - Adjust limits as needed

3. **Backup Data**
   - Export discounts regularly
   - Keep backup copies

4. **Test Before Launch**
   - Test discount codes before going live
   - Verify calculations are correct

---

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review discount data in admin panel
3. Test with sample discount code
4. Check browser console for errors

---

## Summary

✅ Easy discount creation and management
✅ Multiple discount types supported
✅ Real-time analytics and statistics
✅ Import/Export functionality
✅ Mobile-responsive interface
✅ Seamless checkout integration
✅ Comprehensive error handling

Start creating discounts now to boost sales!
