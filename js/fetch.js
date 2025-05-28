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

                applyAmazingTitleEffect();
                
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
    applyAmazingTitleEffect();
    setupBtnSFX();
    return loadHTML('#main .scene', `scene/${name}.html`, { hideHUD, name });
}

// Fungsi Load Scene dengan transisi
function loadSceneTrans(name, hideHUD = 'none', transition = 'fade') {
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
                    case 'none':
                    default:
                        break;
                }
            }
        });
}

// DOM Ready
window.addEventListener('load', () => {
    firstScene = 'splash';
    Promise.all([
        loadHTML('#header', 'components/header.html'),
        loadHTML('#footer', 'components/footer.html')
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