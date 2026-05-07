# Debug Session: Hero Element Scroll Overflow & Marquee Collision

## Symptom
When scrolling past the first hero section, the buttons ("SHOP COLLECTION" and "EXPLORE MORE") move downward and spill past the bottom border of the Main Hero Box. This causes them to fully overlap the scrolling marquee text and get clipped (become invisible) due to the outer section's `overflow-hidden`.

**When:** During vertical scrolling from the top of the homepage.
**Expected:** The hero text and buttons should remain securely contained inside the Main Hero Box frame and shouldn't collide with or overlap the marquee.
**Actual:** The buttons slide out of the bottom of the box and overlap the green marquee before getting clipped.

---

## Evidence
- `App.tsx` has `const heroTextY = useTransform(scrollY, [0, 500], [0, 200]);`.
- This `heroTextY` is applied to the inner content wrapper (`motion.div` around the text and buttons inside the card).
- The Main Hero Box border is static and does not have any scroll parallax transform applied.
- The outer `<section>` has `overflow-hidden` which clips any absolute/relative children overflowing its bounds.

---

## Hypotheses

| # | Hypothesis | Likelihood | Status |
|---|------------|------------|--------|
| 1 | Applying scroll parallax to the inner content relative to a static bordered box inevitably breaks containment, making elements spill out of their frame. | 95% | UNTESTED |
| 2 | Applying the parallax transform `y` to the **entire Main Hero Box** (with a slightly reduced, elegant range of `[0, 120]`px) instead of the inner content will scroll the card slower as a single unit, preserving perfect internal containment. | 95% | UNTESTED |

---

## Attempts

### Attempt 1
**Testing:** H1 & H2 — Parallax Container shift & Containment
**Action:** 
1. Moved `y: heroTextY` from the inner content `motion.div` to the parent `Main Hero Box` container.
2. Reduced `heroTextY` range to `[0, 120]` for a tighter, high-end parallax shift.
3. Enabled mouse-parallax-Y (`heroMoveY`) on the inner text.
**Result:** Successful. The card and all internal elements scroll slowly as one single contained piece. The buttons remain perfectly within their frame and do not spill out.

### Attempt 2
**Testing:** X-Shaped Crossing Marquees with Section Overlap
**Action:**
1. Removed the single bottom-aligned marquee from the Hero section.
2. Created a new middle layout block containing two overlapping `InfiniteMarquee` elements inside rotated containers (`-rotate-[4deg]` and `rotate-[4deg]`) at `z-10` with `-my-40` negative vertical margins.
3. Elevated the "Why Choose Elevez" section's stacking to `z-30` and added an upward-pointing neobrutalist thick shadow `shadow-[0_-16px_0_0_#000]` along with a top border `border-t-[8px]`.
**Result:** Beautifully successful. The marquees cross in a highly visual "X" pattern, and the Why Choose Elevez section overlaps them cleanly with a sharp black shadow and border, cutting off a small portion of the crossing marquees exactly as requested.

---

## Resolution

**Root Cause:** The parallax translation was applied to the inner text content relative to a static border container, causing buttons to slide out of containment and overlap the bottom-aligned marquee, which then clipped out of the section's viewport bounds.
**Fix:** Moved scroll parallax to the entire Hero box container (keeping elements contained inside) and replaced the single marquee with an X-shaped overlapping crossing marquee system that sits behind the heavily-styled Why Choose Elevez section.
**Verified:** Verified via live scroll interaction. The neobrutalist aesthetic is pristine and perfectly stacked.
