const scene = document.querySelector(".scene");

function preloadAssetsWithProgress() {
    const imagePaths = [
        'assets/tut-wuri.svg',
        'assets/thinkin.svg'
    ];
    const audioPaths = Object.values(soundman?.sources || {});
    const assets = [...imagePaths, ...audioPaths];
    
    if (assets.length === 0) {
        return Promise.resolve();
    }
    
    const progressEl = document.getElementById('loading-progress');
    if (progressEl) progressEl.max = assets.length;
    
    let loaded = 0;
    const updateProgress = () => {
        loaded++;
        if (progressEl) progressEl.value = loaded;
    };
    
    const promises = assets.map(src => {
        if (src.endsWith('.mp3')) {
            return new Promise(resolve => {
                const audio = new Audio();
                audio.oncanplaythrough = () => { updateProgress(); resolve(); };
                audio.onerror = () => { updateProgress(); resolve(); };
                audio.preload = 'auto';
                audio.src = src;
            });
        } else {
            return new Promise(resolve => {
                const img = new Image();
                img.onload = () => { updateProgress(); resolve(); };
                img.onerror = () => { updateProgress(); resolve(); };
                img.src = src;
            });
        }
    });
    
    return Promise.all(promises);
}

function startSplashScreenSequence() {
    const screens = Array.from(document.querySelectorAll(".splash-screen"));
    
    if (screens.length < 3) {
        console.error("Splash screen belum lengkap");
        return;
    }
    
    function showScreen(index) {
        if (index > 0) {
            const prev = screens[index - 1];
            prev.classList.remove("show");
            prev.addEventListener("transitionend", function handler() {
                prev.classList.add("hidden");
                prev.removeEventListener("transitionend", handler);
            });
        }
        
        const current = screens[index];
        current.classList.remove("hidden");
        requestAnimationFrame(() => {
            current.classList.add("show");
        });
        
        if (index < screens.length - 1) {
            setTimeout(() => {
                current.classList.remove("show");
                setTimeout(() => showScreen(index + 1), 500);
            }, 1500);
        }
    }
    
    // 👇 Splash mulai dari screen pertama
    showScreen(0);
}

// ✅ Eksekusi urut
fetch('scene/splash.html')
.then(response => {
    if (!response.ok) throw new Error('Gagal load splash.html');
    return response.text();
})
.then(html => {
    scene.innerHTML = html;
    return new Promise(resolve => requestAnimationFrame(resolve));
})
.then(() => preloadAssetsWithProgress())
.then(() => {
    // ✅ Setelah preload selesai, sembunyikan loading & mulai splash
    document.querySelector('.loading-screen')?.classList.add('hidden');
    startSplashScreenSequence();
    
    // 👇 Event untuk lanjut dari splash ke scene berikut
    const finalButton = document.querySelector('#screen3 .btn-decide');
    if (finalButton) {
        finalButton.addEventListener('click', () => {
            loadSceneTrans('title', 'both', 'zoom-out');
            goFullscreen();
        });
    }
    
    // Optional: bisa lanjut dari screen 1/2 juga
    document.querySelectorAll('#screen1, #screen2').forEach(el => {
        el.addEventListener('click', () => {
            loadSceneTrans('title', 'both', 'zoom-out');
            goFullscreen();
        });
    });
    
    // Atur tampilan immersive
    const stage = document.querySelector('.stage');
    if (stage) {
        stage.classList.remove('showheader', 'showfooter');
        setTimeout(() => stage.classList.add('immersive'), 300);
    }
})
.catch(err => {
    console.error('Error loading splash.html:', err);
});
