function setupBtnSFX() {

    document.querySelectorAll('.btn-decide').forEach(btn => {
        btn.replaceWith(btn.cloneNode(true));
    });
    document.querySelectorAll('.btn-decide').forEach(btn => {
        btn.addEventListener('click', () => {
            soundman.play('decide');
        });
    });

    document.querySelectorAll('.btn-click').forEach(btn => {
        btn.replaceWith(btn.cloneNode(true));
    });
    document.querySelectorAll('.btn-click').forEach(btn => {
        btn.addEventListener('click', () => {
            soundman.play('click');
        });
    });
    
}
