function getFinalAnswerText() {
    const finalAnswer = document.querySelector('.final-answer');
    if (!finalAnswer) return '';
    return Array.from(finalAnswer.children)
        .map(btn => btn.textContent.trim())
        .join('');
}

function disableTransitionTemporarily(el, fn) {
    const originalTransition = el.style.transition;
    el.style.transition = 'none';
    fn();
    requestAnimationFrame(() => {
        el.style.transition = originalTransition || '';
    });
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
}

// Hitung jumlah tombol yang "bisa dilepas" (bukan fixed)
function countUsedSlots(finalAnswer) {
    return Array.from(finalAnswer.children).filter(btn => !btn.disabled).length;
}

function initSyllableSplit(options) {
    if (typeof options === 'number') {
        options = { maxSlots: options };
    }

    const { maxSlots } = options || {};

    const finalAnswer = document.querySelector('.final-answer');
    const answerChoices = document.querySelector('.answer-choices');
    if (!finalAnswer || !answerChoices) return;

    const choices = answerChoices.querySelectorAll('button');
    const fixedTexts = Array.from(finalAnswer.children).map(btn => btn.textContent.trim());

    choices.forEach(choiceBtn => {
        const text = choiceBtn.textContent.trim();
        if (fixedTexts.includes(text)) {
            choiceBtn.classList.add('taken');
            choiceBtn.disabled = true;
        }

        choiceBtn.onclick = () => {
            if (choiceBtn.classList.contains('taken')) return;

            // Cek jumlah tombol yang sudah terpakai (non-disabled)
            const usedSlots = countUsedSlots(finalAnswer);
            if (maxSlots !== undefined && usedSlots >= maxSlots) {
                console.warn(`Max slots (${maxSlots}) sudah penuh!`);
                return;
            }

            const newBtn = choiceBtn.cloneNode(true);
            newBtn.classList.remove('taken');
            newBtn.disabled = false;
            newBtn.classList.add('show');
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
                    btn => btn.textContent.trim() === newBtn.textContent.trim()
                );
                if (!targetBtn) return;

                disableTransitionTemporarily(newBtn, () => {
                    animateFlyToTarget(newBtn, targetBtn, () => {
                        disableTransitionTemporarily(newBtn, () => {
                            newBtn.remove();
                            targetBtn.classList.remove('taken');
                            targetBtn.disabled = false;
                            
                            console.log('Final Answer:', getFinalAnswerText());
                        });
                    });
                });

                animateShiftInFinalAnswer(finalAnswer, newBtn);
            };
        };
    });

    Array.from(finalAnswer.children).forEach(btn => {
        btn.classList.add('show');
        btn.setAttribute('disabled', 'true');
        btn.onclick = null;
    });
}