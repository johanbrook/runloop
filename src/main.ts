import { Application, Router, h, renderSSR } from './deps.ts';

const getEnv = (key: string, def?: string): string => {
    const val: string | null = Deno.env.get(key) || def || null;

    if (!val) {
        throw new Error(`The "${key}" env var was required but not passed`);
    }

    return val;
};

const { files } = await Deno.emit('./app.tsx', {
    bundle: 'module',
    compilerOptions: {
        jsxFactory: 'h',
        target: 'es2015',
        module: 'es2015',
    },
});

const html = /* html */ `
    <!DOCTYPE html>
<html lang="en">
    <head>
        <title>Document</title>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
        <h1>App</h1>
        <script type="module" src="/bundle.js"></script>
    </body>
</html>
`;

const mkApp = (): Application => {
    const app = new Application();
    const router = new Router();

    router
        .get('/', (ctx) => {
            ctx.response.body = html;
        })
        .get('/bundle.js', (ctx) => {
            ctx.response.body = files['deno:///app.js'];
            ctx.response.headers.set('Content-Type', 'text/javascript');
        });

    app.use(router.routes());
    app.use(router.allowedMethods());

    return app;
};

const listen = async (app: Application, port: number, useTls: boolean) => {
    const certOpts = useTls
        ? { secure: useTls, certFile: 'localhost.pem', keyFile: 'localhost-key.pem' }
        : {};

    await app.listen({
        port,
        ...certOpts,
    });
};

try {
    const dbUrl = getEnv('POSTGRES_URI');
    const useTls = !!getEnv('USE_TLS', '');
    const env = getEnv('ENV', 'development');
    const port = parseInt(getEnv('PORT', '3000'), 10);

    const app = mkApp();

    app.addEventListener('listen', ({ hostname, port, secure }) => {
        console.log(
            `Listening on: ${secure ? 'https://' : 'http://'}${hostname ?? 'localhost'}:${port} in ${env}`
        );
    });

    await listen(app, port, useTls);
} catch (ex) {
    console.error(ex);
    Deno.exit(1);
}
