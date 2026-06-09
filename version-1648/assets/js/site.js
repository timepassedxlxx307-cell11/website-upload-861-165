(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function setupNavigation() {
    var toggle = document.querySelector('.nav-toggle');
    var links = document.getElementById('navLinks');
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener('click', function () {
      var opened = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function setupHeroSlider() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length || !dots.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = nextIndex % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }
    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        schedule();
      });
    });
    show(0);
    schedule();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function filterCards(input, scope) {
    var query = normalize(input.value);
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-title]'));
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-keywords'));
      var matched = !query || haystack.indexOf(query) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });
    var empty = scope.querySelector('[data-empty-state]');
    if (empty) {
      empty.classList.toggle('visible', visible === 0);
    }
  }

  function setupFilters() {
    Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]')).forEach(function (input) {
      var scope = input.closest('[data-filter-scope]') || document;
      input.addEventListener('input', function () {
        filterCards(input, scope);
      });
      filterCards(input, scope);
    });
  }

  function setupSearchPage() {
    var input = document.querySelector('[data-search-input]');
    if (!input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var value = params.get('q') || '';
    input.value = value;
    var scope = input.closest('[data-filter-scope]') || document;
    filterCards(input, scope);
  }

  window.initializePlayer = function (sourceUrl, videoId, overlayId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !sourceUrl) {
      return;
    }
    var attached = false;
    var player = null;
    function attach() {
      if (attached) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        player = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        player.loadSource(sourceUrl);
        player.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
      attached = true;
    }
    function start() {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }
    if (overlay) {
      overlay.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    video.addEventListener('pause', function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove('is-hidden');
      }
    });
    window.addEventListener('pagehide', function () {
      if (player && typeof player.destroy === 'function') {
        player.destroy();
      }
    });
  };

  ready(function () {
    setupNavigation();
    setupHeroSlider();
    setupFilters();
    setupSearchPage();
  });
})();
