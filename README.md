# Novaform — B2B agency website (light, futuristic, wireframe + rounded)

Static site for a B2B agency serving service firms, dev agencies and startups.
Light theme: cool white base, electric indigo → cyan gradient, ink text, dashed wireframe frames with crosshair corners.
All photos, videos and JS libraries are stored locally in `/assets` — nothing is hotlinked.

## Run
- Double-click `start.bat` (opens http://localhost:5511), or
- `python -m http.server 5511` in this folder, or open `index.html` directly.

## Sections
Hero (video frame + floating UI cards) · client logos · scroll-highlight statement · stacking service cards ·
bento "why us" grid · case studies · drawn process path + stats video · dual testimonial marquee ·
pricing (monthly/quarterly) · FAQ accordion · contact form · footer.

## Motion
Blur-in word reveals, wireframe frame opening, mouse-follow spotlight and orbs, 3D tilt tiles,
sticky stacking cards, image unmasking, SVG path drawing, counters, marquees. Respects reduced-motion.

## Structure
```
index.html, css/style.css, js/main.js
assets/img      Unsplash photos (free commercial licence)
assets/video    Mixkit videos (free commercial licence)
assets/vendor   gsap, ScrollTrigger, lenis
assets/fetch-assets.ps1   re-downloads media if ever needed
```

## Before going live
- Replace brand name, contact details, client names, case-study numbers, testimonials and prices (sample content).
- Connect the contact and hero forms in `js/main.js` to your backend / CRM.
