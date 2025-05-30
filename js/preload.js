function preloadAssets(assets = [], onComplete = () => {}) {
    let loaded = 0;

    const checkDone = () => {
        loaded++;
        if (loaded === assets.length) onComplete();
    };

    assets.forEach(asset => {
        const ext = asset.split('.').pop().toLowerCase();

        if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) {
            const img = new Image();
            img.onload = img.onerror = checkDone;
            img.src = asset;

        } else if (['mp3', 'ogg', 'wav'].includes(ext)) {
            const audio = new Audio();
            audio.onloadeddata = checkDone;
            audio.onerror = checkDone;
            audio.src = asset;
            audio.load();

        } else if (['css'].includes(ext)) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = asset;
            link.onload = link.onerror = checkDone;
            document.head.appendChild(link);

        } else if (['js'].includes(ext)) {
            const script = document.createElement('link');
            script.rel = 'preload';
            script.as = 'script';
            script.href = asset;
            script.onload = script.onerror = checkDone;
            document.head.appendChild(script);

        } else {
            fetch(asset).then(checkDone).catch(checkDone);
        }
    });

    if (assets.length === 0) onComplete();
}