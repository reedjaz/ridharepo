function getFinalAnswerText(withSpace = false) {
    const finalAnswer = document.querySelector('.final-answer');
    if (!finalAnswer) return '';
    return Array.from(finalAnswer.children)
        .map(btn => btn.textContent.trim())
        .join(withSpace ? ' ' : '');
}

function disableTransitionTemporarily(el, fn) {
    const originalTransition = el.style.transition;
    el.style.transition = 'none';
    fn();
    requestAnimationFrame(() => {
        el.style.transition = originalTransition || '';
    });
}

function isSameButton(btn1, btn2) {
    const id1 = btn1.getAttribute('data-btn-id');
    const id2 = btn2.getAttribute('data-btn-id');
    if (id1 && id2) {
        return id1 === id2;
    } else {
        return btn1.textContent.trim() === btn2.textContent.trim();
    }
}

function animateShiftInFinalAnswer(finalAnswer, removedBtn = null) {
    const childrenBefore = Array.from(finalAnswer.children);
    const positionsBefore = childrenBefore.map(el => el.getBoundingClientRect());
    
    if (removedBtn && finalAnswer.contains(removedBtn)) {
        finalAnswer.removeChild(removedBtn);
    }
    
    const childrenAfter = Array.from(finalAnswer.children);
    const positionsAfter = childrenAfter.map(el => el.getBoundingClientRect());
    
    childrenAfter.forEach((el, i) => {
        const before = positionsBefore.find((_, j) => childrenBefore[j] === el);
        const after = positionsAfter[i];
        if (!before) return;
        
        const deltaX = before.left - after.left;
        const deltaY = before.top - after.top;
        
        if (deltaX !== 0 || deltaY !== 0) {
            el.style.transition = 'none';
            el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            
            // Trigger reflow
            void el.offsetWidth;
            
            el.style.transition = 'transform var(--transition-medium) ease';
            el.style.transform = '';
        }
    });
    
    childrenAfter.forEach(el => {
        el.addEventListener('transitionend', function cleanup(e) {
            if (e.propertyName === 'transform') {
                el.style.transition = '';
                el.style.transform = '';
                el.removeEventListener('transitionend', cleanup);
            }
        });
    });
}

function animateFlyToPoint(sourceEl, targetX, targetY, onComplete) {
    const sourceRect = sourceEl.getBoundingClientRect();
    
    // Simpan transition asli tombol source
    const originalTransition = sourceEl.style.transition;
    sourceEl.style.transition = 'none'; // matikan transition tombol source selama animasi
    
    const clone = sourceEl.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.left = `${sourceRect.left}px`;
    clone.style.top = `${sourceRect.top}px`;
    clone.style.width = `${sourceRect.width}px`;
    clone.style.height = `${sourceRect.height}px`;
    clone.style.margin = '0';
    clone.style.zIndex = '9999';
    clone.style.transition = 'all 0.3s ease';
    clone.classList.add('flying-clone');
    
    document.body.appendChild(clone);
    
    requestAnimationFrame(() => {
        clone.style.left = `${targetX}px`;
        clone.style.top = `${targetY}px`;
        clone.style.opacity = '1';
        clone.style.transform = 'scale(1)';
    });
    
    setTimeout(() => {
        document.body.removeChild(clone);
        sourceEl.style.transition = originalTransition || ''; // nyalakan lagi transisi tombol source
        onComplete?.();
    }, 300);
    
    applyInputBlocker(300);
}

function animateFlyToTarget(sourceEl, targetEl, onComplete) {
    const sourceRect = sourceEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    
    // Simpan transition asli tombol source
    const originalTransition = sourceEl.style.transition;
    sourceEl.style.transition = 'none'; // matikan transition tombol source selama animasi
    
    const clone = sourceEl.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.left = `${sourceRect.left}px`;
    clone.style.top = `${sourceRect.top}px`;
    clone.style.width = `${sourceRect.width}px`;
    clone.style.height = `${sourceRect.height}px`;
    clone.style.margin = '0';
    clone.style.zIndex = '9999';
    
    clone.style.transition = 'all 0.3s ease';
    clone.style.opacity = '1';
    clone.style.transform = 'scale(1)';
    
    clone.classList.add('flying-clone');
    document.body.appendChild(clone);
    
    requestAnimationFrame(() => {
        clone.style.left = `${targetRect.left}px`;
        clone.style.top = `calc(${targetRect.top}px - var(--unit-3))`;
        clone.style.opacity = '1';
        clone.style.transform = 'scale(1)';
    });
    
    setTimeout(() => {
        document.body.removeChild(clone);
        sourceEl.style.transition = originalTransition || ''; // nyalakan lagi transisi tombol source
        onComplete?.();
    }, 300);

    applyInputBlocker(300);
}

