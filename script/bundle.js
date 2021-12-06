#!/usr/bin/env node
import esbuild from 'esbuild';

const ENTRYPOINT = 'src/run-app.tsx';
const BUNDLE = 'build/app.bundle.js';

const minify = !!process.env.MINIFY;
const env = process.env.ENV || 'development';

if (process.env.NODE_ENV !== env) process.env.NODE_ENV = env;

export const buildOpts = {
    entryPoints: [ENTRYPOINT],
    bundle: true,
    outfile: BUNDLE,
    sourcemap: true,
    minify,
};

try {
    await esbuild.build(buildOpts);
} catch (ex) {
    console.error(ex);
    process.exit(1);
}
