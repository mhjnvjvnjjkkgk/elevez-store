# Debug Session: Collection Saving and Persistence Issues

## Symptom
**Problem:** Collections created or edited in the Admin Panel do not persist and vanish or revert on page refresh.

**When:** Occurs immediately upon refreshing the page, especially when using the Vercel-deployed server in combination with the local admin-server.
**Expected:** Saved collections should be persistent across browser refreshes and fully synced to both Firestore and local JSON files.
**Actual:** Saved/edited collections revert to older Firestore states or empty lists upon refreshing the browser.

---

## Evidence & Diagnostics

1. **Diagnosis of SWR Merging Logic (`admin.js`):**
   - The SWR loading mechanism merges collections from Firestore Cloud, Local Server API, and Local Storage using the `getNewerCollection(c1, c2)` helper.
   - `getNewerCollection` compares timestamps:
     `const t1 = new Date(c1.updatedAt || c1.createdAt || c1.importedAt || 0).getTime() || 0;`
   - **Critical Defect found in `onsubmit` of `#collectionForm`:** The form submission does **NOT** write `updatedAt` directly into the saved collection object inside `state.collections` or localStorage.
   - **Result of Defect:** Any local edit or creation gets saved with no `updatedAt` (timestamp `0`). When Firestore returns its loaded collections (which have `updatedAt` from old background writes), the SWR merge treats the cloud collection as newer (`t2 > 0`), completely overwriting the new local edits and causing them to "vanish" on refresh!

---

## Hypotheses

| # | Hypothesis | Likelihood | Status |
|---|------------|------------|--------|
| 1 | Collection edits inside `#collectionForm` submit lack `updatedAt` fields, resulting in a timestamp of `0` during SWR merges. | 100% | CONFIRMED |
| 2 | `saveCollectionsToServer` writes `updatedAt` to Firestore but fails to update the local `state.collections` array reference, keeping local timestamps as `0`. | 100% | CONFIRMED |

---

## Proposed Fixes

1. Update `#collectionForm` submit handler inside `admin.js` to explicitly set both `createdAt` and `updatedAt` on the collection object before saving.
2. Update `saveCollectionsToServer` to ensure `col.updatedAt` is synchronized locally before sending data to Firestore and the local Node.js API server.
