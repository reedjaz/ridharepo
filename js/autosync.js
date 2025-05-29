function kebabToCamel(str) {
    return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function readAloud(nameKebab, play = true) {
    const nameCamel = kebabToCamel(nameKebab);
    
    return fetch(`assets/autosync/${nameKebab}.json`)
    .then(res => {
        if (!res.ok) throw new Error(`Gagal load ${nameKebab}.json`);
        return res.json();
    })
    .then(data => {
        window[nameCamel] = data;
        
        if (play) {
            playVOForElement(nameKebab);
        }
        
        return data;
    })
    .catch(err => console.error('Error di readAloud:', err));
}

function renderTranscriptToElement(el, transcript) {
    el.innerHTML = '';
    transcript.forEach((item, index) => {
        const span = document.createElement('span');
        span.textContent = item.word;
        span.dataset.start = item.start;
        span.dataset.end = item.end;
        el.appendChild(span);
        
        if (index < transcript.length - 1) {
            el.appendChild(document.createTextNode(' '));
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
            requestAnimationFrame(update);
        }
    }
    requestAnimationFrame(update);
}

function playVOForElement(nameKebab) {
    const id = nameKebab;
    const nameCamel = kebabToCamel(nameKebab);
    const el = document.getElementById(id);
    if (!el) {
        console.warn('Elemen dengan id tidak ditemukan:', id);
        return;
    }
    
    const transcript = window[nameCamel];
    if (!transcript) {
        console.warn(`Transkrip tidak ditemukan di window['${nameCamel}']`);
        return;
    }
    renderTranscriptToElement(el, transcript);
    
    const audio = soundman.play(nameKebab);
    if (!audio) {
        console.warn(`Audio dengan key '${nameKebab}' tidak ditemukan atau gagal diputar.`);
        return;
    }
    
    audio.currentTime = 0;
    audio.play().then(() => {
        highlightTranscriptDuringAudio(audio, el);
    }).catch(err => console.warn('Gagal mainkan audio:', err));
}

function loadAndRenderAllVoTexts() {
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
