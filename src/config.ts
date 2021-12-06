type Config = Record<string, string>;
type ConfigSpec = Record<string, Flag>;

export enum Flag {
    /** Visible on server. */
    Server = 1,
    /** Visible on client. */
    Client = 2,
}

const config: ConfigSpec = {
    /** Spins up a https server instead of http. Useful in dev in order for Geolocation API to work. */
    USE_TLS: Flag.Server,
    /** Use `Deno.emit` (currently unstable) for emitting the client bundle on app boot,
     * instead of pre-bundling it. */
    USE_EMIT: Flag.Server,
    /** The HTTP port to listen to. */
    PORT: Flag.Server,
    /** The environment. */
    ENV: Flag.Server | Flag.Client,
    /** Mapbox access token. */
    MAPBOX_TOKEN: Flag.Server | Flag.Client,
};

export const isBrowser = () => typeof window !== 'undefined';

export const getConfig = (key: string, def?: string): string => {
    const obj = envObject();
    const val: string | null = obj[key] || def || null;

    if (!val) {
        throw new Error(`The "${key}" env var was required but not passed`);
    }

    return val;
};

export const mkConfig = (flag: Flag): Record<string, string> => {
    const ret: Record<string, string> = {};

    for (const [key, val] of Object.entries(config)) {
        if ((val & flag) != 0) {
            const envVar = process.env[key];

            if (envVar) ret[key] = envVar;
        }
    }

    return ret;
};

export const BROWSER_WINDOW_ENV_KEY = 'RUNLOOP';

interface AppWindow extends Window {
    [BROWSER_WINDOW_ENV_KEY]?: Record<string, string>;
}

const envObject = (): Record<string, string | undefined> => {
    if (!isBrowser()) return process.env;

    const config = (window as AppWindow)[BROWSER_WINDOW_ENV_KEY];

    if (!config) {
        throw new Error(`Couldn't find runtime config in "window.${BROWSER_WINDOW_ENV_KEY}"`);
    }

    return config;
};
