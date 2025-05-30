function openSettings() {
    const popup = document.getElementById('settings-popup');
    const bgmCheckbox = document.getElementById('toggle-bgm-checkbox');
    const fsCheckbox = document.getElementById('toggle-fs-checkbox');

    if (bgmCheckbox && soundman.channels.bgm) {
        bgmCheckbox.checked = !soundman.channels.bgm.paused;
    }
    if (fsCheckbox) {
        fsCheckbox.checked = !!document.fullscreenElement;
    }

    popup.classList.remove('hidden');
    void popup.offsetWidth; // Trigger reflow untuk animasi
    popup.classList.add('show');

    setupToggles();  // Pasang event listener, tapi aman dari duplikat
}

function closeSettings() {
    const popup = document.getElementById('settings-popup');
    popup.classList.remove('show');
    popup.addEventListener('transitionend', function handler() {
        popup.classList.add('hidden');
        popup.removeEventListener('transitionend', handler);
    }, { once: true });
}

function openExit() {
    const popup = document.getElementById('exit-popup');
    popup.classList.remove('hidden');
    void popup.offsetWidth;
    popup.classList.add('show');
}

function closeExit() {
    const popup = document.getElementById('exit-popup');
    popup.classList.remove('show');
    popup.addEventListener('transitionend', function handler() {
        popup.classList.add('hidden');
        popup.removeEventListener('transitionend', handler);
    }, { once: true });
}

function setupToggles() {
    const bgmCheckbox = document.getElementById('toggle-bgm-checkbox');
    const fsCheckbox = document.getElementById('toggle-fs-checkbox');

    if (bgmCheckbox) {
        const newBgmCheckbox = bgmCheckbox.cloneNode(true);
        bgmCheckbox.parentNode.replaceChild(newBgmCheckbox, bgmCheckbox);

        newBgmCheckbox.addEventListener('change', function () {
			soundman.toggleMuteAllBgm(!newBgmCheckbox.checked ? true : false);
        });
    }

    if (fsCheckbox) {
        const newFsCheckbox = fsCheckbox.cloneNode(true);
        fsCheckbox.parentNode.replaceChild(newFsCheckbox, fsCheckbox);

        newFsCheckbox.addEventListener('change', function () {
            if (this.checked) {
                goFullscreen();
            } else {
                document.exitFullscreen?.();
            }
        });
    }
}