# Debug Session: Robust Shop Filter Mismatches

## Symptom
When clicking on certain product type filters (such as T-Shirts), some items (or all items) of that type would fail to show up, leading to empty or sparse lists.

**When:** Occurred during filter application via sidebar buttons or direct query parameter routing (e.g. `?type=tshirts`).
**Expected:** All matching products (e.g., all 24 t-shirts) should correctly render.
**Actual:** Only 1 or 2 products would match because of case-sensitivity mismatches or exact-string `.type` matching (which failed for variations like `"tee"`, `"T-Shirt"`, `"Oversized T-Shirt"`).

## Evidence & Diagnostics
1. Analyzed the actual `PRODUCTS` list:
   - Many T-shirts are stored under type `"tee"`, not `"T-Shirt"`.
   - Some have names like `"Tshirt"` or `"t-shirt"`.
   - Direct query parameters utilize plurals like `"tshirts"` or `"hoodies"`, while buttons utilize singular title case `"T-Shirt"`.
2. This difference in casing, pluralization, and terminology meant the strict matching logic failed to match 90% of the products.

## Resolution

**Root Cause:**
Strict, exact-match case-sensitive checks on the `p.type` string failed to reconcile variant product types, tags, names, handles, or URL parameter structures.

**Fix:**
Implemented a robust **normalization pipeline** within the `filteredProducts` loop in `App.tsx`:
1. Strips dashes, special characters, spaces, and plural `'s'` suffixes to create a standardized slug (e.g., `'T-Shirt'` and `'tshirts'` both normalize to `'tshirt'`).
2. Evaluates the normalized slug against several robust criteria:
   - **T-Shirt / Tee**: Matches if type is `'tee'` OR if type/handle/name/tags contain `"tshirt"`, `"t-shirt"`, or `"tee"`. Correctly excludes hoodies that accidentally have `'tee'` types.
   - **Hoodies**: Checks lowercase matches across types, tags, handles, and names.
   - **Crop Tops**: Resolves `"crop"`, `"croptop"`, and `"crop top"` variations.
   - **Oversized**: Safely parses any oversized tags, names, or handles.
3. Overhauled categories (`Men`, `Women`, `Unisex`) and tags (`VINTAGE`, `COLORFUL`, `PREMIUM`, `ESSENTIAL`) to be completely case-insensitive as well.

**Verified:**
Tested all filters on Vercel deployment:
- Hoodies: matches all 4 products.
- T-Shirts: matches all 24 products.
- Crop Tops: matches both products.
- Oversized: matches all 6 products.
All filters are now incredibly stable!
