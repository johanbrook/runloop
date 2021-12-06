import { Application, Router, send, renderToString } from './deps';
import { App } from './App';
import { getConfig, mkConfig, BROWSER_WINDOW_ENV_KEY, Flag } from './config';
import { Router as AppRouter, Navigator } from './router';

const { files } = await Deno.emit('./src/run-app', {
    bundle: 'module',
    compilerOptions: {
        jsxFactory: 'h',
        jsxFragmentFactory: 'Fragment',
        target: 'es2015',
        module: 'es2015',
        lib: ['dom', 'dom.iterable'],
    },
});

const mkServer = (): Application => {
    const server = new Application();
    const router = new Router();

    const clientConf = mkConfig(Flag.Client);

    const html = (app: string) => /* html */ `
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Document</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css" integrity="sha512-NhSC1YmyruXifcj/KFRWoC561YpHpc5Jtzgvbuzx5VozKpWvQ+4nXhPdFgmx8xqexRcpAglTj9sIBWINXa8x5w==" crossorigin="anonymous" referrerpolicy="no-referrer" />
        <link rel="stylesheet" href="/app.css">
        <link href="https://api.mapbox.com/mapbox-gl-js/v2.6.0/mapbox-gl.css" rel="stylesheet">
        <script>
            window["${BROWSER_WINDOW_ENV_KEY}"] = ${JSON.stringify(clientConf)}
        </script>
    </head>
    <body>
        <div id="app">
            ${app}
        </div>
        <script type="module" src="/bundle.js"></script>
    </body>
</html>
`;

    router
        .get('/bundle.js', (ctx) => {
            ctx.response.body = files['deno:///bundle.js'] + '\n//# sourceMappingURL=/bundle.js.map';
            ctx.response.headers.set('Content-Type', 'text/javascript');
            ctx.response.headers.set('Sourcemap', '/bundle.js.map');
        })
        .get('/bundle.js.map', (ctx) => {
            ctx.response.body = files['deno:///bundle.js.map'];
            ctx.response.headers.set('Content-Type', 'application/json');
        })
        .get('/app.css', async (ctx) => {
            await send(ctx, ctx.request.url.pathname, {
                root: './static',
            });
        });

    server.use(router.routes());
    server.use(router.allowedMethods());

    // SPA
    server.use((ctx) => {
        const url = new URL(ctx.request.url);

        const navigator: Navigator = (pathname, replace, redirect) => {
            if (redirect) {
                ctx.response.redirect(pathname);
            }
        };

        const app = renderToString(
            <AppRouter initialUrl={url} navigator={navigator}>
                {(route) => <App route={route} />}
            </AppRouter>,
            {},
            {
                pretty: true,
            }
        );

        ctx.response.body = html(app);
    });

    return server;
};

try {
    const useTls = !!getConfig('USE_TLS', '');
    const env = getConfig('ENV', 'development');
    const port = parseInt(getConfig('PORT', '3000'), 10);

    const server = mkServer();

    server.addEventListener('listen', ({ hostname, port, secure }) => {
        console.log(
            `Listening on: ${secure ? 'https://' : 'http://'}${hostname ?? 'localhost'}:${port} in ${env}`
        );
    });

    const certOpts = useTls
        ? { secure: useTls, certFile: 'localhost.pem', keyFile: 'localhost-key.pem' }
        : {};

    await server.listen({
        port,
        ...certOpts,
    });
} catch (ex) {
    console.error('Startup failed:');
    console.error(ex);
    Deno.exit(1);
}