// Hitung jumlah tombol yang "bisa dilepas" (bukan fixed)
function countUsedSlots(finalAnswer) {
    return Array.from(finalAnswer.children).filter(btn => !btn.disabled).length;
}

function initBuildAnswer(options) {
    requestAnimationFrame(() => {
        console.log("--- INITIALIZE BUILD ANSWER ---");
        
        setupBuildAnswerListeners();
        if (typeof options === 'number') {
            options = { maxSlots: options };
        }
        
        const { maxSlots } = options || {};
        
        const finalAnswer = document.querySelector('.final-answer');
        console.log(`finalAnswer: ${finalAnswer.innerHTML}`);
        
        const answerChoices = document.querySelector('.answer-choices');
        console.log(`answerChoices: ${answerChoices.innerHTML}`);
        
        if (!finalAnswer || !answerChoices) return;
        
        const choices = answerChoices.querySelectorAll('button');
        console.log(`choices: ${choices}`);
        
        const fixedTexts = Array.from(finalAnswer.children).map(btn => btn.textContent.trim());
        console.log(`fixedTexts: ${fixedTexts}`);
        
        requestAnimationFrame(() => {
            choices.forEach(choiceBtn => {
                const text = choiceBtn.textContent.trim();
                if (fixedTexts.includes(text)) {
                    choiceBtn.classList.add('taken');
                    choiceBtn.disabled = true;
                }
                
                choiceBtn.onclick = () => {
                    if (choiceBtn.classList.contains('taken')) return;
                    
                    const usedSlots = countUsedSlots(finalAnswer);
                    if (maxSlots !== undefined && usedSlots >= maxSlots) {
                        console.warn(`Max slots (${maxSlots}) sudah penuh!`);
                        return;
                    }
                    
                    const newBtn = choiceBtn.cloneNode(true);
                    newBtn.setAttribute('data-btn-id', choiceBtn.getAttribute('data-btn-id'));
                    newBtn.classList.remove('taken');
                    newBtn.disabled = false;
                    newBtn.classList.add('show');
                    newBtn.classList.add('btn-click');
                    newBtn.style.opacity = '0';  // Sembunyikan dulu tombol baru
                    
                    // Buat ghost untuk posisi target fly dan posisi slide
                    const ghost = newBtn.cloneNode(true);
                    ghost.style.visibility = 'hidden';
                    ghost.style.position = 'relative';
                    finalAnswer.appendChild(ghost);
                    const ghostRect = ghost.getBoundingClientRect();
                    finalAnswer.removeChild(ghost);
                    
                    const childrenBefore = Array.from(finalAnswer.children);
                    const positionsBefore = childrenBefore.map(el => el.getBoundingClientRect());
                    
                    finalAnswer.appendChild(newBtn);

                    const finalText = getFinalAnswerText().trim();
                    btnActionUpdateState(finalText);
                    
                    const childrenAfter = Array.from(finalAnswer.children);
                    const positionsAfter = childrenAfter.map(el => el.getBoundingClientRect());
                    
                    childrenAfter.forEach((el, i) => {
                        const before = positionsBefore.find((_, j) => childrenBefore[j] === el);
                        const after = positionsAfter[i];
                        if (!before) return;
                        
                        const dx = before.left - after.left;
                        const dy = before.top - after.top;
                        
                        if (dx !== 0 || dy !== 0) {
                            el.style.transition = 'none';
                            el.style.transform = `translate(${dx}px, ${dy}px)`;
                            
                            void el.offsetWidth; // trigger reflow
                            
                            el.style.transition = 'transform var(--transition-medium) ease';
                            el.style.transform = '';
                        }
                    });
                    
                    choiceBtn.classList.add('taken');
                    choiceBtn.disabled = true;
                    
                    animateFlyToPoint(choiceBtn, ghostRect.left, ghostRect.top, () => {
                        newBtn.style.transition = 'none';
                        newBtn.style.opacity = '1';
                        
                        console.log('Final Answer:', getFinalAnswerText());
                    });
                    
                    childrenAfter.forEach(el => {
                        el.addEventListener('transitionend', function cleanup(e) {
                            if (e.propertyName === 'transform') {
                                el.style.transition = '';
                                el.style.transform = '';
                                el.removeEventListener('transitionend', cleanup);
                            }
                        });
                    });
                    
                    newBtn.onclick = () => {
                        const targetBtn = Array.from(answerChoices.children).find(
                            btn => isSameButton(btn, newBtn)
                        );
                        if (!targetBtn) return;
                        
                        soundman.play('click');
                        
                        disableTransitionTemporarily(newBtn, () => {
                            animateFlyToTarget(newBtn, targetBtn, () => {
                                disableTransitionTemporarily(newBtn, () => {
                                    newBtn.remove();
                                    targetBtn.classList.remove('taken');
                                    targetBtn.disabled = false;
                                    
                                    const finalText = getFinalAnswerText().trim();
                                    btnActionUpdateState(finalText);
                                    
                                    console.log('Final Answer:', getFinalAnswerText());
                                });
                            });
                        });
                        
                        animateShiftInFinalAnswer(finalAnswer, newBtn);
                    };
                };
            });
        });
        
        Array.from(finalAnswer.children).forEach(btn => {
            btn.classList.add('show');
            btn.setAttribute('disabled', 'true');
            btn.onclick = null;
        });
    });
}

