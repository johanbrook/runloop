#!/usr/bin/env node
import esbuild from 'esbuild';

try {
    await esbuild.build({
        entryPoints: ['src/config.ts'],
        outdir: 'tmp',
    });

    const { spec, getConfig } = await import('../tmp/config.js');

    for (const [key] of Object.entries(spec)) {
        try {
            getConfig(key);
        } catch (ex) {
            console.error(ex.message);
            process.exit(1);
        }
    }
} catch (ex) {
    console.error(ex);
    process.exit(1);
}
