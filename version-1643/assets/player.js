import { H as Hls } from './hls-vendor-dru42stk.js';

(function () {
  var configElement = document.getElementById('video-config');
  var video = document.getElementById('movie-video');
  var overlay = document.querySelector('[data-play-overlay]');
  var message = document.querySelector('[data-player-message]');

  if (!configElement || !video || !overlay) {
    return;
  }

  var config = {};

  try {
    config = JSON.parse(configElement.textContent || '{}');
  } catch (error) {
    config = {};
  }

  if (config.poster) {
    video.setAttribute('poster', config.poster);
  }

  var hlsInstance = null;
  var loaded = false;

  function showMessage(text) {
    if (message) {
      message.textContent = text;
      message.classList.add('show');
    }
  }

  function loadVideo() {
    if (!config.src) {
      showMessage('播放暂时不可用，请稍后重试。');
      return Promise.reject(new Error('empty source'));
    }

    if (loaded) {
      return Promise.resolve();
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = config.src;
      return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(config.src);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showMessage('播放暂时不可用，请稍后重试。');
        }
      });
      return Promise.resolve();
    }

    showMessage('播放暂时不可用，请稍后重试。');
    return Promise.reject(new Error('unsupported'));
  }

  function startPlayback() {
    loadVideo()
      .then(function () {
        overlay.classList.add('hidden');
        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            overlay.classList.remove('hidden');
          });
        }
      })
      .catch(function () {});
  }

  overlay.addEventListener('click', startPlayback);

  video.addEventListener('play', function () {
    overlay.classList.add('hidden');
  });

  video.addEventListener('pause', function () {
    if (!video.ended) {
      overlay.classList.remove('hidden');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
})();
