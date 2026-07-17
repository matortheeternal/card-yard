import fs from 'fs';
import path from 'path';
import { ensureDir } from './helpers.js';

function copyDir(src, dest) {
    ensureDir(dest);
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath  = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

export function copyStaticAssets() {
    console.log('  Copying static assets');
    copyDir(PATHS.styles,    path.join(PATHS.dist, 'styles'));
    copyDir(PATHS.scripts,   path.join(PATHS.dist, 'scripts'));
    copyDir(PATHS.resources, path.join(PATHS.dist, 'resources'));
}