#!/usr/bin/env node
import esbuild from 'esbuild';
import fs from 'fs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

try {
    await esbuild.build({
        entryPoints: ['src/config.ts'],
        outdir: 'tmp',
    });

    let html = await readFile('build/index.html', { encoding: 'utf-8' });

    const { BROWSER_WINDOW_ENV_KEY, mkConfig, Flag } = await import('../tmp/config.js');

    const clientConf = mkConfig(Flag.Client);

    html = html.replace(
        '%HEAD%',
        /* HTML */
        `<script>
            window['${BROWSER_WINDOW_ENV_KEY}'] = ${JSON.stringify(clientConf)};
        </script>`
    );

    await writeFile('build/index.html', html, 'utf-8');
} catch (ex) {
    console.error(ex);
    process.exit(1);
}
