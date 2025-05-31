function showFeedbackSheet(isCorrect, title, message, whatToDo) {
    const sheetBuffer = document.getElementById("sheet-buffer");

    const finalTitle = title || (isCorrect ? "Jawaban Benar" : "Jawaban Salah");

    sheetBuffer.innerHTML = `
        <div class="sheet ${isCorrect ? 'sheet-correct' : 'sheet-wrong'}">
            <div class="sheet-content flex row gap-7 justify-between items-center full">
                <div class="flex row gap-9 justify-center items-center">
                    ${isCorrect
                        ? '<div class="feedback-icon"><i data-lucide="check"></i></div>'
                        : '<div class="feedback-icon"><i data-lucide="x"></i></div>'
                    }
                    <div class="flex column gap-3">
                        <h3 class="sheet-title text-size-11 line-height-11 weight-bold">${finalTitle}</h3>
                        ${message
                            ? `<p class="sheet-message text-size-9 line-height-10">${message}</p>`
                            : ''
                        }
                    </div>
                </div>
                <div class="flex row gap-7 justify-end shrink width-auto">
                    <button id="btn-action" class="${isCorrect ? "act-correct" : "act-wrong"} btn-click">
                        Selanjutnya
                    </button>
                </div>
            </div>
        </div>
    `;

    lucide.createIcons();

    setTimeout(() => {
        const sheet = sheetBuffer.querySelector('.sheet');
        sheet.classList.add('show');
    }, 10);

    setTimeout(() => {
        const btn = document.getElementById("btn-action");
        btn?.addEventListener("click", () => {
            closeSheet();
            if (typeof whatToDo === 'function') whatToDo();
        });
    }, 20);
}

function closeSheet() {
    const sheet = document.querySelector('.sheet');
    if (sheet) {
        sheet.classList.remove('show');
        sheet.classList.add('hide');

        setTimeout(() => {
            document.getElementById("sheet-buffer").innerHTML = "";
        }, 300);
    }
}