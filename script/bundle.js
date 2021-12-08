#!/usr/bin/env node
import esbuild from 'esbuild';

const minify = !!process.env.INLINE;
const env = process.env.ENV || 'development';

if (process.env.NODE_ENV !== env) process.env.NODE_ENV = env;

export const buildOpts = {
    entryPoints: ['src/run-app.tsx', 'src/components/Map.tsx'],
    splitting: true,
    format: 'esm',
    bundle: true,
    outdir: 'build',
    sourcemap: true,
    minify,
};

try {
    await esbuild.build(buildOpts);
} catch (ex) {
    console.error(ex);
    process.exit(1);
}
