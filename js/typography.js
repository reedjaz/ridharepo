function applyAmazingTitleEffect() {
    document.querySelectorAll('.amazing-title').forEach(el => {
        if (el.dataset.processed === 'true') return;

        const tagName = el.tagName.toLowerCase();

        const under = document.createElement(tagName);
        el.classList.forEach(cls => {
            if (!under.classList.contains(cls)) {
                under.classList.add(cls);
            }
        });
        under.classList.remove('amazing-title');
        under.classList.add('amazing-under');
        under.textContent = el.textContent;

        const shadow = document.createElement(tagName);
        el.classList.forEach(cls => {
            if (!shadow.classList.contains(cls)) {
                shadow.classList.add(cls);
            }
        });
        shadow.classList.remove('amazing-title');
        shadow.classList.add('amazing-shadow');
        shadow.textContent = el.textContent;

        const fill = el.cloneNode(true);

        const wrapper = document.createElement('div');
        wrapper.className = 'amazing-wrapper';
        wrapper.appendChild(under);
        wrapper.appendChild(shadow);
        wrapper.appendChild(fill);

        el.replaceWith(wrapper);

        wrapper.querySelector('.amazing-title').dataset.processed = 'true';
    });
}
