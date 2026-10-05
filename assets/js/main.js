(function () {
  "use strict";

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function resolveAssetPath(path) {
    if (!path) return path;
    const depth = (window.SLC_PATH_PREFIX || "").replace(/\/$/, "");
    if (!depth) return path;
    if (path.startsWith("http") || path.startsWith("/") || path.startsWith(depth)) {
      return path;
    }
    return `${depth}/${path}`.replace(/\/{2,}/g, "/").replace(":/", "://");
  }

  function buildPlaceholder(src, caption, paper) {
    const file = (src || "").split("/").pop() || "image.jpg";
    return `
      <div class="placeholder ${paper ? "placeholder--paper" : ""}" role="img" aria-label="${caption || file}">
        <div class="placeholder__meta">
          <div class="placeholder__label">Photography Placeholder</div>
          <div class="placeholder__file">${file}</div>
          ${caption ? `<div class="placeholder__caption">${caption}</div>` : ""}
        </div>
      </div>
    `;
  }

  function enhanceMedia() {
    qsa("[data-img]").forEach((el) => {
      const src = resolveAssetPath(el.getAttribute("data-img"));
      const alt = el.getAttribute("data-alt") || "";
      const caption = el.getAttribute("data-caption") || alt;
      const paper = el.hasAttribute("data-paper");
      const img = new Image();
      img.loading = el.hasAttribute("data-eager") ? "eager" : "lazy";
      img.alt = alt;
      img.src = src;
      img.onload = () => {
        el.innerHTML = "";
        el.appendChild(img);
      };
      img.onerror = () => {
        el.innerHTML = buildPlaceholder(src, caption, paper);
      };
    });
  }

  function initNav() {
    const header = qs(".site-header");
    const toggle = qs(".nav-toggle");
    const mobile = qs(".mobile-nav");
    const links = qsa(".mobile-nav a");

    const onScroll = () => {
      if (!header) return;
      const banner = qs(".banner");
      const threshold = banner
        ? Math.max(80, banner.offsetHeight - header.offsetHeight - 24)
        : 80;
      header.classList.toggle("is-scrolled", window.scrollY > threshold);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (toggle && mobile) {
      toggle.addEventListener("click", () => {
        const open = !mobile.classList.contains("is-open");
        mobile.classList.toggle("is-open", open);
        document.body.classList.toggle("nav-open", open);
        toggle.setAttribute("aria-expanded", String(open));
      });

      links.forEach((link) => {
        link.addEventListener("click", () => {
          mobile.classList.remove("is-open");
          document.body.classList.remove("nav-open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }
  }

  function initBanner() {
    const banner = qs(".banner");
    if (!banner) return;
    const scrollBtn = qs(".banner__scroll", banner);
    if (!scrollBtn) return;

    scrollBtn.addEventListener("click", (event) => {
      const href = scrollBtn.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      const target = qs(href);
      if (!target) return;
      event.preventDefault();
      const header = qs(".site-header");
      const offset = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    });
  }

  function initReveal() {
    const items = qsa(".reveal");
    if (!items.length || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach((el) => io.observe(el));
  }

  function initYear() {
    qsa("[data-year]").forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initBanner();
    enhanceMedia();
    initReveal();
    initYear();
  });
})();
