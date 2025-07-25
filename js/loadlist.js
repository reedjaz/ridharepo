const cssFiles = [
    'anim',
    'autosync',
    'button',
    'colors',
    'elevations',
    'flexbox',
    'grid',
    'gantar',
    'interactive',
    'normalize',
    'opening',
    'popup',
    'sheet',
    'rounded',
    'section',
    'separator',
    'spacings',
    'style',
    'textarea',
    'checkbox',
    'input',
    'radio',
    'switch',
    'transitions',
    'typography',
    'variables',
];

cssFiles.forEach(file => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `css\/${file}.css`;
    document.head.appendChild(link);
});