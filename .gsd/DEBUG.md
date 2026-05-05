# Debug Session: Hero Heading Clipping

## Symptom
The massive "ELEVATE YOUR STYLE GAME" heading in the Hero section is being clipped at the top and the letters are overlapping in an unreadable way.

**When:** Always visible on the homepage hero.
**Expected:** The entire heading should be visible, and the box should scale to fit the massive text without overlap.
**Actual:** "ELEVATE" is partially hidden, and the text feels crowded/overlapping.

## Hypotheses
| # | Hypothesis | Likelihood | Status |
|---|------------|------------|--------|
| 1 | `overflow-hidden` on the container or parent is clipping the scaled/skewed text. | 90% | UNTESTED |
| 2 | `leading-[0.9]` or similar tight line-height is too small for the massive font size. | 80% | UNTESTED |
| 3 | Hero container padding/width is too small for the text dimensions. | 70% | UNTESTED |

## Evidence
- Screenshot shows "ELEVATE" clipped at the top.
- `InteractiveText` uses `overflow-hidden` internally for the reveal animation, which might be clipping the hover scale.
- `App.tsx` line 1448 has `leading-[0.9]`.

## Attempts

### Attempt 1
**Testing:** H1 & H2 - Clipping and Line Height
**Action:** Increase `leading`, remove `overflow-hidden` where not needed, and increase container size.