function destroyBuildAnswer() {
    const finalAnswer = document.querySelector('.final-answer');
    finalAnswer.classList.add('final-answer-old');
    finalAnswer.classList.remove('final-answer');
    const answerChoices = document.querySelector('.answer-choices');
    answerChoices.classList.add('answer-choices-old');
    answerChoices.classList.remove('answer-choices');

    window.selectedAnswers = {};

    console.log("--- DESTROYED BUILD ANSWER ---");
}

function destroyAnswerButton() {
    const allButtons = document.querySelectorAll('.btn-answer');
    allButtons.forEach(btn => {
        btn.classList.add('btn-answer-old');
        btn.classList.remove('btn-answer');
        btn.removeAttribute('data-btn-group');
    });
    const btnAction = document.getElementById('btn-action');
    if (btnAction) {
        btnAction.id = 'btn-action-old';
    }

    window.selectedAnswers = {};

    console.log("--- DESTROYED ANSWER BUTTON ---");
}

function populateAnswerLetters(answer, groupName, total = 8, extralegible = false, callback) {
    const container = document.querySelector('.answer-choices');
    if (!container) return;
    
    console.log('Container found:', container);
    
    const extras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const answerLetters = answer.toUpperCase().split('');
    const neededExtras = total - answerLetters.length;
    
    // Ambil huruf random yang belum ada di jawaban
    const remaining = extras.split('').filter(l => !answerLetters.includes(l));
    const randomExtras = [];
    while (randomExtras.length < neededExtras) {
        const randomLetter = remaining[Math.floor(Math.random() * remaining.length)];
        if (!randomExtras.includes(randomLetter)) {
            randomExtras.push(randomLetter);
        }
    }
    
    const combined = [...answerLetters, ...randomExtras];
    
    // Acak susunan huruf
    for (let i = combined.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [combined[i], combined[j]] = [combined[j], combined[i]];
    }
    
    // Kosongkan container
    container.innerHTML = '';
    
    // Buat dan tambahkan button ke container
    combined.forEach((letter, index) => {
        const btn = document.createElement('button');
        btn.className = `btn-answer act-answer medium${extralegible ? ' extralegible' : ''}`;
        btn.setAttribute('data-btn-group', groupName);
        btn.setAttribute('data-btn-id', `${groupName}-${letter}-${index}`); // ID unik
        btn.textContent = letter;
        container.appendChild(btn);
    });

    
    if (typeof callback === 'function') {
        callback();
    }
}

