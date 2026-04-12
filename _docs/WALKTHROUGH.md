# Bekasen Agency Website — Build Walkthrough

## Project Overview
**Agency Name:** Bekasen  
**Type:** Creative / Digital Marketing Agency  
**Stack:** HTML5, CSS3 (custom), Vanilla JavaScript  
**Date Started:** March 30, 2026  

---

## Assumptions Made
Since the workspace was empty and the user went to sleep, the following decisions were made:
- Agency type: Creative / digital marketing (based on folder name "bekasen")
- Single-page layout with smooth-scroll navigation
- Modern dark/light theme with deep navy + amber accent palette
- No framework dependencies — pure HTML/CSS/JS for zero build-step setup
- Fully responsive (mobile-first)

---

## File Structure
```
bekasen/
├── WALKTHROUGH.md      ← This file (build diary)
├── index.html          ← Main single-page site
├── styles.css          ← All styling (custom properties, grid, flex)
└── script.js           ← Nav scroll behavior, animations, form
```

---

## Step-by-Step Build Log

### Step 1 — Plan & Assumptions ✅
- Decided on agency type, stack, and structure
- Created this walkthrough file

### Step 2 — styles.css ✅
- CSS custom properties for color palette (navy, amber, white)
- CSS reset + base typography
- Sticky nav with scroll-shadow effect
- Hero section with animated gradient headline
- Services grid (3-column)
- Portfolio grid with hover overlay
- Team cards
- Contact form
- Footer
- Media queries for tablet and mobile

### Step 3 — index.html ✅
- Semantic HTML5 structure
- Nav: logo + links + CTA button
- Hero: headline, subtext, dual CTAs, floating stat badges
- About: split layout (text + image placeholder)
- Services: 6-card grid with icons
- Portfolio: 6-item grid with case study overlays
- Team: 4-person cards
- Contact: split layout (info + form)
- Footer: links, socials, copyright

### Step 4 — script.js ✅
- Sticky nav shadow on scroll
- Active nav link highlighting
- Intersection Observer for scroll-in animations
- Mobile hamburger menu toggle
- Contact form submission handler (client-side)
- Smooth scroll for anchor links

### Step 5 — Verification ✅
- All files created and cross-checked
- No external dependencies (fonts served from Google Fonts CDN only)

---

## Customization Guide (for when you wake up)
| Thing to change | Where |
|---|---|
| Agency name | `index.html` — search "Bekasen" |
| Colors | `styles.css` — `:root` block at top |
| Services list | `index.html` — `#services` section |
| Team names/photos | `index.html` — `#team` section |
| Contact email | `index.html` — `#contact` section |
| Portfolio items | `index.html` — `#portfolio` section |

---

## Open Questions for User
1. Do you have a real logo file to replace the text logo?
2. Any real photography / brand imagery to swap in?
3. What is the actual agency type (marketing, talent, real estate…)?
4. Where will this be hosted? (Affects any forms/backend needed)
5. Do you want a blog/news section?
