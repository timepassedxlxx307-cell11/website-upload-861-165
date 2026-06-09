function initMoviePlayer(videoId, sourceUrl) {
    var video = document.getElementById(videoId);
    if (!video) {
        return;
    }
    var shell = video.closest('.player-shell');
    var button = shell ? shell.querySelector('.poster-start') : null;
    var ready = false;
    var hls = null;

    function attach() {
        if (ready) {
            return;
        }
        ready = true;
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
        } else {
            video.src = sourceUrl;
        }
    }

    function start() {
        attach();
        if (shell) {
            shell.classList.add('is-playing');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    if (button) {
        button.addEventListener('click', start);
    }

    video.addEventListener('play', function () {
        if (shell) {
            shell.classList.add('is-playing');
        }
    });

    video.addEventListener('error', function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
        ready = false;
    });
}
