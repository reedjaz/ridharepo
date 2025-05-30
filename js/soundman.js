const soundman = {
    sources: {
        'bgm-menu': 'assets/audio/bgm-menu.mp3',
        'bgm-study': 'assets/audio/bgm-study.mp3',
        'bgm-listen': 'assets/audio/bgm-listen.mp3',
        'bgm-quiz': 'assets/audio/bgm-quiz.mp3',
        'bgm-play': 'assets/audio/bgm-play.mp3',
        'click': 'assets/audio/click.mp3',
        'decide': 'assets/audio/decide.mp3',
        'vo-title': 'assets/audio/vo-title.mp3',
    },

    sounds: {},

    channels: {
        bgm: {},
        sfx: [],
        voice: []
    },

    init() {
        for (let name in this.sources) {
            const audio = new Audio(this.sources[name]);
            audio.preload = 'auto';

            if (name.startsWith('bgm-')) {
                audio.loop = true;
                this.channels.bgm[name] = audio;
            } else {
                this.sounds[name] = audio;
            }
        }
    },

    play(name, volume = 1.0) {
        if (name.startsWith('bgm-')) {
            const bgmAudio = this.channels.bgm[name];
            if (!bgmAudio) return null;
            bgmAudio.currentTime = 0;
            bgmAudio.volume = volume;
            bgmAudio.play().catch(err => console.warn('Autoplay BGM gagal:', err));
            return bgmAudio;
        }

        let channelName = 'sfx';
        if (name.startsWith('vo-')) {
            channelName = 'voice';
        }

        const baseSound = this.sounds[name];
        if (!baseSound) return null;

        const clone = baseSound.cloneNode();
        clone.volume = volume;
        clone.play().catch(err => console.warn(`Play ${channelName} ${name} gagal:`, err));

        this.channels[channelName].push(clone);

        clone.addEventListener('ended', () => {
            const index = this.channels[channelName].indexOf(clone);
            if (index !== -1) this.channels[channelName].splice(index, 1);
        });

        return clone;
    },

    stop(name) {
        if (name.startsWith('bgm-')) {
            const bgmAudio = this.channels.bgm[name];
            if (!bgmAudio) return;
            bgmAudio.pause();
            bgmAudio.currentTime = 0;
            return;
        }

        if (name.startsWith('vo-')) {
            this.stopChannel('voice');
        } else {
            this.stopChannel('sfx');
        }
    },

    setVolume(name, volume) {
        if (name.startsWith('bgm-')) {
            const bgmAudio = this.channels.bgm[name];
            if (!bgmAudio) return;
            bgmAudio.volume = volume;
        } else if (name === 'bgm') {
            // legacy bgm control (optional)
        } else if (name === 'sfx' || name === 'voice') {
            this.channels[name].forEach(sound => {
                sound.volume = volume;
            });
        }
    },

    toggleMuteBgm(name) {
        if (!name.startsWith('bgm-')) return false;
        const bgmAudio = this.channels.bgm[name];
        if (!bgmAudio) return false;
        bgmAudio.muted = !bgmAudio.muted;
        return bgmAudio.muted;
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
    },

    fadeOut(name, duration = 1000) {
        return new Promise((resolve) => {
            if (!name.startsWith('bgm-')) {
                // Kalau bukan BGM, resolve langsung (atau kamu bisa tambahin handler lain)
                resolve();
                return;
            }
            const audio = this.channels.bgm[name];
            if (!audio) {
                resolve();
                return;
            }
    
            const step = 50;
            const stepsCount = duration / step;
            let currentStep = 0;
            const startVol = audio.volume;
    
            const fadeInterval = setInterval(() => {
                currentStep++;
                const newVol = startVol * (1 - currentStep / stepsCount);
                audio.volume = Math.max(newVol, 0);
    
                if (currentStep >= stepsCount) {
                    clearInterval(fadeInterval);
                    audio.pause();
                    audio.currentTime = 0;
                    resolve();
                }
            }, step);
        });
    },      
     
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

soundman.toggleMuteAllBgm = function(mute) {
    Object.values(this.channels.bgm).forEach(audio => {
        audio.muted = mute;
    });
};

window.addEventListener('DOMContentLoaded', () => {
    soundman.init();
});