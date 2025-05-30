const scene = document.querySelector(".scene");

function preloadAssetsWithProgress() {
    const imagePaths = [
        'assets/tut-wuri.svg',
        'assets/thinkin.svg'
    ];
    const audioPaths = Object.values(soundman?.sources || {});
    const jsonPaths = [
        'assets/anim/gantar-splash.json'
    ];
    
    const assets = [...imagePaths, ...audioPaths, ...jsonPaths];
    
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
        } else if (src.endsWith('.json')) {
            return fetch(src)
            .then(res => res.json())
            .then(() => updateProgress())
            .catch(() => updateProgress());
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
    const screens = Array.from(document.querySelectorAll(".splash-sequence .splash-screen"));
    
    if (screens.length < 4) {
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
            var waitTime;
            if (index == 0){
                waitTime = 500;
            } else {
                waitTime = 1500;
            }
            setTimeout(() => {
                current.classList.remove("show");
                setTimeout(() => showScreen(index + 1), 500);
            }, waitTime);
        }
    }
    
    showScreen(0);
}

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
.then(() => document.querySelector('.loading-screen')?.classList.add('hidden'))
.then(() => {
    
    startSplashScreenSequence();
    
    document.querySelector('.scene').classList.add('scene-splash');
    
    document.querySelectorAll('#screen2, #screen3').forEach(el => {
        el.addEventListener('click', () => {
            loadSceneTrans('title', 'both', 'zoom-out');
            goFullscreen();
        });
    });
})
.catch(err => {
    console.error('Error loading splash.html:', err);
});
