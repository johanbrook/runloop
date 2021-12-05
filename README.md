## runloop

## Dev

```bash
$ USE_TLS=1 deno run -c deno.jsonc -A --unstable --watch src/main.tsx
```

## Config

### `USE_TLS`

Optional. A truthy value will start a local HTTPS server. Useful for dev, as the Geolocation API won't work in insecure contexts, which is totally :eyeroll:

### `PORT`

Optional. The port which the HTTP server will run on. Defaults to `3000`.

### `ENV`

Optional. Defaults to `development`.

### `MAPBOX_TOKEN`

Required. Generate a personal access token over at [Mapbox](http://mapbox.com). Used for rendering inline maps and using the API.
