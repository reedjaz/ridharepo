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
    
    if (isCorrect) {
        window.score = (window.score || 0) + 1;
        console.log(`✅ Benar! Skor sekarang: ${window.score}`);
    } else {
        console.log("❌ Salah. Skor tidak bertambah.");
    }
    
    return isCorrect;

}