const soundman = {
    sources: {
        bgm: 'assets/audio/bgm.mp3',
        decide: 'assets/audio/decide.mp3',
        click: 'assets/audio/click.mp3',
        hover: 'assets/audio/hover.mp3',
        lose: 'assets/audio/lose.mp3',
        'vo-title': 'assets/audio/vo-title.mp3',
        'vo-intro': 'assets/audio/vo-intro.mp3',
        'vo-exit': 'assets/audio/vo-exit.mp3'
    },

    sounds: {},
    channels: {
        bgm: null,
        sfx: [],
        voice: []
    },

    init() {
        for (let name in this.sources) {
            const audio = new Audio(this.sources[name]);
            audio.preload = 'auto';

            if (name === 'bgm') {
                audio.loop = true;
                this.channels.bgm = audio;
            } else {
                this.sounds[name] = audio;
            }
        }
    },

    play(name, volume = 1.0) {
        if (name === 'bgm') {
            const bgm = this.channels.bgm;
            if (!bgm) return;
            bgm.currentTime = 0;
            bgm.volume = volume;
            bgm.play().catch(err => console.warn('Autoplay BGM gagal:', err));
            return;
        }

        let channelName = 'sfx';
        if (name.startsWith('vo-')) {
            channelName = 'voice';
        }

        const baseSound = this.sounds[name];
        if (!baseSound) return;

        const clone = baseSound.cloneNode();
        clone.volume = volume;
        clone.play().catch(err => console.warn(`Play ${channelName} ${name} gagal:`, err));

        this.channels[channelName].push(clone);

        clone.addEventListener('ended', () => {
            const index = this.channels[channelName].indexOf(clone);
            if (index !== -1) this.channels[channelName].splice(index, 1);
        });
    },

    stop(name) {
        if (name === 'bgm') {
            const bgm = this.channels.bgm;
            if (!bgm) return;
            bgm.pause();
            bgm.currentTime = 0;
            return;
        }

        if (name.startsWith('vo-')) {
            this.stopChannel('voice');
        } else {
            this.stopChannel('sfx');
        }
    },

    setVolume(channelName, volume) {
        if (channelName === 'bgm') {
            const bgm = this.channels.bgm;
            if (!bgm) return;
            bgm.volume = volume;
        } else if (channelName === 'sfx' || channelName === 'voice') {
            this.channels[channelName].forEach(sound => {
                sound.volume = volume;
            });
        }
    },

    toggleMuteBGM() {
        const bgm = this.channels.bgm;
        if (!bgm) return false;
        bgm.muted = !bgm.muted;
        return bgm.muted;
    },

    isBgmMuted() {
        const bgm = this.channels.bgm;
        return bgm?.muted ?? false;
    },

    stopChannel(channelName) {
        if (channelName === 'bgm') {
            this.stop('bgm');
        } else if (channelName === 'sfx' || channelName === 'voice') {
            this.channels[channelName].forEach(sound => {
                if (!sound.paused || !sound.ended) {
                    try {
                        sound.pause();
                        sound.currentTime = 0;
                    } catch (err) {
                        console.warn(`Error stopping ${channelName} sound:`, err);
                    }
                }
            });
    
            this.channels[channelName] = [];
        }
    }
    
};

soundman.isPlaying = function (name) {
    if (name === 'bgm') {
        const bgm = this.channels.bgm;
        return !!(bgm && !bgm.paused && !bgm.ended);
    } else {
        const audio = this.sounds?.[name];
        return !!(audio && !audio.paused && !audio.ended);
    }
};

window.addEventListener('DOMContentLoaded', () => {
    soundman.init();
});