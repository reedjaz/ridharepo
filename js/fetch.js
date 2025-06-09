// Variabel Global
let isLoadingScene = false;
let voTimeoutId = null;
let bgmVol = 0.35;
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

    'a1-study/p0': { sound: '[FO=1000]&bgm-menu' },
    'a2-listen/p0': { sound: '[FO=1000]&bgm-menu' },
    'a3-quiz/p0': { sound: '[FO=1000]&bgm-menu' },
    'a4-play/p0': { sound: '[FO=1000]&bgm-menu' },
    
    'a1-study/p1': { sound: '[FO=1000]&bgm-study' },
    'a2-listen/p1': { sound: '[FO=1000]&bgm-listen' },
    'a3-quiz/p1': { sound: '[FO=1000]&bgm-quiz' },
    'a4-play/lobby': { sound: '[FO=1000]&bgm-play' },

    'a2-listen/p10': { sound: '[FO=500]&bgm-menu' },

    'a3-quiz/end': { sound: '[FO=150]' },

    'a4-play/level-1/p1': { sound: '[FO=150]&bgm-play' },
    'a4-play/level-2/p1': { sound: '[FO=150]&bgm-play' },
    'a4-play/level-3/p1': { sound: '[FO=150]&bgm-play' },
    'a4-play/level-4/p1': { sound: '[FO=150]&bgm-play' },

    'a4-play/level-1/end': { sound: '[FO=150]' },
    'a4-play/level-2/end': { sound: '[FO=150]' },
    'a4-play/level-3/end': { sound: '[FO=150]' },
    'a4-play/level-4/end': { sound: '[FO=150]' },
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

