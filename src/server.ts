import { serve, serveTls } from 'https://deno.land/std@0.115.1/http/mod.ts';
import { basename, extname } from 'https://deno.land/std@0.115.1/path/mod.ts';
import { Status } from 'https://deno.land/std@0.115.1/http/http_status.ts';
import { serveFile } from 'https://deno.land/std@0.115.1/http/file_server.ts';

const addr = ':3000';
const BUILD_ROOT = './build';

const handler = async (req: Request): Promise<Response> => {
    const ext = extname(req.url);

    if (req.method == 'GET' && ext?.length > 0) {
        const filename = basename(req.url);
        const filePath = `${BUILD_ROOT}/${filename}`;

        console.log(`${req.method} ${req.url} -> ${filePath}`);

        try {
            return await serveFile(req, filePath);
        } catch (_ex) {
            return new Response(`${filename} not found`, { status: Status.NotFound });
        }
    }

    const body = `
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
        <script type="module" src="/app.bundle.js"></script>
    </body>
</html>
`;

    console.log(`${req.method} ${Status.OK} ${req.url}`);

    return new Response(body, {
        status: Status.OK,
        headers: {
            'Content-type': 'text/html',
        },
    });
};

try {
    const env: string = Deno.env.get('ENV') || 'development';
    const useTls = !!Deno.env.get('USE_TLS');

    console.log(`Running in ${env} at ${useTls ? 'https' : 'http'}://localhost${addr}`);

    const server = useTls ? serveTls : serve;

    await server(handler, {
        addr,
        certFile: 'localhost.pem',
        keyFile: 'localhost-key.pem',
    });
} catch (ex) {
    console.error(ex);
    Deno.exit(1);
}
