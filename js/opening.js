function startSplashScreenSequence() {
    const scene = document.querySelector(".scene");
    const screens = Array.from(scene.querySelectorAll(".splash-screen"));
    
    if (screens.length < 3) {
        console.error("Splash screen belum lengkap");
        return;
    }
    
    function showScreen(index) {
        if (index > 0) screens[index - 1].classList.remove("show");
        screens[index].classList.add("show");
        
        if (index < screens.length - 1) {
            setTimeout(() => {
                screens[index].classList.remove("show");
                setTimeout(() => showScreen(index + 1), 500);
            }, 1500);
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