self.addEventListener('fetch', function(event) {
  // Default caching behavior
});

function goFullscreen() {
  const elem = document.documentElement; // bisa diganti ke canvas juga
  if (elem.requestFullscreen) {
    elem.requestFullscreen({
      navigationUI: "hide"
    });
  } else if (elem.webkitRequestFullscreen) { // Safari
    elem.webkitRequestFullscreen({
      navigationUI: "hide"
    });
  } else if (elem.msRequestFullscreen) { // IE/Edge lama
    elem.msRequestFullscreen({
      navigationUI: "hide"
    });
  }
}
