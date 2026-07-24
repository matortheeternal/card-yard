import esbuild from 'esbuild';
import path from 'path';

export async function bundleScripts() {
    console.log('  Bundling scripts with esbuild');

    await esbuild.build({
        entryPoints: [
            path.join(PATHS.scripts, 'search.js'),
            path.join(PATHS.scripts, 'random.js')
        ],
        bundle: true,
        minify: true,
        sourcemap: true,
        format: 'esm',
        target: ['es2020'],
        outdir: path.join(PATHS.dist, 'scripts'),
        // ensure class names are preserved because sigil-sifter relies on them
        keepNames: true,
    });
}