function setupAnswerButtonListeners() {
    requestAnimationFrame(() => {
        console.log("--- SETUP ANSWER BUTTON LISTENERS ---");
        const allButtons = document.querySelectorAll('.btn-answer');
        const btnAction = document.getElementById('btn-action');

        // Ambil semua grup unik dari tombol jawaban
        const groups = new Set();
        allButtons.forEach(button => {
            groups.add(button.dataset.btnGroup);
        });

        allButtons.forEach(button => {
            button.addEventListener('click', () => {
                const group = button.dataset.btnGroup;

                document.querySelectorAll(`.btn-answer[data-btn-group="${group}"]`)
                    .forEach(btn => btn.classList.remove('selected'));

                soundman.play('click');

                button.classList.add('selected');

                const selectedValue = button.textContent.trim();
                console.log(`Selected answer for ${group}: ${selectedValue}`);

                btnActionUpdateState(selectedValue);

                window.selectedAnswers = window.selectedAnswers || {};
                window.selectedAnswers[group] = selectedValue;
                console.log(`Jawban dari AnswerButtonListeners: ${window.selectedAnswers[group]}`);

                let allAnswered = true;
                for (const grp of groups) {
                    if (!window.selectedAnswers[grp]) {
                        allAnswered = false;
                        break;
                    }
                }

                if (allAnswered) {
                    btnAction.classList.remove('disabled');
                } else {
                    btnAction.classList.add('disabled');
                }
            });
        });
    });
}

function setupBuildAnswerListeners() {
    console.log("--- SETUP BUILD ANSWER LISTENERS ---");

    const allButtons = document.querySelectorAll('.answer-choices .btn-answer');
    const btnAction = document.getElementById('btn-action');

    const groups = new Set();
    allButtons.forEach(button => {
        if (button.dataset.btnGroup) {
            groups.add(button.dataset.btnGroup);
        }
    });

    allButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const targetButton = event.currentTarget;
            const group = targetButton.dataset.btnGroup;
            if (!group) return;

            soundman.play('click');

            const finalAnswerButtons = document.querySelectorAll(
                `.final-answer .btn-answer[data-btn-group="${group}"]`
            );

            // ✅ Cek jumlah slot yang terisi (button yang ada di dalam final-answer)
            const filledSlots = Array.from(finalAnswerButtons).filter(btn => btn.textContent.trim() !== "").length;

            // Asumsikan jumlah total slot = jumlah total button di final-answer grup itu
            const maxSlots = finalAnswerButtons.length;

            if (filledSlots >= maxSlots) {
                console.warn("Slot sudah penuh untuk grup:", group);
            
                const finalText = getFinalAnswerText();
                console.log(`Final Answer saat slot penuh (group ${group}):`, finalText);
            
                return;
            }

            const clickedChar = targetButton.textContent.trim();

            // Jangan lanjut kalau huruf sudah dipakai
            const usedChars = Array.from(finalAnswerButtons).map(btn => btn.textContent.trim());
            if (usedChars.includes(clickedChar)) {
                console.warn("Karakter sudah digunakan:", clickedChar);
                return;
            }

            // Hitung jawaban akhir dari semua tombol
            let finalText = usedChars.join('') + clickedChar;

            window.selectedAnswers = window.selectedAnswers || {};
            window.selectedAnswers[group] = finalText.toUpperCase();

            console.log(`Jawaban (${group}): ${window.selectedAnswers[group]}`);

            const allGroupsAnswered = [...groups].every(grp => window.selectedAnswers[grp]);
            btnAction.classList.toggle('disabled', !allGroupsAnswered);
        });
    });
}

function btnActionUpdateState(finalText) {
    const btnAction = document.getElementById('btn-action');
    if (!btnAction) return;

    if (finalText.length > 0) {
        btnAction.classList.remove('disabled');
    } else {
        btnAction.classList.add('disabled');
    }
}