function openSettings() {
	const popup = document.getElementById('settings-popup');
	const bgmCheckbox = document.getElementById('toggle-bgm-checkbox');
	const fsCheckbox = document.getElementById('toggle-fs-checkbox');
    
    bgmCheckbox.checked = !soundman.channels.bgm.paused;
	fsCheckbox.checked = !!document.fullscreenElement;

	popup.classList.remove('hidden');
	void popup.offsetWidth;
	popup.classList.add('show');
    
    setupToggles();
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
        bgmCheckbox.addEventListener('change', function () {
            if (this.checked) {
                soundman.play('bgm', bgmVol);
            } else {
                soundman.stop('bgm');
            }
        });
    }

    if (fsCheckbox) {
        fsCheckbox.addEventListener('change', function () {
            if (this.checked) {
                goFullscreen();
            } else {
                document.exitFullscreen?.();
            }
        });
    }
}
