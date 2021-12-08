#!/usr/bin/env node
import fs from 'fs';
import { promisify } from 'util';
import esbuild from 'esbuild';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const doInline = !!process.env.INLINE;

const inline = async () => {
    let html = await readFile('build/index.html', { encoding: 'utf-8' });

    if (doInline) {
        const js = await readFile('build/run-app.js', { encoding: 'utf-8' });
        const css = await readFile('build/run-app.css', { encoding: 'utf-8' });

        html = replaceMany(
            {
                '%CSS%': `<style>${css}</style>`,
                '%APP%': `<script type="module">${js}</script>`,
            },
            html
        );
    } else {
        html = replaceMany(
            {
                '%CSS%': '<link rel="stylesheet" href="/run-app.css" />',
                '%APP%': '<script type="module" src="/run-app.js"></script>',
            },
            html
        );
    }

    html = await inlineConfig(html);

    await writeFile('build/index.html', html, 'utf-8');
};

const inlineConfig = async (html) => {
    await esbuild.build({
        entryPoints: ['src/config.ts'],
        outdir: 'tmp',
    });

    const { BROWSER_WINDOW_ENV_KEY, mkConfig, Flag } = await import('../tmp/config.js');

    const clientConf = mkConfig(Flag.Client);

    return html.replace(
        '%HEAD%',
        /* HTML */
        `<script>
            window['${BROWSER_WINDOW_ENV_KEY}'] = ${JSON.stringify(clientConf)};
        </script>`
    );
};

const replaceMany = (tokens, str) => {
    for (const [token, content] of Object.entries(tokens)) {
        str = str.replace(token, content);
    }

    return str;
};

try {
    await inline();
} catch (ex) {
    console.error(ex);
    process.exit(1);
}
