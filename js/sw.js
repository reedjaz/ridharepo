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