function applyInputBlocker(duration = 1800) {
    const inputBlocker = document.createElement('div');
    inputBlocker.style.position = 'fixed';
    inputBlocker.style.top = '0';
    inputBlocker.style.left = '0';
    inputBlocker.style.width = '100vw';
    inputBlocker.style.height = '100vh';
    inputBlocker.style.zIndex = '9999';
    inputBlocker.style.background = 'transparent';
    inputBlocker.style.pointerEvents = 'all';
    inputBlocker.id = 'input-blocker-priority';
    document.body.appendChild(inputBlocker);
    setTimeout(() => {
        const blocker = document.getElementById('input-blocker-priority');
        if (blocker) blocker.remove();
    }, duration);
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
        
        newWrapper.classList.add(`scene-${name.replace(/\//g, '-')}`);
        main.appendChild(newWrapper);
        
        runScripts(newWrapper);
        
        void newWrapper.offsetWidth;
        newWrapper.classList.remove(`transition-in-${transition}`);
        
        const prevScene = document.querySelector('.scene-prev');
        if (prevScene) {
            prevScene.classList.add(`transition-out-${transition}`);
            console.log('Transisi keluar dimulai, prevScene:', prevScene);
            const inputBlocker = document.createElement('div');
            inputBlocker.style.position = 'fixed';
            inputBlocker.style.top = '0';
            inputBlocker.style.left = '0';
            inputBlocker.style.width = '100vw';
            inputBlocker.style.height = '100vh';
            inputBlocker.style.zIndex = '9999';
            inputBlocker.style.background = 'transparent';
            inputBlocker.style.pointerEvents = 'all';
            inputBlocker.id = 'input-blocker';
            document.body.appendChild(inputBlocker);
            setTimeout(() => {
                const prev = document.querySelector('.scene-prev');
                if (prev) {
                    console.log('Timeout selesai, akan remove prevScene');
                    prev.remove();
                    console.log('prevScene dihapus dari DOM');
                } else {
                    console.warn('prevScene sudah tidak ada saat timeout');
                }
                
                const blocker = document.getElementById('input-blocker');
                if (blocker) blocker.remove();
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
        
        'assets/anim/gantar-correct.json',
        'assets/anim/gantar-correct-talk.json',
        'assets/anim/gantar-explain.json',
        'assets/anim/gantar-explain-talk.json',
        'assets/anim/gantar-greet.json',
        'assets/anim/gantar-greet-talk.json',
        'assets/anim/gantar-listen.json',
        'assets/anim/gantar-listen-talk.json',
        'assets/anim/gantar-despair.json',

        'assets/audio/bgm-listen.mp3',
        'assets/audio/bgm-menu.mp3',
        'assets/audio/bgm-play.mp3',
        'assets/audio/bgm-quiz.mp3',
        'assets/audio/bgm-study.mp3',
        'assets/audio/cancel.mp3',
        'assets/audio/click.mp3',
        'assets/audio/correct.mp3',
        'assets/audio/decide.mp3',
        'assets/audio/enter.mp3',
        'assets/audio/error.mp3',
        'assets/audio/fail.mp3',
        'assets/audio/hover.mp3',
        'assets/audio/unlock.mp3',
        'assets/audio/victory.mp3',
        'assets/audio/vo-gantar-despair.mp3',
        'assets/audio/vo-gantar-game1.mp3',
        'assets/audio/vo-gantar-game1a.mp3',
        'assets/audio/vo-gantar-game1b.mp3',
        'assets/audio/vo-gantar-game1c.mp3',
        'assets/audio/vo-gantar-game1d.mp3',
        'assets/audio/vo-gantar-game1e.mp3',
        'assets/audio/vo-gantar-game2a.mp3',
        'assets/audio/vo-gantar-game2b.mp3',
        'assets/audio/vo-gantar-game2c.mp3',
        'assets/audio/vo-gantar-game2d.mp3',
        'assets/audio/vo-gantar-game2e.mp3',
        'assets/audio/vo-gantar-joy.mp3',
        'assets/audio/vo-gantar-motivate1.mp3',
        'assets/audio/vo-gantar-motivate2.mp3',
        'assets/audio/vo-gantar-motivate3.mp3',
        'assets/audio/vo-gantar-motivate4.mp3',
        'assets/audio/vo-gantar-msg1.mp3',
        'assets/audio/vo-gantar-msg2.mp3',
        'assets/audio/vo-gantar-msg3.mp3',
        'assets/audio/vo-gantar-msg4.mp3',
        'assets/audio/vo-gantar-msg5.mp3',
        'assets/audio/vo-gantar-msg6.mp3',
        'assets/audio/vo-gantar-msg7.mp3',
        'assets/audio/vo-gantar-msg8.mp3',
        'assets/audio/vo-gantar-msg9.mp3',
        'assets/audio/vo-gantar-msg10.mp3',
        'assets/audio/vo-gantar-obtain1.mp3',
        'assets/audio/vo-gantar-obtain2.mp3',
        'assets/audio/vo-gantar-star1.mp3',
        'assets/audio/vo-gantar-star2.mp3',
        'assets/audio/vo-intro.mp3',
        'assets/audio/vo-outro.mp3',
        'assets/audio/vo-story-1.mp3',
        'assets/audio/vo-story-2.mp3',
        'assets/audio/vo-story-3.mp3',
        'assets/audio/vo-story-4.mp3',
        'assets/audio/vo-story-5.mp3',
        'assets/audio/vo-story-6.mp3',
        'assets/audio/vo-story-7.mp3',
        'assets/audio/vo-story-8.mp3',
        'assets/audio/vo-story-9.mp3',
        'assets/audio/vo-story-10.mp3',
        'assets/audio/vo-story-11.mp3',
        'assets/audio/vo-story-12.mp3',
        'assets/audio/vo-title.mp3',
        'assets/audio/wrong.mp3',

        'assets/autosync/vo-title.json',
        'assets/autosync/vo-intro.json',
        'assets/autosync/vo-outro.json',
        'assets/autosync/vo-gantar-msg1.json',
        'assets/autosync/vo-gantar-msg2.json',
        'assets/autosync/vo-gantar-msg3.json',
        'assets/autosync/vo-gantar-msg4.json',
        'assets/autosync/vo-gantar-msg5.json',
        'assets/autosync/vo-gantar-msg6.json',
        'assets/autosync/vo-gantar-msg7.json',
        'assets/autosync/vo-gantar-msg8.json',
        'assets/autosync/vo-gantar-msg9.json',
        'assets/autosync/vo-gantar-msg10.json',
        'assets/autosync/vo-story-1.json',
        'assets/autosync/vo-story-2.json',
        'assets/autosync/vo-story-3.json',
        'assets/autosync/vo-story-4.json',
        'assets/autosync/vo-story-5.json',
        'assets/autosync/vo-story-6.json',
        'assets/autosync/vo-story-7.json',
        'assets/autosync/vo-story-8.json',
        'assets/autosync/vo-story-9.json',
        'assets/autosync/vo-story-10.json',
        'assets/autosync/vo-story-11.json',
        'assets/autosync/vo-story-12.json',
        'assets/autosync/vo-gantar-game1.json',

        'assets/act-1.svg',
        'assets/act-2.svg',
        'assets/act-3.svg',
        'assets/act-4.svg',
        'assets/bg-title.jpg',
        'assets/callout.svg',
        'assets/callout-sh.svg',
        'assets/correct.svg',
        'assets/dev1.jpg',
        'assets/dev2.jpg',
        'assets/dev3.jpg',
        'assets/gift-big-minyak.svg',
        'assets/gift-big-pisang.svg',
        'assets/gift-big-telur.svg',
        'assets/gift-big-tepung.svg',
        'assets/gift-minyak.svg',
        'assets/gift-pisang.svg',
        'assets/gift-telur.svg',
        'assets/gift-tepung.svg',
        'assets/ic-1.svg',
        'assets/ic-2.svg',
        'assets/ic-3.svg',
        'assets/ic-4.svg',
        'assets/ico-minyak.svg',
        'assets/ico-pisang.svg',
        'assets/ico-telur.svg',
        'assets/ico-tepung.svg',
        'assets/locked.svg',
        'assets/locked-gray.svg',
        'assets/right.svg',
        'assets/star.svg',
        'assets/star-empty.svg',
        'assets/star-filled.svg',
        'assets/sw-check.svg',
        'assets/sw-uncheck.svg',
        'assets/thinkin.svg',
        'assets/title-act-1.svg',
        'assets/title-act-2.svg',
        'assets/title-act-3.svg',
        'assets/title-act-4.svg',
        'assets/tut-wuri.svg',

        'assets/components/footer/activity-1.html',
        'assets/components/footer/activity-1-a.html',
        'assets/components/footer/activity-1-b.html',
        'assets/components/footer/activity-2.html',
        'assets/components/footer/activity-2-a.html',
        'assets/components/footer/activity-3.html',
        'assets/components/footer/activity-4.html',
        'assets/components/footer/ftr-empty.html',

        'assets/components/header/activity-1.html',
        'assets/components/header/activity-2.html',
        'assets/components/header/activity-3.html',
        'assets/components/header/activity-4.html',
        'assets/components/header/hdr-empty.html',
        'assets/components/header/hdr-progressbar.html',

        'assets/components/popup.html',

        'assets/css/fonts/debug.log',
        'assets/css/fonts/funny-bd.ttf',
        'assets/css/fonts/funny-bd-it.ttf',
        'assets/css/fonts/funny-bk.ttf',
        'assets/css/fonts/funny-bk-it.ttf',
        'assets/css/fonts/funny-lt.ttf',
        'assets/css/fonts/funny-lt-it.ttf',
        'assets/css/fonts/funny-md.ttf',
        'assets/css/fonts/funny-md-it.ttf',
        'assets/css/fonts/funny-rg.ttf',
        'assets/css/fonts/funny-rg-it.ttf',
        'assets/css/fonts/funny-ul.ttf',
        'assets/css/fonts/funny-ul-it.ttf',

        'assets/scene/a1-study/img/ca-dadar-gulung.svg',
        'assets/scene/a1-study/img/ca-kue-lumpur.svg',
        'assets/scene/a1-study/img/ca-putu-ayu.svg',
        'assets/scene/a1-study/load.css',
        'assets/scene/a1-study/load.html',
        'assets/scene/a1-study/p0.html',
        'assets/scene/a1-study/p1.html',
        'assets/scene/a1-study/p2.html',
        'assets/scene/a1-study/p3.html',
        'assets/scene/a1-study/p4.html',
        'assets/scene/a1-study/p5.html',
        'assets/scene/a1-study/p6.html',
        'assets/scene/a1-study/p7.html',
        'assets/scene/a1-study/p8.html',
        'assets/scene/a1-study/p9.html',

        'assets/scene/a2-listen/img/book.png',
        'assets/scene/a2-listen/img/p1.jpg',
        'assets/scene/a2-listen/img/p2.jpg',
        'assets/scene/a2-listen/img/p3.jpg',
        'assets/scene/a2-listen/img/p4.jpg',
        'assets/scene/a2-listen/img/p5.jpg',
        'assets/scene/a2-listen/img/p6.jpg',
        'assets/scene/a2-listen/img/p7.jpg',
        'assets/scene/a2-listen/img/p8.jpg',
        'assets/scene/a2-listen/img/p9.jpg',
        'assets/scene/a2-listen/load.css',
        'assets/scene/a2-listen/load.html',
        'assets/scene/a2-listen/p0.html',
        'assets/scene/a2-listen/p1.html',
        'assets/scene/a2-listen/p2.html',
        'assets/scene/a2-listen/p3.html',
        'assets/scene/a2-listen/p4.html',
        'assets/scene/a2-listen/p5.html',
        'assets/scene/a2-listen/p6.html',
        'assets/scene/a2-listen/p7.html',
        'assets/scene/a2-listen/p8.html',
        'assets/scene/a2-listen/p9.html',
        'assets/scene/a2-listen/p10.html',

        'assets/scene/a3-quiz/img/ca-bingka-pisang.svg',
        'assets/scene/a3-quiz/img/ca-dadar-gulung.svg',
        'assets/scene/a3-quiz/img/ca-jagung.svg',
        'assets/scene/a3-quiz/img/ca-kue-cho.svg',
        'assets/scene/a3-quiz/img/ca-kue-lumpur.svg',
        'assets/scene/a3-quiz/img/ca-minyak-cho.svg',
        'assets/scene/a3-quiz/img/ca-nanas.svg',
        'assets/scene/a3-quiz/img/ca-pisang.svg',
        'assets/scene/a3-quiz/img/ca-pisang-cho.svg',
        'assets/scene/a3-quiz/img/ca-putu-ayu.svg',
        'assets/scene/a3-quiz/img/ch-beru.jpg',
        'assets/scene/a3-quiz/img/ch-kimu.jpg',
        'assets/scene/a3-quiz/img/ch-nara.jpg',
        'assets/scene/a3-quiz/end.html',
        'assets/scene/a3-quiz/load.css',
        'assets/scene/a3-quiz/load.html',
        'assets/scene/a3-quiz/p0.html',
        'assets/scene/a3-quiz/p1.html',
        'assets/scene/a3-quiz/p2.html',
        'assets/scene/a3-quiz/p3.html',
        'assets/scene/a3-quiz/p4.html',
        'assets/scene/a3-quiz/p5.html',
        'assets/scene/a3-quiz/p6.html',

        'assets/scene/a4-play',
        'assets/scene/a4-play/img/bg-intro.jpg',
        'assets/scene/a4-play/img/bg-outro.jpg',
        'assets/scene/a4-play/load.css',
        'assets/scene/a4-play/load.html',
        'assets/scene/a4-play/lobby.html',
        'assets/scene/a4-play/p0.html',

        'assets/scene/a4-play/level-1/img/qst-1.svg',
        'assets/scene/a4-play/level-1/img/qst-2.svg',
        'assets/scene/a4-play/level-1/img/qst-3.svg',
        'assets/scene/a4-play/level-1/img/qst-4.svg',
        'assets/scene/a4-play/level-1/img/qst-5.svg',
        'assets/scene/a4-play/level-1/end.html',
        'assets/scene/a4-play/level-1/load.css',
        'assets/scene/a4-play/level-1/p1.html',
        'assets/scene/a4-play/level-1/p2.html',
        'assets/scene/a4-play/level-1/p3.html',
        'assets/scene/a4-play/level-1/p4.html',
        'assets/scene/a4-play/level-1/p5.html',

        'assets/scene/a4-play/level-2/end.html',
        'assets/scene/a4-play/level-2/load.css',
        'assets/scene/a4-play/level-2/p1.html',
        'assets/scene/a4-play/level-2/p2.html',
        'assets/scene/a4-play/level-2/p3.html',
        'assets/scene/a4-play/level-2/p4.html',
        'assets/scene/a4-play/level-2/p5.html',

        'assets/scene/a4-play/level-3/end.html',
        'assets/scene/a4-play/level-3/load.css',
        'assets/scene/a4-play/level-3/p1.html',
        'assets/scene/a4-play/level-3/p2.html',
        'assets/scene/a4-play/level-3/p3.html',
        'assets/scene/a4-play/level-3/p4.html',
        'assets/scene/a4-play/level-3/p5.html',

        'assets/scene/a4-play/level-4/end.html',
        'assets/scene/a4-play/level-4/load.css',
        'assets/scene/a4-play/level-4/p1.html',
        'assets/scene/a4-play/level-4/p2.html',
        'assets/scene/a4-play/level-4/p3.html',
        'assets/scene/a4-play/level-4/p4.html',
        'assets/scene/a4-play/level-4/p5.html',

        'assets/scene/about.html',
        'assets/scene/halt.html',
        'assets/scene/main-menu.html',
        'assets/scene/splash.html',
        'assets/scene/title.html',

        'favicon.svg',
        'icon.png',
        'index.html',
        'manifest.json',
        'splash.png'
        
    ];
    preloadAssets(allAssets, () => {
        console.log('Load OK');
    });
    
    Promise.all([
        loadHTML('#header', 'components/header/hdr-empty.html'),
        loadHTML('#footer', 'components/footer/ftr-empty.html'),
        loadPopup()
    ]).then(() => {
        
        document.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F11') {
              console.log('F11 pressed!');
              e.preventDefault();
            }
        });
        document.addEventListener('keydown', function (e) {
            if ((e.ctrlKey && e.key === 'r') || // Ctrl+R
                (e.key === 'F5') ||             // F5
                (e.ctrlKey && e.shiftKey && e.key === 'I')) { // Ctrl+Shift+I
              e.preventDefault();
              console.log('Shortcut prevented!');
            }
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'F12') {
              e.preventDefault(); // 🚫 Ini biasanya TIDAK akan berfungsi
              console.log("F12 pressed - trying to prevent...");
            }
        });

        const stage = document.querySelector('.stage');
        if (stage) {
            stage.classList.remove('showheader', 'showfooter');
            stage.classList.add('immersive');
            stage.classList.remove('init');
            document.body.classList.remove('init');
            console.log('BGM loaded:', Object.keys(soundman.channels.bgm));
            Object.entries(soundman.channels.bgm).forEach(([name, entry]) => {
                console.log(`${name}: buffer =`, entry.buffer);
            });
            
        }
    });
});
