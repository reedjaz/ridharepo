const soundman = {
    sources: {
        'bgm-menu': 'assets/audio/bgm-menu.mp3',
        'bgm-study': 'assets/audio/bgm-study.mp3',
        'bgm-listen': 'assets/audio/bgm-listen.mp3',
        'bgm-quiz': 'assets/audio/bgm-quiz.mp3',
        'bgm-play': 'assets/audio/bgm-play.mp3',
        'click': 'assets/audio/click.mp3',
        'cancel': 'assets/audio/cancel.mp3',
        'decide': 'assets/audio/decide.mp3',
        'enter': 'assets/audio/enter.mp3',
        'correct': 'assets/audio/correct.mp3',
        'hover': 'assets/audio/hover.mp3',
        'wrong': 'assets/audio/wrong.mp3',
        'victory': 'assets/audio/victory.mp3',

        'vo-gantar-despair': 'assets/audio/vo-gantar-despair.mp3',
        'vo-gantar-game1': 'assets/audio/vo-gantar-game1.mp3',
        'vo-gantar-game2a': 'assets/audio/vo-gantar-game2a.mp3',
        'vo-gantar-game2b': 'assets/audio/vo-gantar-game2b.mp3',
        'vo-gantar-game2c': 'assets/audio/vo-gantar-game2c.mp3',
        'vo-gantar-game2d': 'assets/audio/vo-gantar-game2d.mp3',
        'vo-gantar-game-2e': 'assets/audio/vo-gantar-game-2e.mp3',
        'vo-gantar-joy': 'assets/audio/vo-gantar-joy.mp3',
        'vo-gantar-motivate1': 'assets/audio/vo-gantar-motivate1.mp3',
        'vo-gantar-motivate2': 'assets/audio/vo-gantar-motivate2.mp3',
        'vo-gantar-motivate3': 'assets/audio/vo-gantar-motivate3.mp3',
        'vo-gantar-motivate4': 'assets/audio/vo-gantar-motivate4.mp3',
        'vo-gantar-msg1': 'assets/audio/vo-gantar-msg1.mp3',
        'vo-gantar-msg10': 'assets/audio/vo-gantar-msg10.mp3',
        'vo-gantar-msg2': 'assets/audio/vo-gantar-msg2.mp3',
        'vo-gantar-msg3': 'assets/audio/vo-gantar-msg3.mp3',
        'vo-gantar-msg4': 'assets/audio/vo-gantar-msg4.mp3',
        'vo-gantar-msg5': 'assets/audio/vo-gantar-msg5.mp3',
        'vo-gantar-msg6': 'assets/audio/vo-gantar-msg6.mp3',
        'vo-gantar-msg7': 'assets/audio/vo-gantar-msg7.mp3',
        'vo-gantar-msg8': 'assets/audio/vo-gantar-msg8.mp3',
        'vo-gantar-msg9': 'assets/audio/vo-gantar-msg9.mp3',
        'vo-gantar-obtain1': 'assets/audio/vo-gantar-obtain1.mp3',
        'vo-gantar-obtain2': 'assets/audio/vo-gantar-obtain2.mp3',
        'vo-gantar-star1': 'assets/audio/vo-gantar-star1.mp3',
        'vo-gantar-star2': 'assets/audio/vo-gantar-star2.mp3',
        'vo-intro': 'assets/audio/vo-intro.mp3',
        'vo-outro': 'assets/audio/vo-outro.mp3',
        'vo-story-1': 'assets/audio/vo-story-1.mp3',
        'vo-story-10': 'assets/audio/vo-story-10.mp3',
        'vo-story-11': 'assets/audio/vo-story-11.mp3',
        'vo-story-12': 'assets/audio/vo-story-12.mp3',
        'vo-story-2': 'assets/audio/vo-story-2.mp3',
        'vo-story-3': 'assets/audio/vo-story-3.mp3',
        'vo-story-4': 'assets/audio/vo-story-4.mp3',
        'vo-story-5': 'assets/audio/vo-story-5.mp3',
        'vo-story-6': 'assets/audio/vo-story-6.mp3',
        'vo-story-7': 'assets/audio/vo-story-7.mp3',
        'vo-story-8': 'assets/audio/vo-story-8.mp3',
        'vo-story-9': 'assets/audio/vo-story-9.mp3',
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

        console.log(`NAMA SUARA: ${name}`);

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