# SPECIFICATION - UI Refinement & Aesthetic Overhaul

**Status**: FINALIZED

## Overview
This specification covers the UI/UX refinement of the Elevez platform to move from a "zoomed-in" look to a more precise, high-end Neo-Brutalist aesthetic with cinematic interactive elements.

## Requirements

### 1. Scaling & Zoom Level
- **Problem**: Items and sections feel "way too big" and "zoomed in".
- **Action**: 
    - Scale down product cards in collections.
    - Reduce section vertical padding (32 units is too much).
    - Shrink the Hero section components (text and buttons) slightly for better framing.

### 2. Heading Animations (Glitch Effect)
- **Problem**: Headings need more "Neo-Brutalist" personality.
- **Action**:
    - Implement a subtle glitch effect (similar to the "ELEVEZ" brand glitch) on section headers.
    - Animation should trigger on load, scroll (into view), and hover.
    - Ensure smooth transitions and high performance.

### 3. Layout Precision
- **Problem**: Sections feel "stretched" or loosely placed.
- **Action**:
    - Refine the grid layouts for collections.
    - Adjust margins and alignment to ensure components feel "precisely placed".

### 4. Component Scope
- **Hero Section**: `Home` hero in `App.tsx`.
- **Collections Grid**: `BestSellers`, `Shop` grid.
- **Section Headers**: `SectionHeader` component.
- **Product Cards**: `ProductCard` component.

## Out of Scope
- Backend logic, order management, or loyalty engine changes.
- Creating new pages.

## Tech Stack
- React, Tailwind CSS (Vanilla CSS in `index.css`), Framer Motion, GSAP.
