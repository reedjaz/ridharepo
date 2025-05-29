window.voTitle = [
    { word: "Halo", start: 0, end: 0.42 },
    { word: "teman-teman!", start: 0.42, end: 1.42 },
    { word: "Perkenalkan,", start: 1.42, end: 2.38 },
    { word: "aku", start: 2.38, end: 2.81 },
    { word: "Gantar,", start: 2.81, end: 3.48 },
    { word: "si", start: 3.48, end: 3.86 },
    { word: "gajah", start: 3.86, end: 4.29 },
    { word: "pintar!", start: 4.29, end: 5.38 },
    { word: "Hari", start: 5.38, end: 5.66 },
    { word: "ini", start: 5.66, end: 6.46 },
    { word: "kita", start: 6.46, end: 6.74 },
    { word: "akan", start: 6.74, end: 7.07 },
    { word: "menyimak", start: 7.07, end: 7.46 },
    { word: "sebuah", start: 7.46, end: 7.84 },
    { word: "dongeng", start: 7.84, end: 8.13 },
    { word: "seru", start: 8.13, end: 8.57 },
    { word: "berjudul", start: 8.57, end: 9.16 },
    { word: "\"Kue", start: 9.16, end: 9.5 },
    { word: "Kimu\".", start: 9.5, end: 10.45 },
    { word: "Yuk,", start: 10.45, end: 10.91 },
    { word: "belajar", start: 10.91, end: 11.36 },
    { word: "bersamaku!", start: 11.36, end: 12.9 },
  ];

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

function playVOForElement(target) {
    const el = (typeof target === 'string') ? document.querySelector(target) : target;
    if (!el) return console.warn('Elemen tidak ditemukan:', target);

    const audioName = el.dataset.audio;
    const transcriptVarName = el.dataset.transcript;

    const transcript = window[transcriptVarName];
    if (!transcript) return console.warn('Transkrip tidak ditemukan:', transcriptVarName);

    renderTranscriptToElement(el, transcript);

    const audio = soundman.play(audioName);
    if (!audio) return console.warn('Audio tidak ditemukan atau gagal diputar:', audioName);

    audio.currentTime = 0;
    audio.play().then(() => {
        highlightTranscriptDuringAudio(audio, el);
    }).catch(err => console.warn('Gagal mainkan audio:', err));
}