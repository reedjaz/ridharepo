const cssFiles = [
    'anim',
    'button',
    'colors',
    'elevations',
    'flexbox',
    'grid',
    'normalize',
    'opening',
    'rounded',
    'section',
    'separator',
    'spacings',
    'style',
    'transitions',
    'typography',
    'variables'
];

cssFiles.forEach(file => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `css\/${file}.css`;
    document.head.appendChild(link);
});