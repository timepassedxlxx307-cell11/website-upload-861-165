(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
      menuButton.addEventListener('click', function () {
        mobileMenu.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-hidden-image');
      });
    });

    setupHero();
    setupLocalFilter();
    setupGlobalSearch();
  });

  function setupHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  function setupLocalFilter() {
    var input = document.querySelector('[data-filter-input]');

    if (!input) {
      return;
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();

        card.style.display = haystack.indexOf(query) >= 0 ? '' : 'none';
      });
    });
  }

  function setupGlobalSearch() {
    var form = document.querySelector('[data-global-search-form]');
    var input = document.querySelector('[data-global-search-input]');
    var target = document.querySelector('[data-search-results]');

    if (!form || !input || !target || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;
    renderResults(initialQuery);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var nextUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
      window.history.replaceState({}, '', nextUrl);
      renderResults(query);
    });

    input.addEventListener('input', function () {
      renderResults(input.value.trim());
    });

    function renderResults(query) {
      var normalized = query.toLowerCase();
      var data = window.MOVIE_SEARCH_INDEX;
      var matches = normalized
        ? data.filter(function (item) {
            return item.text.indexOf(normalized) >= 0;
          })
        : data.slice(0, 60);

      if (!matches.length) {
        target.innerHTML = '<div class="empty-state">没有找到匹配的影片</div>';
        return;
      }

      target.innerHTML = '<div class="movie-grid">' + matches.slice(0, 120).map(function (item) {
        return [
          '<article class="movie-card">',
          '<a class="poster-link" href="' + item.url + '">',
          '<span class="poster-bg"></span>',
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
          '<span class="play-pill">播放</span>',
          '</a>',
          '<div class="card-body">',
          '<div class="meta-line"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>',
          '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
          '<p>' + escapeHtml(item.desc) + '</p>',
          '<div class="tag-row"><span>' + escapeHtml(item.genre) + '</span><span>' + escapeHtml(item.category) + '</span></div>',
          '</div>',
          '</article>'
        ].join('');
      }).join('') + '</div>';

      target.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
          image.classList.add('is-hidden-image');
        });
      });
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
