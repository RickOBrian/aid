(function () {
  const scrollTopBtn = document.querySelector(".scroll-top");

  if (scrollTopBtn) {
    const toggleScrollTop = () => {
      scrollTopBtn.classList.toggle("is-visible", window.scrollY > 400);
    };

    window.addEventListener("scroll", toggleScrollTop, { passive: true });
    toggleScrollTop();

    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const sections = document.querySelectorAll("[data-section]");
  const sidebar = document.querySelector(".sidebar");
  const navLinks = document.querySelectorAll(".sidebar__link");

  if (!sections.length || !navLinks.length || !sidebar) return;

  const stuckBackdrop = document.createElement("div");
  stuckBackdrop.className = "sidebar-stuck-backdrop";
  stuckBackdrop.setAttribute("aria-hidden", "true");
  document.body.appendChild(stuckBackdrop);

  function updateStuckState() {
    const rect = sidebar.getBoundingClientRect();
    const isStuck = rect.top <= 0;
    sidebar.classList.toggle("is-stuck", isStuck);
    if (isStuck) {
      stuckBackdrop.style.height = `${rect.height}px`;
    }
    stuckBackdrop.classList.toggle("is-visible", isStuck);
  }

  window.addEventListener("scroll", updateStuckState, { passive: true });
  window.addEventListener("resize", updateStuckState);
  updateStuckState();

  const sectionMap = new Map();
  navLinks.forEach((link) => {
    const id = link.getAttribute("href")?.slice(1);
    if (id) sectionMap.set(id, link);
  });

  let navScroll = null;

  function setupSectionNav() {
    if (sidebar.dataset.navReady) return;
    sidebar.dataset.navReady = "true";

    const list = sidebar.querySelector(".sidebar__list");
    if (!list) return;

    const inner = document.createElement("div");
    inner.className = "sidebar__inner";

    const scroll = document.createElement("div");
    scroll.className = "sidebar__scroll";
    scroll.tabIndex = 0;
    scroll.setAttribute("role", "region");
    scroll.setAttribute("aria-label", "Разделы страницы");

    const prev = document.createElement("button");
    prev.type = "button";
    prev.className = "sidebar__btn sidebar__btn--prev";
    prev.setAttribute("aria-label", "Прокрутить разделы назад");
    prev.innerHTML = '<img src="assets/arrow-left.svg?v=2" alt="" width="20" height="20">';

    const next = document.createElement("button");
    next.type = "button";
    next.className = "sidebar__btn sidebar__btn--next";
    next.setAttribute("aria-label", "Прокрутить разделы вперёд");
    next.innerHTML = '<img src="assets/arrow-right.svg?v=2" alt="" width="20" height="20">';

    sidebar.insertBefore(inner, list);
    inner.append(prev, scroll, next);
    scroll.appendChild(list);
    navScroll = scroll;

    function updateScrollState() {
      const { scrollLeft, scrollWidth, clientWidth } = scroll;
      const scrollable = scrollWidth > clientWidth + 2;
      inner.classList.toggle("is-scrollable", scrollable);
      inner.classList.toggle("can-scroll-left", scrollable && scrollLeft > 2);
      inner.classList.toggle(
        "can-scroll-right",
        scrollable && scrollLeft < scrollWidth - clientWidth - 2
      );
    }

    function scrollByDir(dir) {
      scroll.scrollBy({
        left: dir * Math.min(280, scroll.clientWidth * 0.75),
        behavior: "smooth",
      });
    }

    prev.addEventListener("click", () => scrollByDir(-1));
    next.addEventListener("click", () => scrollByDir(1));

    scroll.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    scroll.addEventListener(
      "wheel",
      (e) => {
        if (scroll.scrollWidth <= scroll.clientWidth) return;

        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        if (delta === 0) return;

        e.preventDefault();
        e.stopPropagation();
        scroll.scrollLeft += delta;
      },
      { passive: false }
    );

    scroll.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollByDir(-1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollByDir(1);
      }
    });

    updateScrollState();
  }

  function scrollActiveLinkIntoView() {
    const active = document.querySelector(".sidebar__link.is-active");
    if (!active || !navScroll) return;

    const linkLeft = active.offsetLeft;
    const linkWidth = active.offsetWidth;
    const viewport = navScroll.clientWidth;
    const target = linkLeft - (viewport - linkWidth) / 2;
    const maxScroll = navScroll.scrollWidth - viewport;

    navScroll.scrollTo({
      left: Math.max(0, Math.min(target, maxScroll)),
      behavior: "smooth",
    });
  }

  function setActiveLink(id) {
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
    });
    scrollActiveLinkIntoView();
  }

  setupSectionNav();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    },
    { rootMargin: "-25% 0px -55% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const id = link.getAttribute("href")?.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveLink(id);
      }
    });
  });

  scrollActiveLinkIntoView();
  if (navScroll) {
    window.addEventListener("resize", () => {
      requestAnimationFrame(scrollActiveLinkIntoView);
    });
  }
})();

(function () {
  function initNumberedLine(containerSelector, numberSelector, lineClass) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const numbers = container.querySelectorAll(numberSelector);
    if (numbers.length < 2) return;

    let line = container.querySelector("." + lineClass);
    if (!line) {
      line = document.createElement("div");
      line.className = lineClass;
      line.setAttribute("aria-hidden", "true");
      container.prepend(line);
    }

    function updateLine() {
      const containerRect = container.getBoundingClientRect();
      const firstRect = numbers[0].getBoundingClientRect();
      const lastRect = numbers[numbers.length - 1].getBoundingClientRect();

      const top = firstRect.top - containerRect.top + firstRect.height / 2;
      const bottom = lastRect.top - containerRect.top + lastRect.height / 2;

      line.style.top = `${top}px`;
      line.style.height = `${Math.max(0, bottom - top)}px`;
    }

    updateLine();
    window.addEventListener("resize", updateLine);
    window.addEventListener("load", updateLine);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updateLine);
    }

    if ("ResizeObserver" in window) {
      const ro = new ResizeObserver(updateLine);
      ro.observe(container);
    }
  }

  initNumberedLine(".checklist-steps", ".checklist-step__number", "checklist-steps__line");
  initNumberedLine(".quality-checklist", ".quality-item__number", "quality-checklist__line");
})();
