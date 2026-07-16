/*
 * Поиск по сайту: нормализация, коррекция раскладки клавиатуры (RU<->EN),
 * нечёткое сравнение (опечатки) и UI выпадающего списка / страницы результатов.
 */
(function () {
  "use strict";

  var RU_TO_EN = {
    "й": "q", "ц": "w", "у": "e", "к": "r", "е": "t", "н": "y", "г": "u", "ш": "i", "щ": "o", "з": "p", "х": "[", "ъ": "]",
    "ф": "a", "ы": "s", "в": "d", "а": "f", "п": "g", "р": "h", "о": "j", "л": "k", "д": "l", "ж": ";", "э": "'",
    "я": "z", "ч": "x", "с": "c", "м": "v", "и": "b", "т": "n", "ь": "m", "б": ",", "ю": "."
  };

  var EN_TO_RU = {};
  Object.keys(RU_TO_EN).forEach(function (ru) {
    EN_TO_RU[RU_TO_EN[ru]] = ru;
  });

  function convertLayout(str, map) {
    var out = "";
    for (var i = 0; i < str.length; i++) {
      var ch = str[i];
      out += Object.prototype.hasOwnProperty.call(map, ch) ? map[ch] : ch;
    }
    return out;
  }

  function normalize(str) {
    return String(str || "")
      .toLowerCase()
      .replace(/ё/g, "е")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function queryVariants(raw) {
    var q = normalize(raw);
    if (!q) return [];
    var set = [q];
    var toEn = convertLayout(q, RU_TO_EN);
    var toRu = convertLayout(q, EN_TO_RU);
    if (set.indexOf(toEn) === -1) set.push(toEn);
    if (set.indexOf(toRu) === -1) set.push(toRu);
    return set;
  }

  function levenshtein(a, b) {
    var m = a.length,
      n = b.length;
    if (!m) return n;
    if (!n) return m;
    var dp = new Array(n + 1);
    for (var j = 0; j <= n; j++) dp[j] = j;
    for (var i = 1; i <= m; i++) {
      var prev = dp[0];
      dp[0] = i;
      for (j = 1; j <= n; j++) {
        var tmp = dp[j];
        var cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
        prev = tmp;
      }
    }
    return dp[n];
  }

  function tokenize(text) {
    return normalize(text).split(" ").filter(Boolean);
  }

  function scoreText(query, text) {
    var normText = normalize(text);
    if (!query || !normText) return 0;

    if (normText.indexOf(query) !== -1) {
      var idx = normText.indexOf(query);
      var score = 60 + Math.min(30, query.length * 2);
      if (idx === 0) score += 15;
      return score;
    }

    var queryTokens = query.split(" ").filter(Boolean);
    var textTokens = tokenize(text);
    if (!queryTokens.length || !textTokens.length) return 0;

    var total = 0;
    for (var i = 0; i < queryTokens.length; i++) {
      var qt = queryTokens[i];
      if (qt.length < 2) continue;

      var best = 0;
      for (var j = 0; j < textTokens.length; j++) {
        var tt = textTokens[j];
        if (tt.length < 2) continue;

        var shorter = qt.length <= tt.length ? qt : tt;
        var longer = qt.length <= tt.length ? tt : qt;
        if (shorter.length >= 3 && longer.indexOf(shorter) !== -1) {
          var coverage = shorter.length / longer.length;
          best = Math.max(best, 25 + coverage * 15);
          continue;
        }

        var maxLen = Math.max(qt.length, tt.length);
        if (maxLen === 0) continue;
        var allowedDist = qt.length <= 4 ? 1 : qt.length <= 7 ? 2 : 3;
        var dist = levenshtein(qt, tt);
        if (dist <= allowedDist) {
          var sim = 1 - dist / maxLen;
          best = Math.max(best, sim * 35);
        }
      }
      total += best;
    }
    return total / queryTokens.length;
  }

  function scoreItem(query, item) {
    var titleScore = scoreText(query, item.title) * 1.5;
    var textScore = scoreText(query, item.text || item.snippet || "") * 1;
    var kwScore = scoreText(query, item.keywords || "") * 0.8;
    var pageScore = scoreText(query, item.page || "") * 0.4;
    return titleScore + textScore + kwScore + pageScore;
  }

  var MIN_SCORE = 18;

  function search(rawQuery, limit) {
    var index = window.SEARCH_INDEX || [];
    var variants = queryVariants(rawQuery);
    if (!variants.length) return [];

    var results = [];
    for (var i = 0; i < index.length; i++) {
      var item = index[i];
      var best = 0;
      for (var v = 0; v < variants.length; v++) {
        var variant = variants[v];
        if (!variant) continue;
        best = Math.max(best, scoreItem(variant, item));
      }
      if (best >= MIN_SCORE) {
        results.push({ item: item, score: best });
      }
    }

    results.sort(function (a, b) {
      return b.score - a.score;
    });

    var seen = {};
    var deduped = [];
    for (var r = 0; r < results.length; r++) {
      var key = results[r].item.title + "|" + results[r].item.url;
      if (seen[key]) continue;
      seen[key] = true;
      deduped.push(results[r]);
    }

    return typeof limit === "number" ? deduped.slice(0, limit) : deduped;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function highlight(text, rawQuery) {
    var variants = queryVariants(rawQuery).sort(function (a, b) {
      return b.length - a.length;
    });
    var normText = normalize(text);
    for (var i = 0; i < variants.length; i++) {
      var v = variants[i];
      if (!v) continue;
      var idx = normText.indexOf(v);
      if (idx !== -1) {
        return (
          escapeHtml(text.slice(0, idx)) +
          "<mark>" + escapeHtml(text.slice(idx, idx + v.length)) + "</mark>" +
          escapeHtml(text.slice(idx + v.length))
        );
      }
    }
    return escapeHtml(text);
  }

  // Ищет вхождение запроса (или его раскладки) прямо в исходном (не нормализованном)
  // тексте — чтобы вырезать вокруг найденного места окно предпросмотра.
  function findRawMatch(text, rawQuery) {
    var variants = queryVariants(rawQuery)
      .filter(function (v) { return v && v.length >= 2; })
      .sort(function (a, b) { return b.length - a.length; });
    var lower = text.toLowerCase();
    for (var i = 0; i < variants.length; i++) {
      var idx = lower.indexOf(variants[i]);
      if (idx !== -1) return { index: idx, length: variants[i].length };
    }
    return null;
  }

  function buildSnippet(text, rawQuery, maxLen) {
    text = String(text || "").replace(/\s+/g, " ").trim();
    maxLen = maxLen || 140;
    if (!text) return "";

    var match = findRawMatch(text, rawQuery);
    if (!match) {
      return escapeHtml(text.length > maxLen ? text.slice(0, maxLen).trim() + "…" : text);
    }

    var start = Math.max(0, match.index - Math.floor((maxLen - match.length) / 2));
    var end = Math.min(text.length, start + maxLen);
    start = Math.max(0, end - maxLen);

    var before = text.slice(start, match.index);
    var matched = text.slice(match.index, match.index + match.length);
    var after = text.slice(match.index + match.length, end);

    return (
      (start > 0 ? "…" : "") +
      escapeHtml(before) +
      "<mark>" + escapeHtml(matched) + "</mark>" +
      escapeHtml(after) +
      (end < text.length ? "…" : "")
    );
  }

  // Выбирает, какой текст показать превью-фрагментом: приоритет отдаём полю,
  // где реально нашлось совпадение с запросом (это может быть основной текст
  // раздела, а не только короткое кураторское описание).
  function pickSnippetSource(item, rawQuery) {
    var candidates = [item.text, item.snippet, item.keywords].filter(Boolean);
    for (var i = 0; i < candidates.length; i++) {
      if (findRawMatch(candidates[i], rawQuery)) return candidates[i];
    }
    return candidates[0] || "";
  }

  window.siteSearch = {
    search: search,
    highlight: highlight,
    buildSnippet: buildSnippet,
    normalize: normalize
  };

  function buildResultHref(item) {
    return item.url;
  }

  function renderDropdownResults(dropdown, matches, query) {
    dropdown.innerHTML = "";

    if (!matches.length) {
      var empty = document.createElement("div");
      empty.className = "site-search__empty";
      empty.innerHTML =
        '<p class="site-search__empty-title">Ничего не найдено</p>' +
        '<p class="site-search__empty-hint">Попробуйте изменить запрос или проверьте раскладку</p>';
      dropdown.appendChild(empty);
      return;
    }

    matches.forEach(function (match, i) {
      var item = match.item;
      var a = document.createElement("a");
      a.href = buildResultHref(item);
      a.className = "site-search__result";
      if (i === 0) a.classList.add("is-active");
      var snippetSource = pickSnippetSource(item, query);
      a.innerHTML =
        '<p class="site-search__result-title">' + highlight(item.title, query) + "</p>" +
        (snippetSource ? '<p class="site-search__result-snippet">' + buildSnippet(snippetSource, query) + "</p>" : "") +
        '<p class="site-search__result-page">' + escapeHtml(item.page) + "</p>";
      dropdown.appendChild(a);
    });

    var viewAll = document.createElement("a");
    viewAll.href = "search.html?q=" + encodeURIComponent(query);
    viewAll.className = "site-search__view-all";
    viewAll.textContent = "Смотреть все результаты";
    dropdown.appendChild(viewAll);
  }

  function initWidget(root) {
    var toggle = root.querySelector("[data-search-toggle]");
    var input = root.querySelector("[data-search-input]");
    var clearBtn = root.querySelector("[data-search-clear]");
    var mobileClose = root.querySelector("[data-search-mobile-close]");
    var dropdown = root.querySelector("[data-search-dropdown]");
    var backdrop = root.querySelector("[data-search-backdrop]");

    if (!input || !dropdown) return;

    function closeDropdown() {
      dropdown.hidden = true;
    }

    function openDropdownIfNeeded() {
      var query = input.value.trim();
      if (query.length < 2) {
        closeDropdown();
        return;
      }
      var matches = search(query, 5);
      renderDropdownResults(dropdown, matches, query);
      dropdown.hidden = false;
    }

    function closeMobile() {
      root.classList.remove("is-open");
      closeDropdown();
    }

    input.addEventListener("input", function () {
      clearBtn && clearBtn.classList.toggle("is-visible", input.value.length > 0);
      openDropdownIfNeeded();
    });

    input.addEventListener("focus", openDropdownIfNeeded);

    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeMobile();
        input.blur();
        return;
      }

      if (e.key === "Enter") {
        var active = dropdown.querySelector(".site-search__result.is-active");
        if (active) {
          e.preventDefault();
          window.location.href = active.getAttribute("href");
        } else if (input.value.trim().length >= 2) {
          e.preventDefault();
          window.location.href = "search.html?q=" + encodeURIComponent(input.value.trim());
        }
        return;
      }

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        var results = Array.prototype.slice.call(dropdown.querySelectorAll(".site-search__result"));
        if (!results.length) return;
        e.preventDefault();
        var currentIndex = results.findIndex(function (el) {
          return el.classList.contains("is-active");
        });
        results.forEach(function (el) {
          el.classList.remove("is-active");
        });
        var nextIndex;
        if (e.key === "ArrowDown") {
          nextIndex = currentIndex < results.length - 1 ? currentIndex + 1 : 0;
        } else {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : results.length - 1;
        }
        results[nextIndex].classList.add("is-active");
        results[nextIndex].scrollIntoView({ block: "nearest" });
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        input.value = "";
        clearBtn.classList.remove("is-visible");
        closeDropdown();
        input.focus();
      });
    }

    if (toggle) {
      toggle.addEventListener("click", function () {
        root.classList.add("is-open");
        requestAnimationFrame(function () {
          input.focus();
        });
      });
    }

    if (mobileClose) {
      mobileClose.addEventListener("click", function () {
        input.value = "";
        clearBtn && clearBtn.classList.remove("is-visible");
        closeMobile();
      });
    }

    if (backdrop) {
      backdrop.addEventListener("click", closeMobile);
    }

    dropdown.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        closeDropdown();
        closeMobile();
      }
    });

    document.addEventListener("click", function (e) {
      if (!root.contains(e.target)) {
        closeDropdown();
        if (window.innerWidth <= 768 && !input.value) {
          closeMobile();
        }
      }
    });
  }

  function initResultsPage() {
    var container = document.querySelector("[data-search-results]");
    if (!container) return;

    var input = document.querySelector("[data-search-results-input]");
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();

    if (input) {
      input.value = query;
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          var q = input.value.trim();
          window.location.href = "search.html?q=" + encodeURIComponent(q);
        }
      });
    }

    var form = document.querySelector("[data-search-results-form]");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var q = input ? input.value.trim() : "";
        window.location.href = "search.html?q=" + encodeURIComponent(q);
      });
    }

    var meta = document.querySelector("[data-search-results-meta]");

    if (!query) {
      if (meta) meta.textContent = "Введите запрос, чтобы найти нужный раздел гайда.";
      container.innerHTML = "";
      return;
    }

    var matches = search(query);

    if (meta) {
      meta.textContent = matches.length
        ? "Результатов: " + matches.length + " по запросу «" + query + "»"
        : "По запросу «" + query + "» ничего не найдено";
    }

    if (!matches.length) {
      container.innerHTML =
        '<div class="search-results__empty">' +
        '<p class="search-results__empty-title">Ничего не найдено</p>' +
        '<p class="search-results__empty-hint">Попробуйте другой запрос, проверьте раскладку клавиатуры или опечатки</p>' +
        "</div>";
      return;
    }

    container.innerHTML = "";
    matches.forEach(function (match) {
      var item = match.item;
      var a = document.createElement("a");
      a.href = buildResultHref(item);
      a.className = "search-results__item";
      var snippetSource = pickSnippetSource(item, query);
      a.innerHTML =
        '<p class="search-results__item-title">' + highlight(item.title, query) + "</p>" +
        (snippetSource ? '<p class="search-results__item-snippet">' + buildSnippet(snippetSource, query, 220) + "</p>" : "") +
        '<p class="search-results__item-page">' + escapeHtml(item.page) + "</p>";
      container.appendChild(a);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-site-search]").forEach(initWidget);
    initResultsPage();
  });
})();
