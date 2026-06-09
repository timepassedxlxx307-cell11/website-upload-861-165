(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  document.querySelectorAll('img[data-img]').forEach(function (img) {
    img.addEventListener('error', function () {
      img.classList.add('image-hidden');
    });
  });

  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var prev = carousel.querySelector('.hero-arrow.prev');
    var next = carousel.querySelector('.hero-arrow.next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    show(0);
    start();
  });

  document.querySelectorAll('.page-filter').forEach(function (input) {
    var list = document.querySelector('.filter-list');
    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-search]'));
    var empty = document.createElement('div');
    empty.className = 'empty-result';
    empty.textContent = '没有找到匹配的影片';
    list.appendChild(empty);

    function apply(value) {
      var query = String(value || '').trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var matched = !query || text.indexOf(query) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      empty.style.display = visible ? 'none' : 'block';
    }

    input.addEventListener('input', function () {
      apply(input.value);
    });

    var params = new URLSearchParams(window.location.search);
    var keyword = params.get('q');
    if (keyword) {
      input.value = keyword;
      apply(keyword);
    }
  });

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('.player-video');
    var cover = player.querySelector('.player-cover');
    var source = player.getAttribute('data-stream');
    var hlsInstance = null;
    var ready = false;

    function start() {
      if (!video || !source) {
        return;
      }

      if (!ready) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
        ready = true;
      }

      if (cover) {
        cover.classList.add('hidden');
      }

      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!ready || video.paused) {
          start();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  });
})();
