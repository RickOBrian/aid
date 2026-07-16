(function () {
  if (typeof Typograf === "undefined") return;

  var tp = new Typograf({ locale: ["ru", "en-US"] });
  tp.enableRule("ru/optalign/*");

  var SKIP_SELECTOR = ".example-card--bad, .no-typography";
  var TARGET_SELECTOR = [
    ".page-header__title",
    ".page-content p",
    ".page-content h2",
    ".page-content h3",
    ".sidebar__link",
    ".footer-nav__label",
  ].join(", ");

  function isSkipped(el) {
    return el.closest(SKIP_SELECTOR);
  }

  function typografHtml(html) {
    return tp.execute(html);
  }

  function applyTypography() {
    document.querySelectorAll(TARGET_SELECTOR).forEach(function (el) {
      if (isSkipped(el)) return;

      var html = el.innerHTML;
      if (!html || !html.trim()) return;

      var result = typografHtml(html);
      if (result !== html) {
        el.innerHTML = result;
      }
    });

    var title = document.querySelector("title");
    if (title && title.textContent.trim()) {
      title.textContent = typografHtml(title.textContent);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyTypography);
  } else {
    applyTypography();
  }
})();
