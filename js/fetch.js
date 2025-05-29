// Variabel Global
let isLoadingScene = false;
let voTimeoutId = null;
let bgmVol = 0.25;

// Mapping Kebutuhan VO
const sceneVOMap = {
    'title': { sound: 'vo-title', delay: 1500 },
    'main-menu': { sound: 'vo-main-menu', delay: 1000 },
    'gameover': { sound: 'vo-lose', delay: 1500 }
};

// Fungsi Load Popup
function loadPopup() {
    return fetch('components/popup.html')
        .then(res => {
            if (!res.ok) throw new Error('Gagal memuat popup.html');
            return res.text();
        })
        .then(html => {
            const container = document.querySelector('#popup-buffer');
            if (container) {
                container.innerHTML = html;
            } else {
                console.warn('Elemen #popup-buffer tidak ditemukan di DOM');
            }
        })
        .catch(err => {
            console.error('Error saat loadPopup:', err);
        });
}


// Fungsi Load HTML
function loadHTML(selector, url, options = {}) {
    return fetch(url)
        .then(res => res.text())
        .then(html => {
            const el = document.querySelector(selector);
            el.innerHTML = html;
            
            if (options.name) {
                el.classList.add(`scene-${options.name}`);
            }
            
            document.querySelector(selector).innerHTML = html;
            const stage = document.querySelector('.stage');
            if (stage) {
                stage.classList.remove('showheader', 'showfooter', 'immersive');

                soundman.stopChannel('voice');
                lucide.createIcons();
                applyAmazingTitleEffect();
                setupBtnSFX();
                
                if (typeof options.hideHUD === 'boolean') {
                    options.hideHUD = options.hideHUD ? 'both' : 'none';
                }

                switch (options.hideHUD) {
                    case 'both':
                        stage.classList.add('immersive');
                        break;
                    case 'header':
                        stage.classList.add('showheader');
                        break;
                    case 'footer':
                        stage.classList.add('showfooter');
                        break;
                    case 'none':
                    default:
                        break;
                }
            }

        }
    );
}

// Fungsi Load Scene tanpa transisi
function loadScene(name, hideHUD = 'none') {
    if (isLoadingScene) return;
    isLoadingScene = true;
    
    if (voTimeoutId) {
        clearTimeout(voTimeoutId);
        voTimeoutId = null;
    }

    soundman.stopChannel('voice');
    lucide.createIcons();
    applyAmazingTitleEffect();
    setupBtnSFX();

    const config = sceneVOMap[name];
    if (config) {
        voTimeoutId = setTimeout(() => {
            soundman.play(config.sound);
            voTimeoutId = null;
        }, config.delay);
    }

    return loadHTML('#main .scene', `scene/${name}.html`, { hideHUD, name })
        .finally(() => {
            isLoadingScene = false;
        });
}

// Fungsi Load Scene dengan transisi
function loadSceneTrans(name, hideHUD = 'none', transition = 'fade') {
    if (isLoadingScene) return;
    isLoadingScene = true;

    if (voTimeoutId) {
        clearTimeout(voTimeoutId);
        voTimeoutId = null;
    }

    const main = document.querySelector('#main');
    const oldScene = main.querySelector('.scene');

    if (oldScene) {
        oldScene.classList.remove('scene');
        oldScene.classList.add('scene-prev');
    }

    const newWrapper = document.createElement('div');
    newWrapper.classList.add('scene', `transition-in-${transition}`);

    return fetch(`scene/${name}.html`)
        .then(res => res.text())
        .then(html => {
            newWrapper.innerHTML = html;
            newWrapper.classList.add(`scene-${name}`);
            main.appendChild(newWrapper);

            void newWrapper.offsetWidth;
            newWrapper.classList.remove(`transition-in-${transition}`);

            const prevScene = main.querySelector('.scene-prev');
            if (prevScene) {
                prevScene.classList.add(`transition-out-${transition}`);
                setTimeout(() => {
                    prevScene.remove();
                }, 500);
            }

            soundman.stopChannel('voice');
            lucide.createIcons();
            applyAmazingTitleEffect();
            setupBtnSFX();

            if (typeof hideHUD === 'boolean') {
                hideHUD = hideHUD ? 'both' : 'none';
            }

            const stage = document.querySelector('.stage');
            if (stage) {
                stage.classList.remove('showheader', 'showfooter', 'immersive');
                switch (hideHUD) {
                    case 'both':
                        stage.classList.add('immersive');
                        break;
                    case 'header':
                        stage.classList.add('showheader');
                        break;
                    case 'footer':
                        stage.classList.add('showfooter');
                        break;
                }
            }

            const config = sceneVOMap[name];
            if (config) {
                voTimeoutId = setTimeout(() => {
                    soundman.play(config.sound);
                    voTimeoutId = null;
                }, config.delay);
            }

        })
        .finally(() => {
            isLoadingScene = false;
        });
}

// DOM Ready
window.addEventListener('load', () => {
    firstScene = 'splash';
    
    document.body.addEventListener('touchmove', function (e) {
        if (e.touches.length === 1 && Math.abs(e.touches[0].clientX) < 50) {
            e.preventDefault();
        }
    }, { passive: false });

    const allAssets = [

// ANIMATIONS
'assets/anim/gantar-splash.json',

// SFX
'assets/audio/bgm.mp3',
'assets/audio/click.mp3',
'assets/audio/decide.mp3',
'assets/audio/hover.mp3',

// VO
'assets/audio/vo-title.mp3',

// SPLASH IMAGES
'assets/tut-wuri.svg',
'assets/thinkin.svg',

// IMAGES
'assets/bg-title.jpg',
'assets/ic-1.svg',
'assets/ic-2.svg',
'assets/ic-3.svg',
'assets/ic-4.svg',
'assets/sw-check.svg',
'assets/sw-uncheck.svg',

// FONTS
'css/fonts/funny-bk.ttf',
'css/fonts/funny-bk-it.ttf',
'css/fonts/funny-bd.ttf',
'css/fonts/funny-bd-it.ttf',
'css/fonts/funny-lt.ttf',
'css/fonts/funny-lt-it.ttf',
'css/fonts/funny-md.ttf',
'css/fonts/funny-md-it.ttf',
'css/fonts/funny-rg.ttf',
'css/fonts/funny-rg-it.ttf',
'css/fonts/funny-ul.ttf',
'css/fonts/funny-ul-it.ttf',

    ];
    preloadAssets(allAssets, () => {
        console.log('Load OK');
    });
    
    Promise.all([
        loadHTML('#header', 'components/header/hdr-empty.html'),
        loadHTML('#footer', 'components/footer/ftr-empty.html'),
        loadPopup()
    ]).then(() => {
        const stage = document.querySelector('.stage');
        if (stage) {
            stage.classList.remove('showheader', 'showfooter');
            setTimeout(() => {
                stage.classList.add('immersive');
                stage.classList.remove('init');
                document.body.classList.remove('init');
            }, 300);
        }
    });
});