(function () {
  window.initializeMoviePlayer = function (streamUrl) {
    var shell = document.querySelector("[data-player-shell]");
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var overlay = shell.querySelector("[data-player-overlay]");
    var hls = null;
    var ready = false;

    function requestPlay() {
      if (!video) {
        return;
      }
      var playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {});
      }
    }

    function prepare() {
      if (ready || !video || !streamUrl) {
        return;
      }
      ready = true;
      video.controls = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.load();
        requestPlay();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, requestPlay);
        }
        window.setTimeout(requestPlay, 300);
        return;
      }
      video.src = streamUrl;
      video.load();
      requestPlay();
    }

    function start() {
      prepare();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      requestPlay();
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
    }
    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };
})();
