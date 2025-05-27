const cssFiles = [
    'button',
    'colors',
    'elevations',
    'flexbox',
    'grid',
    'normalize',
    'rounded',
    'section',
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