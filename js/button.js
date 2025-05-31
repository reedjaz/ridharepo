function replaceAndAttach(selector, event, handler) {
    document.querySelectorAll(selector).forEach(el => {
        const clone = el.cloneNode(true);
        clone.addEventListener(event, handler);
        el.replaceWith(clone);
    });
}

function setupBtnSFX() {
    replaceAndAttach('.btn-decide', 'click', () => soundman.play('decide'));
    replaceAndAttach('.btn-cancel', 'click', () => soundman.play('cancel'));
    replaceAndAttach('.btn-click', 'click', () => soundman.play('click'));
    replaceAndAttach('.btn-enter', 'click', () => soundman.play('enter'));
}

function checkAnswer(group, correctAnswers) {

    const userAnswer = window.selectedAnswers?.[group];
    if (!userAnswer) {
        console.log("Belum ada jawaban dipilih.");
        return false;
    }

    const correctList = Array.isArray(correctAnswers) ? correctAnswers : [correctAnswers];
    const isCorrect = correctList.includes(userAnswer);

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
    
    return isCorrect;

}