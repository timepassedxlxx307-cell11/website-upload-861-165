(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var video = document.querySelector('[data-player]');
    var button = document.querySelector('[data-play-button]');
    var status = document.querySelector('[data-player-status]');
    var hlsInstance = null;
    var initialized = false;

    if (!video || !button) {
      return;
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message || '';
      }
    }

    function initialize() {
      if (initialized) {
        return true;
      }

      var source = video.getAttribute('data-source');

      if (!source) {
        setStatus('未找到播放源');
        return false;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        initialized = true;
        return true;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放加载异常，请刷新后重试');
          }
        });
        initialized = true;
        return true;
      }

      setStatus('当前浏览器暂不支持 HLS 播放');
      return false;
    }

    function playVideo() {
      if (!initialize()) {
        return;
      }

      button.classList.add('is-hidden');
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          button.classList.remove('is-hidden');
          setStatus('请再次点击播放器开始播放');
        });
      }
    }

    button.addEventListener('click', playVideo);
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
      setStatus('');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        button.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
