self.addEventListener('fetch', function(event) {
  // Default caching behavior
});

function goFullscreen() {
  const elem = document.documentElement; // bisa diganti ke canvas juga
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { // Safari
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { // IE/Edge lama
    elem.msRequestFullscreen();
  }
}