#!/usr/bin/env node
import esbuild from 'esbuild';
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { buildOpts } from './bundle.js';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

const PORT = parseInt(process.env.PORT || '3000', 10);
const USE_TLS = !!process.env.USE_TLS;

try {
    const { host, port } = await esbuild.serve(
        {
            servedir: 'build',
            host: 'localhost',
            onRequest: (args) => {
                console.log(`${args.method} ${args.status} ${args.path} (${args.timeInMS}ms)`);
            },
        },
        buildOpts
    );

    const createServer = await (async () => {
        if (USE_TLS) {
            return https.createServer.bind(https, {
                key: await readFile('./localhost-key.pem'),
                cert: await readFile('./localhost.pem'),
            });
        }

        return http.createServer;
    })();

    createServer((req, res) => {
        const options = {
            hostname: host,
            port: port,
            // SPA: make all non-file requests lead to index.html
            path: !!path.extname(req.url) ? req.url : '/index.html',
            method: req.method,
            headers: req.headers,
        };

        // Forward each incoming request to esbuild
        const proxyReq = http.request(options, (proxyRes) => {
            if (proxyRes.statusCode === 404) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>Not found</h1>');
                return;
            }

            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
        });

        // Forward the body of the request to esbuild
        req.pipe(proxyReq, { end: true });
    }).listen(PORT);

    console.log(`Serving at ${USE_TLS ? 'https' : 'http'}://${host}:${PORT}`);
} catch (ex) {
    console.error(ex);
    process.exit(1);
}
