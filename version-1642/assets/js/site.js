(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".mobile-menu-button");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function restartTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      if (slides.length > 1) {
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5000);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")));
        restartTimer();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        restartTimer();
      });
    }

    showSlide(0);
    restartTimer();

    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
    panels.forEach(function (panel) {
      var input = panel.querySelector(".search-input");
      var buttons = Array.prototype.slice.call(panel.querySelectorAll(".filter-button"));
      var scope = panel.parentElement || document;
      var activeFilter = "all";

      function normalize(value) {
        return String(value || "").toLowerCase().trim();
      }

      function applyFilter() {
        var keyword = normalize(input ? input.value : "");
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-item"));

        if (!cards.length) {
          cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-item"));
        }

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-filter-text") || card.textContent);
          var type = card.getAttribute("data-type") || "";
          var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
          var filterMatched = activeFilter === "all" || type.indexOf(activeFilter) !== -1 || text.indexOf(normalize(activeFilter)) !== -1;
          card.classList.toggle("is-filtered-out", !(keywordMatched && filterMatched));
        });
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeFilter = button.getAttribute("data-filter-value") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          applyFilter();
        });
      });
    });
  });
})();
