const cssFiles = [
    'anim',
    'button',
    'colors',
    'elevations',
    'flexbox',
    'grid',
    'gantar',
    'normalize',
    'opening',
    'popup',
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
    'variables'
];

cssFiles.forEach(file => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `css\/${file}.css`;
    document.head.appendChild(link);
});