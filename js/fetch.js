// Fungsi Load HTML
function loadHTML(selector, url, options = {}) {
    return fetch(url)
        .then(res => res.text())
        .then(html => {
            document.querySelector(selector).innerHTML = html;

            const stage = document.querySelector('.stage');
            if (stage) {
                stage.classList.remove('showheader', 'showfooter', 'immersive');

                // Convert boolean to string type if needed
                if (typeof options.hideHUD === 'boolean') {
                    options.hideHUD = options.hideHUD ? 'both' : 'none';
                }

                // Set HUD visibility
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
    return loadHTML('#main .scene', `scene/${name}.html`, { hideHUD });
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
            main.appendChild(newWrapper);

            void newWrapper.offsetWidth;

            newWrapper.classList.remove(`transition-in-${transition}`);
            newWrapper.classList.add('active');

            const prevScene = main.querySelector('.scene-prev');
            if (prevScene) {
                prevScene.classList.add(`transition-out-${transition}`);
                setTimeout(() => {
                    prevScene.remove();
                }, 500);
            }

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
    Promise.all([
        loadHTML('#header', 'components/header.html'),
        loadHTML('#footer', 'components/footer.html')
    ]).then(() => {
        return loadScene('splash', 'both');
    }).then(() => {
        const stage = document.querySelector('.stage');

        if (stage) {
            stage.classList.remove('showheader', 'showfooter');
            setTimeout(() => {
                stage.classList.add('immersive');
                stage.classList.remove('init');
                document.body.classList.remove('init');
            }, 30);
        }
    });
});

// Kamu bisa bikin sistem navigasi di sini juga, misalnya:
// document.getElementById("next-button").onclick = () => {
    //   loadHTML('#main-scene', 'scene/intro.html');
// };