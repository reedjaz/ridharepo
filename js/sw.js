self.addEventListener('fetch', function(event) {
  // Default caching behavior
});

function goFullscreen() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen({
      navigationUI: "hide"
    });
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen({
      navigationUI: "hide"
    });
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen({
      navigationUI: "hide"
    });
  }
  document.body.classList.add("fullscreen");
}
function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
  document.body.classList.remove("fullscreen");
}
function toggleFullscreen() {
  if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
    goFullscreen();
  } else {
    exitFullscreen();
  }
}

function loadAnim({ containerId, path }) {
  const el = document.getElementById(containerId);
  if (!el) return;

  el._anim?.destroy();
  el.innerHTML = '';

  el._anim = lottie.loadAnimation({
      container: el,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path
  });

  return el._anim;
}

function checkAspectRatio() {
  const overlay = document.getElementById('unsupported-overlay');
  const width = window.innerWidth;
  const height = window.innerHeight;
  const ratio = width / height;

  // Rasio-ratio yang tidak didukung
  const unsupportedRatios = [
    { max: 0.9 },            // portrait (<= 0.9)
    { min: 0.9,  max: 1.1 }, // square-ish
    { min: 1.1,  max: 1.24 }, // 5:4 area
    { min: 1.24, max: 1.52 }  // 3:2 & 4:3 area
  ];

  const isUnsupported = unsupportedRatios.some(r => {
    const min = r.min !== undefined ? r.min : -Infinity;
    const max = r.max !== undefined ? r.max : Infinity;
  
    return ratio >= min && ratio <= max;
  });

  if (isUnsupported) {
    overlay.style.display = 'flex';
  } else {
    overlay.style.display = 'none';
  }
}

window.addEventListener('resize', checkAspectRatio);
window.addEventListener('load', checkAspectRatio);