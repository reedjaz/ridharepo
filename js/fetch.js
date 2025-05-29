// Variabel Global
let isLoadingScene = false;
let voTimeoutId = null;
let bgmVol = 0.25;
let currentBGM = null;

// Mapping Kebutuhan VO
const sceneVOMap = {
    'title': { sound: 'vo-titlez', delay: 1500 },
    // 'main-menu': { sound: 'vo-main-menu', delay: 1000 },
    // 'gameover': { sound: 'vo-lose', delay: 1500 },
};

// Mapping Kebutuhan BGM
const sceneBGMMap = {
    'title': { sound: '[FO=1]&bgm-menu' },
    'halt': { sound: '[FO=500]' },
    'a2-listen/p0': { sound: '[FO=1000]&bgm-menu' },
    'a2-study/p1': { sound: '[FO=1000]&bgm-study' },
    'a2-listen/p1': { sound: '[FO=1000]&bgm-listen' },
    'a2-quiz/p1': { sound: '[FO=1000]&bgm-quiz' },
    'a2-play/p1': { sound: '[FO=1000]&bgm-play' },
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

// Fungsi untuk menjalankan script dalam HTML yang sudah di-inject
function runScripts(container) {
    container.querySelectorAll('script').forEach(oldScript => {
        const newScript = document.createElement('script');
        if (oldScript.src) {
            newScript.src = oldScript.src;
            newScript.async = false;
        } else {
            newScript.textContent = oldScript.textContent;
        }
        oldScript.parentNode.replaceChild(newScript, oldScript);
    });
}

// Fungsi Load HTML (dengan eksekusi script)
function loadHTML(selector, url, options = {}) {
    return fetch(url)
    .then(res => res.text())
    .then(html => {
        const el = document.querySelector(selector);
        if (!el) throw new Error(`Elemen ${selector} tidak ditemukan di DOM`);
        
        el.innerHTML = html;
        runScripts(el);
        
        if (options.name) {
            el.classList.add(`scene-${options.name}`);
        }
        
        const stage = document.querySelector('.stage');
        if (stage) {
            stage.classList.remove('showheader', 'showfooter', 'immersive');
            
            soundman.stopChannel('voice');
            lucide.createIcons();
            applyAmazingTitleEffect();
            setupBtnSFX();
            loadAndRenderAllVoTexts();
            
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
    });
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
    
    Object.keys(soundman.channels.bgm).forEach(bgmName => {
        soundman.stop(bgmName);
    });
    
    lucide.createIcons();
    applyAmazingTitleEffect();
    setupBtnSFX();
    loadAndRenderAllVoTexts();
    
    const configVO = sceneVOMap[name];
    if (configVO) {
        voTimeoutId = setTimeout(() => {
            soundman.play(configVO.sound);
            voTimeoutId = null;
        }, configVO.delay);
    }
    
    const configBGM = sceneBGMMap[name];
    if (configBGM) {
        const sound = configBGM.sound;
        
        const fadeAndPlayMatch = sound.match(/^\[FO=(\d+)\](?:&(.+))?$/);
        if (fadeAndPlayMatch) {
            const fadeDuration = parseInt(fadeAndPlayMatch[1], 10);
            const nextBGM = fadeAndPlayMatch[2];
            
            if (nextBGM && !soundman.channels.bgm[nextBGM]?.paused) {
                return;
            }
            
            Promise.all(
                Object.keys(soundman.channels.bgm).map(bgmName =>
                    soundman.fadeOut(bgmName, fadeDuration)
                )
            ).then(() => {
                if (nextBGM) {
                    soundman.play(nextBGM, configBGM.volume ?? bgmVol);
                }
            });
            
        } else if (sound === '[STOP]') {
            Object.keys(soundman.channels.bgm).forEach(bgmName => {
                soundman.stop(bgmName);
            });
            
        } else {
            if (!soundman.channels.bgm[sound]?.paused) {
                return;
            }
            
            soundman.play(sound, configBGM.volume ?? bgmVol);
        }
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
        
        runScripts(newWrapper);
        
        newWrapper.classList.add(`scene-${name.replace(/\//g, '-')}`);
        main.appendChild(newWrapper);
        
        void newWrapper.offsetWidth;
        newWrapper.classList.remove(`transition-in-${transition}`);
        
        const prevScene = document.querySelector('.scene-prev');
        if (prevScene) {
            prevScene.classList.add(`transition-out-${transition}`);
            console.log('Transisi keluar dimulai, prevScene:', prevScene);
            setTimeout(() => {
                const prev = document.querySelector('.scene-prev');
                if (prev) {
                    console.log('Timeout selesai, akan remove prevScene');
                    prev.remove();
                    console.log('prevScene dihapus dari DOM');
                } else {
                    console.warn('prevScene sudah tidak ada saat timeout');
                }
            }, 500);
        }
        
        soundman.stopChannel('voice');
        lucide.createIcons();
        applyAmazingTitleEffect();
        setupBtnSFX();
        loadAndRenderAllVoTexts();
        
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
        
        const configBGM = sceneBGMMap[name];
        if (configBGM) {
            const sound = configBGM.sound;
            
            const fadeAndPlayMatch = sound.match(/^\[FO=(\d+)\](?:&(.+))?$/);
            if (fadeAndPlayMatch) {
                const fadeDuration = parseInt(fadeAndPlayMatch[1], 10);
                const nextBGM = fadeAndPlayMatch[2];
                
                if (nextBGM && !soundman.channels.bgm[nextBGM]?.paused) {
                    return;
                }
                
                Promise.all(
                    Object.keys(soundman.channels.bgm).map(bgmName =>
                        soundman.fadeOut(bgmName, fadeDuration)
                    )
                ).then(() => {
                    if (nextBGM) {
                        soundman.play(nextBGM, configBGM.volume ?? bgmVol);
                    }
                });
                
            } else if (sound === '[STOP]') {
                Object.keys(soundman.channels.bgm).forEach(bgmName => {
                    soundman.stop(bgmName);
                });
                
            } else {
                if (!soundman.channels.bgm[sound]?.paused) {
                    return;
                }
                
                soundman.play(sound, configBGM.volume ?? bgmVol);
            }
        }
        
    })
    .finally(() => {
        isLoadingScene = false;
    });
}

function loadHeader(name = 'hdr-empty') {
    const url = `components/header/${name}.html`;
    return fetch(url)
    .then(res => {
        if (!res.ok) throw new Error(`Gagal load header dari ${url}`);
        return res.text();
    })
    .then(html => {
        const el = document.querySelector('header') || document.querySelector('#header');
        if (el) {
            el.innerHTML = html;
            runScripts(el);
            lucide.createIcons();
            console.log(`Header '${name}' loaded.`);
        } else {
            console.warn('Elemen header tidak ditemukan di DOM');
        }
    })
    .catch(err => console.error('Error loadHeader:', err));
}

function loadFooter(name = 'ftr-empty') {
    const url = `components/footer/${name}.html`;
    return fetch(url)
    .then(res => {
        if (!res.ok) throw new Error(`Gagal load footer dari ${url}`);
        return res.text();
    })
    .then(html => {
        const el = document.querySelector('footer') || document.querySelector('#footer');
        if (el) {
            el.innerHTML = html;
            runScripts(el);
            lucide.createIcons();
            console.log(`Footer '${name}' loaded.`);
        } else {
            console.warn('Elemen footer tidak ditemukan di DOM');
        }
    })
    .catch(err => console.error('Error loadFooter:', err));
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
