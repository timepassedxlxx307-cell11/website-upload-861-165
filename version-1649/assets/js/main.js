(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var opened = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyFilters(scope) {
    var input = scope.querySelector("[data-search-input]");
    var category = scope.querySelector("[data-category-filter]");
    var type = scope.querySelector("[data-type-filter]");
    var year = scope.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
    var empty = scope.querySelector("[data-empty]");
    var query = normalize(input ? input.value : "");
    var categoryValue = normalize(category ? category.value : "");
    var typeValue = normalize(type ? type.value : "");
    var yearValue = normalize(year ? year.value : "");
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute("data-search"));
      var cardCategory = normalize(card.getAttribute("data-category"));
      var cardType = normalize(card.getAttribute("data-type"));
      var cardYear = normalize(card.getAttribute("data-year"));
      var matched = true;

      if (query && text.indexOf(query) === -1) {
        matched = false;
      }
      if (categoryValue && cardCategory !== categoryValue) {
        matched = false;
      }
      if (typeValue && cardType.indexOf(typeValue) === -1) {
        matched = false;
      }
      if (yearValue && cardYear !== yearValue) {
        matched = false;
      }

      card.classList.toggle("is-hidden", !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("show", visible === 0);
    }
  }

  function initFilters() {
    var areas = Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]"));
    areas.forEach(function (area) {
      var controls = Array.prototype.slice.call(area.querySelectorAll("[data-search-input], [data-category-filter], [data-type-filter], [data-year-filter]"));
      controls.forEach(function (control) {
        control.addEventListener("input", function () {
          applyFilters(area);
        });
        control.addEventListener("change", function () {
          applyFilters(area);
        });
      });
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      var input = area.querySelector("[data-search-input]");
      if (query && input) {
        input.value = query;
      }
      applyFilters(area);
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();

function initMoviePlayer(source) {
  var video = document.getElementById("movieVideo");
  var button = document.getElementById("playerButton");
  var connected = false;
  var hls = null;

  if (!video || !source) {
    return;
  }

  function connect() {
    if (connected) {
      return;
    }
    connected = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function start() {
    connect();
    video.controls = true;
    if (button) {
      button.classList.add("is-hidden");
    }
    var action = video.play();
    if (action && typeof action.catch === "function") {
      action.catch(function () {
        if (button && video.paused) {
          button.classList.remove("is-hidden");
        }
      });
    }
  }

  if (button) {
    button.addEventListener("click", start);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener("play", function () {
    if (button) {
      button.classList.add("is-hidden");
    }
  });

  video.addEventListener("ended", function () {
    if (button) {
      button.classList.remove("is-hidden");
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
