import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchSets } from './fetchSets.js';
import { buildPages } from './buildPages.js';
import { copyStaticAssets } from './copyStaticAssets.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

global.PATHS = {
    yard:      path.join(__dirname, '..', 'yard.json'),
    yardDev:   path.join(__dirname, '..', 'yard.dev.json'),
    templates: path.join(__dirname, '..', 'templates'),
    styles:    path.join(__dirname, '..', 'styles'),
    scripts:   path.join(__dirname, '..', 'scripts'),
    resources: path.join(__dirname, '..', 'resources'),
    dist:      path.join(__dirname, '..', 'dist'),
};

async function loadConfig() {
    let configPath = PATHS.yard;
    if (fs.existsSync(PATHS.yardDev)) {
        console.log('→ Using yard.dev.json');
        configPath = PATHS.yardDev;
    } else if (!fs.existsSync(PATHS.yard)) {
        console.error('❌ yard.json not found.');
        console.error('   Copy yard.example.json to yard.json and fill in your details.');
        process.exit(1);
    }
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

async function build() {
    console.log('🃏 Card Yard build starting...\n');

    console.log('→ Loading configuration');
    const config = await loadConfig();

    console.log('→ Fetching set data');
    const sets = await fetchSets(config);
    console.log(`  ${sets.length} set(s) loaded\n`);

    console.log('→ Building pages');
    await buildPages(config, sets);

    console.log('\n→ Copying static assets');
    copyStaticAssets();

    console.log('\n✅ Build complete → dist/');
}

build().catch(err => {
    console.error('\n❌ Build failed:', err.message);
    process.exit(1);
});
