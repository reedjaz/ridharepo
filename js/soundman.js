const soundman = {
    sources: {
        click: 'assets/audio/click.mp3',
        decide: 'assets/audio/decide.mp3',
        win: 'assets/audio/win.mp3',
        lose: 'assets/audio/lose.mp3',
        bgm: 'assets/audio/bgm.mp3'
    },

    sounds: {},

    init() {
        for (let name in this.sources) {
            const audio = new Audio(this.sources[name]);
            audio.preload = 'auto';
            this.sounds[name] = audio;
        }
    },

    play(name, volume = 1.0) {
        const sound = this.sounds[name];
        if (sound) {
            if (name === 'bgm') {
                sound.currentTime = 0;
                sound.volume = volume;
                sound.play();
            } else {
                const clone = sound.cloneNode();
                clone.volume = volume;
                clone.play();
            }
        }
    },

    loop(name, volume = 1.0) {
        const sound = this.sounds[name];
        if (sound) {
            sound.loop = true;
            sound.volume = volume;
            sound.currentTime = 0;
            sound.play();
        }
    },

    stop(name) {
        const sound = this.sounds[name];
        if (sound) {
            sound.pause();
            sound.currentTime = 0;
            sound.loop = false;
        }
    },

    setVolume(name, value) {
        const sound = this.sounds[name];
        if (sound) {
            sound.volume = value;
        }
    },
    
    toggleMuteBGM() {
        const bgm = this.sounds['bgm'];
        if (bgm) {
            bgm.muted = !bgm.muted;
            return bgm.muted;
        }
    },
    
    isBgmMuted() {
        const bgm = this.sounds['bgm'];
        return bgm?.muted ?? false;
    }

};

window.addEventListener('DOMContentLoaded', () => {
    soundman.init();
});

document.getElementById('toggle-bgm').addEventListener('click', function () {
    const isMuted = soundman.toggleMuteBGM();
    this.textContent = isMuted ? '🔇' : '🔊';
});