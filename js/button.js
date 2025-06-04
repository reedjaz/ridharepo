const sfxHandlers = {
    decide: () => soundman.play('decide'),
    cancel: () => soundman.play('cancel'),
    click: () => soundman.play('click'),
    enter: () => soundman.play('enter'),
    hover: () => soundman.play('hover'),
};

function setupBtnSFX() {
    document.querySelectorAll('.btn-decide').forEach(el => el.addEventListener('click', sfxHandlers.decide));
    document.querySelectorAll('.btn-cancel').forEach(el => el.addEventListener('click', sfxHandlers.cancel));
    document.querySelectorAll('.btn-click').forEach(el => el.addEventListener('click', sfxHandlers.click));
    document.querySelectorAll('.btn-enter').forEach(el => el.addEventListener('click', sfxHandlers.enter));
    // document.querySelectorAll('button').forEach(el => el.addEventListener('mouseenter', sfxHandlers.hover));
}

function detachBtnSFX() {
    document.querySelectorAll('.btn-decide').forEach(el => el.removeEventListener('click', sfxHandlers.decide));
    document.querySelectorAll('.btn-cancel').forEach(el => el.removeEventListener('click', sfxHandlers.cancel));
    document.querySelectorAll('.btn-click').forEach(el => el.removeEventListener('click', sfxHandlers.click));
    document.querySelectorAll('.btn-enter').forEach(el => el.removeEventListener('click', sfxHandlers.enter));
    // // document.querySelectorAll('button').forEach(el => el.removeEventListener('mouseenter', sfxHandlers.hover));
}

function checkAnswer(group, correctAnswers) {

    let userAnswer = window.selectedAnswers?.[group];

    if (!userAnswer) {
        userAnswer = getFinalAnswerText() || '';
    }

    if (!userAnswer) {
        console.log("Belum ada jawaban dipilih.");
        return false;
    }
    
    const correctList = Array.isArray(correctAnswers) ? correctAnswers : [correctAnswers];
    const isCorrect = correctList
    .map(ans => ans.toUpperCase())
    .includes(userAnswer.toUpperCase());

    soundman.play(isCorrect ? "correct" : "wrong");
    
    window.score = window.score || 0;
    window.combo = window.combo || 0;
    
    if (isCorrect) {
        window.score += 1;
        window.combo += 1;
        console.log(`✅ Benar! Skor: ${window.score}, Kombo: ${window.combo}`);
    } else {
        window.combo = 0;
        console.log(`❌ Salah. Skor tetap: ${window.score}, Kombo direset.`);
    }
    
    console.log(`Jawaban Pemain: ${userAnswer}`);
    console.log(`Jawaban Benar: ${correctList}`);

    return isCorrect;
    
}

function makeItCorrect() {
    window.score += 1;
    window.combo += 1;
    console.log(`✅ Benar! Skor: ${window.score}, Kombo: ${window.combo}`);
}

function updateStepIndicator(progress) {
    const indicator = document.getElementById('step-indicator');
    if (!indicator) return;

    const stepEl = indicator.querySelector('#step');
    const stepsEl = indicator.querySelector('#steps');

    if (stepEl) stepEl.textContent = progress.value + 1;
    if (stepsEl) stepsEl.textContent = progress.max + 1;
}

function updatePointIndicator(point) {
    const indicator = document.getElementById('point-indicator');
    if (!indicator) return;

    const pointEl = indicator.querySelector('#point-count');
    if (pointEl) pointEl.textContent = point;
}

function updateProgress(delta, id = 'activity-progress') {
    const progress = document.getElementById(id);
    if (!progress) return;

    progress.value = Math.min(progress.max, Math.max(0, progress.value + delta));
    updateStepIndicator(progress);
    updatePointIndicator(window.score || 0);
    console.log("UPDATE PROGRESS!");
    
}

function progressInit(max, value = 0, id = 'activity-progress') {
    const progress = document.getElementById(id);

    progress.max = max;
    progress.value = Math.min(Math.max(0, value), max);
    updateStepIndicator(progress);
    updatePointIndicator(window.score || 0);

    console.log("PROGRESS BAR INITIALIZED");
    
}

function progressIncrease(id) {
    updateProgress(1, id);
}

function progressDecrease(id) {
    updateProgress(-1, id);
}

function progressGet(id = 'activity-progress') {
    const progress = document.getElementById(id);
    return progress.max;
}