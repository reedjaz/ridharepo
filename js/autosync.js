const highlightAnimationMap = new Map();

function kebabToCamel(str) {
    return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function readAloud(nameKebab, play = true) {
    const nameCamel = kebabToCamel(nameKebab);
    const talkEls = document.querySelectorAll('.lt-talk');

    console.log(`Jumlah talkEl ditemukan: ${talkEls.length}`);
    
    setTimeout(() => {
        talkEls.forEach(el => el.classList.remove('hidden'));
    }, 300);

    return fetch(`assets/autosync/${nameKebab}.json`)
        .then(res => {
            if (!res.ok) throw new Error(`Gagal load ${nameKebab}.json`);
            return res.json();
        })
        .then(data => {
            window[nameCamel] = data;

            if (play) {
                return playVOForElement(nameKebab).then(() => {
                    talkEls.forEach(el => el.classList.add('hidden'));
                    return data;
                });
            }

            talkEls.forEach(el => el.classList.add('hidden'));
            return data;
        })
        .catch(err => {
            console.error('Error di readAloud:', err);
            talkEls.forEach(el => el.classList.add('hidden'));
        });
}

function renderTranscriptToElement(el, transcript) {
    const wrapper = el.querySelector('.vo-text-wrap');
    if (!wrapper) {
        console.warn('Elemen .vo-text-wrap tidak ditemukan di dalam', el);
        return;
    }

    wrapper.innerHTML = '';

    transcript.forEach((item, index) => {
        if (item.word === '<br>' || item.word === '<br><br>') {
            const count = item.word === '<br><br>' ? 2 : 1;
            for (let i = 0; i < count; i++) {
                wrapper.appendChild(document.createElement('br'));
            }
        } else {
            const span = document.createElement('span');
            span.innerHTML = item.word;
            if (item.start !== undefined) span.dataset.start = item.start;
            if (item.end !== undefined) span.dataset.end = item.end;
            wrapper.appendChild(span);

            if (index < transcript.length - 1) {
                wrapper.appendChild(document.createTextNode(' '));
            }
        }
    });
}

function highlightTranscriptDuringAudio(audio, el) {
    const words = el.querySelectorAll('span');

    function update() {
        const time = audio.currentTime;
        words.forEach(word => {
            const start = parseFloat(word.dataset.start);
            const end = parseFloat(word.dataset.end);
            word.classList.toggle('highlight', time >= start && time <= end);
        });

        if (!audio.paused && !audio.ended) {
            const id = requestAnimationFrame(update);
            highlightAnimationMap.set(audio, id);
        }
    }

    const id = requestAnimationFrame(update);
    highlightAnimationMap.set(audio, id);
}

function stopHighlighting(audio, el) {
    const animId = highlightAnimationMap.get(audio);
    if (animId) {
        cancelAnimationFrame(animId);
        highlightAnimationMap.delete(audio);
    }

    if (el) {
        const words = el.querySelectorAll('span');
        words.forEach(word => word.classList.remove('highlight'));
    }
}

function stopAllVOHighlight() {
    for (const [audio, animId] of highlightAnimationMap.entries()) {
        cancelAnimationFrame(animId);
        highlightAnimationMap.delete(audio);

        const audioKey = Object.keys(soundman.channels).find(
            key => soundman.channels[key] === audio
        );

        if (audioKey) {
            const el = document.getElementById(audioKey);
            if (el) {
                const words = el.querySelectorAll('span');
                words.forEach(word => word.classList.remove('highlight'));
            }
        }

        audio.pause();
        audio.currentTime = 0;
    }
}

function playVOForElement(nameKebab) {
    return new Promise((resolve, reject) => {
        const id = nameKebab;
        const nameCamel = kebabToCamel(nameKebab);
        const el = document.getElementById(id);
        if (!el) {
            console.warn('Elemen dengan id tidak ditemukan:', id);
            return reject(new Error(`Elemen id '${id}' tidak ditemukan`));
        }

        const transcript = window[nameCamel];
        if (!transcript) {
            console.warn(`Transkrip tidak ditemukan di window['${nameCamel}']`);
            return reject(new Error(`Transkrip '${nameCamel}' tidak ditemukan`));
        }

        renderTranscriptToElement(el, transcript);
        soundman.stopChannel('voice');

        const audio = soundman.play(nameKebab);
        if (!audio) {
            console.warn(`Audio dengan key '${nameKebab}' tidak ditemukan atau gagal diputar.`);
            return reject(new Error(`Audio '${nameKebab}' gagal diputar`));
        }

        audio.currentTime = 0;
        audio.play()
            .then(() => {
                highlightTranscriptDuringAudio(audio, el);
                audio.onended = () => resolve();
            })
            .catch(err => {
                console.warn('Gagal mainkan audio:', err);
                reject(err);
            });
    });
}

function loadAndRenderAllVoTexts() {
    const talkEls = document.querySelectorAll('.lt-talk');
    talkEls.forEach(el => el.classList.add('hidden'));

    const elements = document.querySelectorAll('.vo-text');
    elements.forEach(el => {
        const id = el.id;
        if (!id) return;

        const nameCamel = kebabToCamel(id);

        fetch(`assets/autosync/${id}.json`)
            .then(res => {
                if (!res.ok) throw new Error(`Gagal load ${id}.json`);
                return res.json();
            })
            .then(data => {
                window[nameCamel] = data;
                renderTranscriptToElement(el, data);
            })
            .catch(err => console.error(`Error load/render transcript ${id}:`, err));
    });
}