/* =========================================================================
   PIXEL PIRATE — interactions
   - scroll progress bar
   - hide/show navbar on scroll
   - IntersectionObserver reveal animations (Apple-style "flow")
   - parallax hero layers
   - pinned scaling section progress (--p)
   - skill meter fill
   - mobile nav toggle
   - contact form (no backend) + footer year
   ========================================================================= */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------- mobile nav toggle --------------------------- */
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => links.classList.remove("open"))
    );
  }

  /* ------------------- inject the sailing pirate ship ------------------ */
  const SHIP_SVG = `
  <svg viewBox="0 0 96 176" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" role="img" aria-label="A pixel pirate ship sailing through water">
    <!-- trailing wake foam (behind the stern) -->
    <g class="wake-foam" fill="#d9f4ff">
      <rect x="22" y="2"  width="7" height="7"/>
      <rect x="67" y="2"  width="7" height="7"/>
      <rect x="29" y="13" width="7" height="7"/>
      <rect x="60" y="13" width="7" height="7"/>
      <rect x="36" y="23" width="6" height="6"/>
      <rect x="54" y="23" width="6" height="6"/>
    </g>

    <!-- hull (top-down, bow pointing down) -->
    <polygon points="30,30 66,30 82,74 78,120 48,170 18,120 14,74" fill="#6b3f1d"/>
    <polygon points="35,36 61,36 76,75 72,117 48,162 24,117 20,75" fill="#a4632e"/>
    <polygon points="40,42 56,42 68,76 64,113 48,150 32,113 28,76" fill="#c47a3c"/>

    <!-- deck planks -->
    <g fill="#a4632e">
      <rect x="32" y="69" width="32" height="3"/>
      <rect x="31" y="91" width="34" height="3"/>
      <rect x="34" y="111" width="28" height="3"/>
    </g>

    <!-- mast (cross-section) -->
    <rect x="44" y="74" width="8" height="10" fill="#5b3a1a"/>

    <!-- billowing sail, bulging toward the bow -->
    <polygon points="30,84 66,84 48,134" fill="#f6e7bd"/>
    <polygon points="30,84 66,84 48,92" fill="#e9d9ad"/>
    <circle cx="48" cy="104" r="7" fill="none" stroke="#e23636" stroke-width="3"/>

    <!-- jolly-roger flag laid over the stern -->
    <rect x="38" y="46" width="20" height="13" fill="#15110d"/>
    <rect x="44" y="50" width="3" height="3" fill="#f6e7bd"/>
    <rect x="49" y="50" width="3" height="3" fill="#f6e7bd"/>
    <rect x="45" y="55" width="7" height="2" fill="#f6e7bd"/>

    <!-- lantern at the bow -->
    <rect x="44" y="138" width="8" height="8" fill="#ffd23f"/>

    <!-- bow spray (foam where the bow cuts the water) -->
    <g class="bow-foam" fill="#d9f4ff">
      <rect x="38" y="166" width="7" height="7"/>
      <rect x="51" y="166" width="7" height="7"/>
      <rect x="45" y="172" width="7" height="5"/>
    </g>
  </svg>`;

  const ship = document.querySelector(".ship");
  if (ship) {
    ship.innerHTML = '<div class="ship-inner">' + SHIP_SVG + "</div>";
  }

  /* ---- canvas for the boat's wake trail (home page only) ---- */
  let trailCanvas = null;
  let trailCtx = null;
  if (ship && !prefersReduced) {
    ship.style.opacity = "0";   // hidden until you scroll to the "set sail" section
    trailCanvas = document.createElement("canvas");
    trailCanvas.className = "ship-trail";
    trailCanvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(trailCanvas);
    trailCtx = trailCanvas.getContext("2d");
    const sizeTrail = () => {
      trailCanvas.width = window.innerWidth;
      trailCanvas.height = window.innerHeight;
    };
    sizeTrail();
    window.addEventListener("resize", sizeTrail, { passive: true });
  }

  /* ------------------------- reveal on scroll -------------------------- */
  const revealEls = document.querySelectorAll(
    ".reveal, .reveal-left, .reveal-right, .reveal-zoom"
  );
  if ("IntersectionObserver" in window && !prefersReduced) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in-view"));
  }

  /* ----------------------- skill meter fill ---------------------------- */
  const meters = document.querySelectorAll(".meter > span[data-fill]");
  if ("IntersectionObserver" in window) {
    const mo = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bar = entry.target;
            bar.style.width = bar.dataset.fill + "%";
            obs.unobserve(bar);
          }
        });
      },
      { threshold: 0.4 }
    );
    meters.forEach((m) => mo.observe(m));
  } else {
    meters.forEach((m) => (m.style.width = m.dataset.fill + "%"));
  }

  /* ------------- scroll-driven effects (rAF batched) ------------------- */
  const progress = document.querySelector(".progress");
  const nav = document.querySelector(".nav");
  const layers = document.querySelectorAll(".hero__layer");
  const pins = document.querySelectorAll(".pin");
  let lastY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;

    /* progress bar */
    if (progress) {
      const pct = docH > 0 ? (y / docH) * 100 : 0;
      progress.style.width = pct + "%";
    }

    /* hide nav when scrolling down, show when scrolling up */
    if (nav) {
      if (y > lastY && y > 200) nav.classList.add("hide");
      else nav.classList.remove("hide");
    }
    lastY = y;

    if (!prefersReduced) {
      /* parallax hero layers */
      layers.forEach((layer, i) => {
        const speed = (i + 1) * 0.18;
        layer.style.transform = `translateY(${y * speed}px)`;
      });

      /* the ship flows down the centre of the page, weaving as you scroll.
         It stays hidden through the hero and appears once you reach "set sail". */
      if (ship) {
        const setSail = pins[0];
        const appearAt =
          (setSail ? setSail.offsetTop : window.innerHeight) - window.innerHeight * 0.35;
        const sailing = y >= appearAt;
        ship.style.opacity = sailing ? "1" : "0";

        const p = docH > 0 ? Math.min(Math.max(y / docH, 0), 1) : 0;
        const shipH = ship.offsetHeight || 140;
        const topMin = 24;
        const topMax = Math.max(window.innerHeight - shipH - 24, topMin);
        const ty = topMin + p * (topMax - topMin);              // top -> bottom with scroll
        const amp = Math.min(window.innerWidth * 0.18, 140);
        const sway = Math.sin(y * 0.0045) * amp;                // gentle side-to-side weave
        ship.style.transform =
          "translate(calc(-50% + " + sway.toFixed(1) + "px), " + ty.toFixed(1) + "px)";

        /* trace the boat's path on the water: redraw the trajectory from the
           "set sail" point down to the boat's current spot, so it fills as you
           scroll down and retracts as you scroll back up */
        if (trailCtx) {
          const cv = trailCanvas;
          trailCtx.clearRect(0, 0, cv.width, cv.height);
          if (sailing) {
            const centerX = window.innerWidth / 2;
            const tailY = shipH * 0.5;          // anchor the wake near the boat's centre
            const startS = Math.max(appearAt, 0);
            trailCtx.lineJoin = "round";
            trailCtx.lineCap = "round";
            trailCtx.beginPath();
            for (let s = startS, started = false; s <= y; s += 9) {
              const ps = docH > 0 ? s / docH : 0;
              const sy = s + topMin + ps * (topMax - topMin) + tailY - y;
              const sx = centerX + Math.sin(s * 0.0045) * amp;
              if (!started) { trailCtx.moveTo(sx, sy); started = true; }
              else trailCtx.lineTo(sx, sy);
            }
            trailCtx.lineTo(centerX + sway, ty + tailY);   // meet the boat exactly
            trailCtx.strokeStyle = "rgba(217, 244, 255, 0.10)";  // soft outer wake
            trailCtx.lineWidth = 9;
            trailCtx.stroke();
            trailCtx.setLineDash([2, 9]);                        // foam beads
            trailCtx.strokeStyle = "rgba(217, 244, 255, 0.5)";
            trailCtx.lineWidth = 3;
            trailCtx.stroke();
            trailCtx.setLineDash([]);
          }
        }
      }

      /* pinned section progress 0..1 */
      pins.forEach((pin) => {
        const rect = pin.getBoundingClientRect();
        const total = pin.offsetHeight - window.innerHeight;
        const scrolled = Math.min(Math.max(-rect.top, 0), total);
        const p = total > 0 ? scrolled / total : 0;
        pin.style.setProperty("--p", p.toFixed(3));
      });
    }

    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
  onScroll();
  window.addEventListener(
    "resize",
    () => window.requestAnimationFrame(onScroll),
    { passive: true }
  );

  /* --------------------------- contact form ---------------------------- */
  const form = document.querySelector(".form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const status = form.querySelector(".ok");
      const name = (form.querySelector('[name="name"]') || {}).value || "matey";
      if (status) {
        status.textContent =
          "Message away — sent off, " + name + "! ⚓";
      }
      form.reset();
    });
  }

  /* ---------------------------- footer year ---------------------------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
