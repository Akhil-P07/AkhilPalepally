# 🏴‍☠️ Pixel Pirate — Akhil Palepally's Personal Website

A quirky, pirate-themed **pixel** personal site with Apple-style
scroll "flow" animations and a **pixel pirate ship** sailing down the page as you scroll.

Pure HTML / CSS / vanilla JS — **no build step**, ready for GitHub Pages.

## Pages
- `index.html` — Home (parallax hero, pinned scaling section, skills, journey)
- `blog.html` — Captain's Log (bounty-poster blog cards)
- `projects.html` — Treasure Vault (featured + project grid)
- `contact.html` — Get in Touch (contact form + social links + **Resume button**)
- `resume.html` — printable resume (the Resume button opens this → Print/Save as PDF)

## Tech notes
- Fonts: *Press Start 2P* (pixel headings) + *VT323* (body) via Google Fonts.
- Animations: `IntersectionObserver` reveals, scroll-driven parallax, a pinned
  scaling section, and a requestAnimationFrame-batched scroll handler.
- Respects `prefers-reduced-motion`.
