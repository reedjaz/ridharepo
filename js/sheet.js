function showFeedbackSheet(isCorrect, message) {
    const sheetBuffer = document.getElementById("sheet-buffer");
    
    // Masukkan HTML ke dalam #sheet-buffer
    sheetBuffer.innerHTML = `
        <div class="sheet ${isCorrect ? 'sheet-correct' : 'sheet-wrong'}">
            <div class="sheet-content flex row gap-7 justify-between items-center full">
                <div class="flex row gap-9 justify-center items-center">
                    ${isCorrect ?
                        '<div class="feedback-icon"><i data-lucide="check"></i></div>'
                        : '<div class="feedback-icon"><i data-lucide="x"></i></div>'
                    }
                    <div class="flex column gap-3">
                        <h3 class="sheet-title text-size-11 line-height-11 weight-bold">${isCorrect ? "Jawaban Benar" : "Jawaban Salah"}</h3>
                        <p class="sheet-message text-size-9 line-height-10">${message}</p>
                    </div>
                </div>
                <div class="flex row gap-7 justify-end shrink width-auto">
                    <button id="btn-action" class="${isCorrect ? "act-correct" : "act-wrong"} btn-click" onclick="
                            closeSheet();
                        ">Selanjutnya
                    </button>
                </div>
            </div>
        </div>
    `;

    lucide.createIcons();

    // Trigger animasi setelah render
    setTimeout(() => {
        const sheet = sheetBuffer.querySelector('.sheet');
        sheet.classList.add('show');
    }, 10); // timeout kecil agar CSS transition aktif
}

function closeSheet() {
    const sheet = document.querySelector('.sheet');
    if (sheet) {
        sheet.classList.remove('show');
        sheet.classList.add('hide');

        // Hapus dari DOM setelah animasi selesai
        setTimeout(() => {
            document.getElementById("sheet-buffer").innerHTML = "";
        }, 300); // sesuai dengan durasi transition di CSS
    }
}