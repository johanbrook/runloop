# runloop

## Workflows

### Development

```bash
brew install mkcert
mkcert -install
mkcert localhost
npm install
npm start
```

Visit `https://localhost:3000`.

### Production

TBD.

## Config

### `PORT`

Optional. The port which the HTTP server will run on. Defaults to `3000`.

### `ENV`

Optional. Defaults to `development`.

### `MAPBOX_TOKEN`

Required. Generate a personal access token over at [Mapbox](http://mapbox.com). Used for rendering inline maps and using the API.

### `MINIFY`

Defaults to `false`. If truthy, the JS bundle will be minified.

### `USE_TLS`

Optional. A truthy value will start a local HTTPS server. Useful for dev, as the Geolocation API won't work in insecure contexts, which is totally :eyeroll: