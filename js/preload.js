function preloadAssets(assets = [], onProgress = () => {}, onComplete = () => {}, timeout = 10000) {
    let loaded = 0;
    const total = assets.length;
    let isCompleteCalled = false;

    const update = () => {
        loaded++;
        if (onProgress) onProgress(loaded, total);

        if (loaded === total && !isCompleteCalled) {
            clearTimeout(fallbackTimeout);
            isCompleteCalled = true;
            if (onComplete) onComplete();
        }
    };

    const fallbackTimeout = setTimeout(() => {
        if (!isCompleteCalled) {
            console.warn("Preload timeout, melanjutkan paksa...");
            isCompleteCalled = true;
            if (onComplete) onComplete();
        }
    }, timeout);

    if (total === 0) {
        clearTimeout(fallbackTimeout);
        onComplete();
        return;
    }

    assets.forEach(asset => {
        const ext = asset.split('.').pop().toLowerCase();

        if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) {
            const img = new Image();
            img.onload = img.onerror = update;
            img.src = asset;

        } else if (['mp3', 'ogg', 'wav'].includes(ext)) {
            const audio = new Audio();
            audio.onloadeddata = audio.onerror = update;
            audio.src = asset;
            audio.load();

        } else if (ext === 'css') {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = asset;
            link.onload = link.onerror = update;
            document.head.appendChild(link);

        } else if (ext === 'js') {
            const script = document.createElement('link');
            script.rel = 'preload';
            script.as = 'script';
            script.href = asset;
            script.onload = script.onerror = update;
            document.head.appendChild(script);

        } else if (ext === 'json') {
            fetch(asset)
                .then(res => {
                    if (!res.ok) throw new Error(`Gagal fetch ${asset}`);
                    return res.json();
                })
                .then(update)
                .catch(err => {
                    console.warn(`Gagal load JSON: ${asset}`, err);
                    update();
                });

        } else {
            update();
        }
    });
}