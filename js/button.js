function replaceAndAttach(selector, event, handler) {
    document.querySelectorAll(selector).forEach(el => {
        const clone = el.cloneNode(true);
        clone.addEventListener(event, handler);
        el.replaceWith(clone);
    });
}

function setupBtnSFX() {
    replaceAndAttach('.btn-decide', 'click', () => soundman.play('decide'));
    replaceAndAttach('.btn-click', 'click', () => soundman.play('click'));
}