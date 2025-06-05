function openPopup(id, onOpen) {
    const popup = document.getElementById(id);
    if (!popup) return;

    // Overlay click behavior
    const overlay = popup.querySelector('.popup-overlay');
    if (overlay) {
        overlay.onclick = null;
        const shouldClose = popup.dataset.closeOverlay !== "false";
        if (shouldClose) {
            overlay.onclick = () => closePopup(id);
        }
    }

    // Jalankan kode tambahan (khusus settings, dll)
    if (typeof onOpen === 'function') onOpen();

    popup.classList.remove('hidden');
    void popup.offsetWidth;
    popup.classList.add('show');
}

function closePopup(id) {
    const popup = document.getElementById(id);
    if (!popup) return;

    popup.classList.remove('show');
    popup.addEventListener('transitionend', function handler() {
        popup.classList.add('hidden');
        popup.removeEventListener('transitionend', handler);
    }, { once: true });
}

// === Custom Logic untuk masing-masing popup ===

function openSettings() {
    openPopup('settings-popup', () => {
        const bgmCheckbox = document.getElementById('toggle-bgm-checkbox');
        const fsCheckbox = document.getElementById('toggle-fs-checkbox');

        if (bgmCheckbox && soundman.channels.bgm) {
            bgmCheckbox.checked = !soundman.channels.bgm.paused;
        }
        if (fsCheckbox) {
            fsCheckbox.checked = !!document.fullscreenElement;
        }

        setupToggles();
    });
}

function closeSettings() {
    closePopup('settings-popup');
}

function openOther() {
    openPopup('other-popup');
}
function closeOther() {
    closePopup('other-popup');
}

function openExit() {
    openPopup('exit-popup');
}
function closeExit() {
    closePopup('exit-popup');
}

function openConfirmReset() {
    openPopup('confirmreset-popup');
}
function closeConfirmReset() {
    closePopup('confirmreset-popup');
}

function openBackHome() {
    openPopup('backhome-popup');
}
function closeBackHome() {
    closePopup('backhome-popup');
}

function openIntro() {
    applyInputBlocker(1250);
    openPopup('intro-popup');
    setTimeout(() => {
        readAloud('vo-intro');
    }, 450);
}
function closeIntro() {
    closePopup('intro-popup');
    stopAllVOHighlight();
}

function openOutro() {
    applyInputBlocker(3250);
    openPopup('outro-popup');
    setTimeout(() => {
        readAloud('vo-outro');
    }, 1500);
}
function closeOutro() {
    closePopup('outro-popup');
    stopAllVOHighlight();
}

// === Checkbox Setup Logic ===

function setupToggles() {
    const bgmCheckbox = document.getElementById('toggle-bgm-checkbox');
    const fsCheckbox = document.getElementById('toggle-fs-checkbox');

    if (bgmCheckbox) {
        const newBgmCheckbox = bgmCheckbox.cloneNode(true);
        bgmCheckbox.parentNode.replaceChild(newBgmCheckbox, bgmCheckbox);

        newBgmCheckbox.addEventListener('change', function () {
            soundman.toggleMuteAllBgm(!newBgmCheckbox.checked);
        });
    }

    if (fsCheckbox) {
        const newFsCheckbox = fsCheckbox.cloneNode(true);
        fsCheckbox.parentNode.replaceChild(newFsCheckbox, fsCheckbox);

        newFsCheckbox.addEventListener('change', function () {
            if (this.checked) {
                goFullscreen();
            } else {
                exitFullscreen();
            }
        });
    }
}