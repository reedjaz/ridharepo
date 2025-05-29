function startSplashScreenSequence() {
    const scene = document.querySelector(".scene");
    const screens = Array.from(scene.querySelectorAll(".splash-screen"));
    
    if (screens.length < 3) {
        console.error("Splash screen belum lengkap");
        return;
    }
    
    function showScreen(index) {
        if (index > 0) {
            const prev = screens[index - 1];
            prev.classList.remove("show");
    
            // Tunggu sampai transisi selesai, baru tambahkan .hidden
            prev.addEventListener("transitionend", function handler() {
                prev.classList.add("hidden");
                prev.removeEventListener("transitionend", handler);
            });
        }
    
        const current = screens[index];
        current.classList.remove("hidden");
        // Biarkan browser memproses DOM sebelum menambahkan .show untuk transisi
        requestAnimationFrame(() => {
            current.classList.add("show");
        });
    
        if (index < screens.length - 1) {
            setTimeout(() => {
                current.classList.remove("show");
                // .hidden akan ditambahkan setelah transisi selesai di event listener
                setTimeout(() => showScreen(index + 1), 500); // jeda antar splash
            }, 1500); // durasi tampil tiap splash
        }
    }
    
    setTimeout(() => showScreen(0), 50);
}

const scene = document.querySelector(".scene");

fetch('scene/splash.html')
.then(response => {
    if (!response.ok) throw new Error('Gagal load splash.html');
    return response.text();
})
.then(html => {
    scene.innerHTML = html;
    startSplashScreenSequence();
})
.then(() => {
    const stage = document.querySelector('.stage');

    if (stage) {
        stage.classList.remove('showheader', 'showfooter');
        setTimeout(() => {
            stage.classList.add('immersive');
        }, 300);
    }
})
.catch(err => {
    console.error('Error loading splash.html:', err);
});