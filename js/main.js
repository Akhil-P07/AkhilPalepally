/* =========================================================================
   GRAND LINE — interactions
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

  /* --------------- inject the sailing Thousand Sunny ------------------- */
  const SUNNY_SVG = `
  <svg viewBox="0 0 180 150" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" role="img" aria-label="The Thousand Sunny sailing">
    <!-- jolly roger flag -->
    <rect x="70" y="14" width="5" height="92" fill="#5b3a1a"/>
    <rect x="44" y="12" width="26" height="18" fill="#15110d"/>
    <rect x="55" y="17" width="6" height="6" fill="#f6e7bd"/>
    <rect x="50" y="23" width="16" height="3" fill="#f6e7bd"/>
    <!-- back mast -->
    <rect x="108" y="30" width="5" height="76" fill="#5b3a1a"/>
    <!-- back sail -->
    <path d="M113 38 C 144 48, 144 88, 113 98 Z" fill="#f6e7bd" stroke="#c9b582" stroke-width="2"/>
    <rect x="122" y="52" width="2" height="40" fill="#dfceA0"/>
    <!-- front sail -->
    <rect x="42" y="28" width="30" height="4" fill="#5b3a1a"/>
    <path d="M70 32 C 34 44, 34 86, 70 98 Z" fill="#f6e7bd" stroke="#c9b582" stroke-width="2"/>
    <rect x="52" y="40" width="2" height="50" fill="#dfceA0"/>
    <rect x="61" y="40" width="2" height="50" fill="#dfceA0"/>
    <!-- straw hat sail emblem -->
    <circle cx="52" cy="64" r="9" fill="none" stroke="#e23636" stroke-width="3"/>
    <!-- grassy deck -->
    <rect x="26" y="100" width="122" height="7" fill="#3fa34d"/>
    <rect x="26" y="100" width="122" height="2" fill="#5cc463"/>
    <!-- hull -->
    <polygon points="20,107 152,107 138,134 34,134" fill="#a4632e"/>
    <polygon points="20,107 152,107 150,114 22,114" fill="#c47a3c"/>
    <rect x="30" y="116" width="108" height="6" fill="#f0a500"/>
    <polygon points="34,134 138,134 128,143 46,143" fill="#6b3f1d"/>
    <!-- portholes -->
    <circle cx="58" cy="125" r="4" fill="#0e4c8a"/>
    <circle cx="84" cy="125" r="4" fill="#0e4c8a"/>
    <circle cx="110" cy="125" r="4" fill="#0e4c8a"/>
    <!-- lion figurehead at the bow -->
    <circle cx="156" cy="98" r="15" fill="#ffd23f"/>
    <circle cx="159" cy="98" r="9" fill="#ffe48a"/>
    <rect x="155" y="94" width="3" height="3" fill="#6b3f1d"/>
    <rect x="162" y="94" width="3" height="3" fill="#6b3f1d"/>
    <rect x="157" y="100" width="5" height="3" fill="#a4161a"/>
    <!-- bow spray -->
    <rect x="150" y="120" width="6" height="4" fill="#7fd6f0"/>
    <rect x="158" y="116" width="5" height="4" fill="#7fd6f0"/>
  </svg>`;

  const ship = document.querySelector(".sunny-ship");
  if (ship) {
    ship.innerHTML = '<div class="ship-inner">' + SUNNY_SVG + "</div><span class=\"wake\"></span>";
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

      /* the Thousand Sunny tacks left/right as you sail down the page */
      if (ship) {
        const amp = Math.min(window.innerWidth * 0.3, 200);
        const sway = Math.sin(y * 0.0045) * amp;
        ship.style.transform = "translateX(calc(-50% + " + sway.toFixed(1) + "px))";
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

  /* --------------------------- contact form ---------------------------- */
  const form = document.querySelector(".form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const status = form.querySelector(".ok");
      const name = (form.querySelector('[name="name"]') || {}).value || "nakama";
      if (status) {
        status.textContent =
          "Den Den Mushi ringing... message sent, " + name + "! ⚓";
      }
      form.reset();
    });
  }

  /* ---------------------------- footer year ---------------------------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
