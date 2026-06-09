(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-main-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("nav-open", open);
    });
  }

  function setupSearch() {
    var data = window.movieSearchIndex || [];
    selectAll("[data-global-search]").forEach(function (input) {
      var form = input.closest("form");
      var panel = form ? form.querySelector("[data-search-results]") : null;
      var currentResults = [];
      function renderResults(results) {
        currentResults = results;
        if (!panel) {
          return;
        }
        panel.innerHTML = "";
        if (!input.value.trim()) {
          panel.classList.remove("is-visible");
          return;
        }
        if (!results.length) {
          var empty = document.createElement("div");
          empty.className = "search-empty";
          empty.textContent = "暂无匹配影片";
          panel.appendChild(empty);
          panel.classList.add("is-visible");
          return;
        }
        results.forEach(function (item) {
          var link = document.createElement("a");
          link.href = item.url;
          var title = document.createElement("strong");
          title.textContent = item.title;
          var meta = document.createElement("span");
          meta.textContent = item.meta + " · " + item.category;
          link.appendChild(title);
          link.appendChild(meta);
          panel.appendChild(link);
        });
        panel.classList.add("is-visible");
      }
      input.addEventListener("input", function () {
        var keyword = normalize(input.value);
        if (!keyword) {
          renderResults([]);
          return;
        }
        var results = data.filter(function (item) {
          return normalize(item.text).indexOf(keyword) !== -1;
        }).slice(0, 8);
        renderResults(results);
      });
      if (form) {
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          if (currentResults.length) {
            window.location.href = currentResults[0].url;
          }
        });
      }
      document.addEventListener("click", function (event) {
        if (panel && !form.contains(event.target)) {
          panel.classList.remove("is-visible");
        }
      });
    });
  }

  function setupCardFilters() {
    selectAll("[data-card-filter]").forEach(function (input) {
      var scopeSelector = input.getAttribute("data-filter-scope");
      var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
      if (!scope) {
        return;
      }
      var cards = selectAll(".movie-card", scope);
      input.addEventListener("input", function () {
        var keyword = normalize(input.value);
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-searchable"));
          card.style.display = !keyword || text.indexOf(keyword) !== -1 ? "" : "none";
        });
      });
    });
  }

  function setupHero() {
    selectAll("[data-hero-carousel]").forEach(function (carousel) {
      var slides = selectAll("[data-hero-slide]", carousel);
      var dots = selectAll("[data-hero-dot]", carousel);
      var prev = carousel.querySelector("[data-hero-prev]");
      var next = carousel.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;
      if (!slides.length) {
        return;
      }
      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }
      function play() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 6500);
      }
      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }
      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          play();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          play();
        });
      }
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(parseInt(dot.getAttribute("data-hero-dot"), 10));
          play();
        });
      });
      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", play);
      show(0);
      play();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupSearch();
    setupCardFilters();
    setupHero();
  });
})();
