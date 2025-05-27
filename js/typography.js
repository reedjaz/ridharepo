function applyAmazingTitleEffect() {
    document.querySelectorAll('.amazing-title').forEach(el => {
        if (el.dataset.processed === 'true') return;

        const tagName = el.tagName.toLowerCase();
        const shadow = document.createElement(tagName);

        // Salin semua class dari elemen asli
        el.classList.forEach(cls => {
            if (!shadow.classList.contains(cls)) {
                shadow.classList.add(cls);
            }
        });

        // Tambahkan class untuk styling khusus shadow
        shadow.classList.remove('amazing-title');
        shadow.classList.add('amazing-shadow');

        shadow.textContent = el.textContent;

        const fill = el.cloneNode(true); // clone isi dan class lengkap

        const wrapper = document.createElement('div');
        wrapper.className = 'amazing-wrapper';
        wrapper.appendChild(shadow);
        wrapper.appendChild(fill);

        el.replaceWith(wrapper);

        wrapper.querySelector('.amazing-title').dataset.processed = 'true';
    });
}