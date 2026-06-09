(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var dotsWrap = carousel.querySelector('[data-hero-dots]');
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });

      if (dotsWrap) {
        Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === activeIndex);
        });
      }
    }

    function restartTimer() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    if (dotsWrap) {
      slides.forEach(function (_, index) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', '切换到第' + (index + 1) + '屏');
        dot.addEventListener('click', function () {
          showSlide(index);
          restartTimer();
        });
        dotsWrap.appendChild(dot);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(activeIndex - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(activeIndex + 1);
        restartTimer();
      });
    }

    showSlide(0);
    restartTimer();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var emptyState = document.querySelector('[data-filter-empty]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = (card.getAttribute('data-search') || '').toLowerCase();
      var cardYear = card.getAttribute('data-year') || '';
      var matched = (!keyword || haystack.indexOf(keyword) !== -1) && (!year || cardYear === year);
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilters);

    try {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        filterInput.value = q;
        applyFilters();
      }
    } catch (error) {
      applyFilters();
    }
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', applyFilters);
  }

  var player = document.getElementById('moviePlayer');
  var playButton = document.querySelector('[data-play-toggle]');
  var streamReady = false;

  function loadStream() {
    if (!player || streamReady) {
      return;
    }

    var stream = player.getAttribute('data-stream');

    if (!stream) {
      return;
    }

    if (player.canPlayType('application/vnd.apple.mpegurl') || player.canPlayType('application/x-mpegURL')) {
      player.src = stream;
      streamReady = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60
      });
      hls.loadSource(stream);
      hls.attachMedia(player);
      streamReady = true;
      return;
    }

    player.src = stream;
    streamReady = true;
  }

  function playMovie() {
    if (!player) {
      return;
    }

    loadStream();
    var result = player.play();

    if (result && typeof result.catch === 'function') {
      result.catch(function () {});
    }
  }

  if (player) {
    player.addEventListener('click', function () {
      if (player.paused) {
        playMovie();
      }
    });

    player.addEventListener('play', function () {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    });

    player.addEventListener('pause', function () {
      if (playButton) {
        playButton.classList.remove('is-hidden');
      }
    });
  }

  if (playButton) {
    playButton.addEventListener('click', function () {
      playMovie();
    });
  }
})();
