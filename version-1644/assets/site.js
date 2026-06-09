(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeHTML(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function setupMenu() {
        var button = document.querySelector('.nav-toggle');
        var menu = document.querySelector('.mobile-nav');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('.hero-slide', hero);
        var dots = selectAll('.hero-dot', hero);
        var previous = hero.querySelector('.hero-prev');
        var next = hero.querySelector('.hero-next');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function cardTemplate(item) {
        return [
            '<article class="movie-card">',
            '    <a class="movie-poster" href="' + escapeHTML(item.url) + '">',
            '        <img src="' + escapeHTML(item.image) + '" alt="' + escapeHTML(item.title) + '" loading="lazy">',
            '        <span class="badge badge-dark">' + escapeHTML(item.year) + '</span>',
            '    </a>',
            '    <div class="movie-info">',
            '        <div class="movie-tags">',
            '            <a href="' + escapeHTML(item.categoryUrl) + '">' + escapeHTML(item.category) + '</a>',
            '            <span>' + escapeHTML(item.region) + '</span>',
            '        </div>',
            '        <h3><a href="' + escapeHTML(item.url) + '">' + escapeHTML(item.title) + '</a></h3>',
            '        <p>' + escapeHTML(item.oneLine) + '</p>',
            '    </div>',
            '</article>'
        ].join('');
    }

    function setupSearch() {
        var input = document.getElementById('searchInput');
        var results = document.getElementById('searchResults');
        var status = document.getElementById('searchStatus');
        if (!input || !results || !status || !window.SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        input.value = initialQuery;

        function render() {
            var query = input.value.trim().toLowerCase();
            var items = window.SEARCH_INDEX;
            if (query) {
                items = items.filter(function (item) {
                    return item.text.indexOf(query) !== -1;
                });
            } else {
                items = items.slice(0, 60);
            }
            var limited = items.slice(0, 120);
            results.innerHTML = limited.map(cardTemplate).join('');
            if (query) {
                status.textContent = '找到 ' + items.length + ' 部相关影片';
            } else {
                status.textContent = '推荐影片';
            }
        }

        input.addEventListener('input', render);
        render();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupSearch();
    });
}());
