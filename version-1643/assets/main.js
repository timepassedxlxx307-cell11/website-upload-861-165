(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var previousButton = document.querySelector('[data-hero-prev]');
  var nextButton = document.querySelector('[data-hero-next]');
  var activeIndex = 0;
  var timer = null;

  function setHero(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeIndex);
      dot.setAttribute('aria-current', dotIndex === activeIndex ? 'true' : 'false');
    });
  }

  function startHero() {
    if (timer) {
      window.clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = window.setInterval(function () {
        setHero(activeIndex + 1);
      }, 5000);
    }
  }

  if (slides.length) {
    setHero(0);
    startHero();
  }

  if (previousButton) {
    previousButton.addEventListener('click', function () {
      setHero(activeIndex - 1);
      startHero();
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', function () {
      setHero(activeIndex + 1);
      startHero();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      setHero(index);
      startHero();
    });
  });

  var searchInput = document.querySelector('[data-search-input]');
  var searchButton = document.querySelector('[data-search-button]');
  var searchResults = document.querySelector('[data-search-results]');
  var searchEmpty = document.querySelector('[data-search-empty]');

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderResult(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<article class="movie-card">' +
      '<a class="poster-link" href="' + escapeHtml(movie.url) + '">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '">' +
      '<span class="score-badge">' + escapeHtml(movie.score) + '</span>' +
      '</a>' +
      '<div class="card-body">' +
      '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function runSearch() {
    if (!searchInput || !searchResults || !Array.isArray(window.SITE_MOVIES_INDEX)) {
      return;
    }

    var query = searchInput.value.trim().toLowerCase();

    if (!query) {
      searchResults.innerHTML = '';
      if (searchEmpty) {
        searchEmpty.textContent = '输入片名、地区、年份或题材即可快速检索。';
        searchEmpty.classList.add('show');
      }
      return;
    }

    var terms = query.split(/\s+/).filter(Boolean);
    var matched = window.SITE_MOVIES_INDEX.filter(function (movie) {
      var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, (movie.tags || []).join(' ')]
        .join(' ')
        .toLowerCase();

      return terms.every(function (term) {
        return haystack.indexOf(term) !== -1;
      });
    }).slice(0, 48);

    searchResults.innerHTML = matched.map(renderResult).join('');

    if (searchEmpty) {
      searchEmpty.textContent = matched.length ? '已为你筛选出相关影片。' : '没有找到匹配的影片。';
      searchEmpty.classList.add('show');
    }
  }

  if (searchButton) {
    searchButton.addEventListener('click', runSearch);
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        runSearch();
      }
    });

    searchInput.addEventListener('input', function () {
      if (searchInput.value.trim().length >= 2) {
        runSearch();
      }
    });
  }
})();
