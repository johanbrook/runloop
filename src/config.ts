type ConfigSpec = Record<string, Flag>;

export enum Flag {
    /** Visible on server. */
    Server = 1,
    /** Visible on client. */
    Client = 2,
    /** Optional for production use. */
    Optional = 4,
}

export const spec: ConfigSpec = {
    /** Spins up a https server instead of http. Useful in dev in order for Geolocation API to work. */
    USE_TLS: Flag.Server | Flag.Optional,
    /** The HTTP port to listen to. */
    PORT: Flag.Server | Flag.Optional,
    /** The environment. */
    ENV: Flag.Server | Flag.Client,
    /** Mapbox access token. */
    MAPBOX_TOKEN: Flag.Server | Flag.Client,
};

export const isBrowser = () => typeof window !== 'undefined';

export const getConfig = (key: keyof ConfigSpec, def?: string): string => {
    const specVal = spec[key];
    const obj = envObject();
    const val = obj[key];
    const isOptional = (specVal & Flag.Optional) != 0;

    if (!val && !isOptional) {
        throw new Error(`The "${key}" env var was required but not passed`);
    }

    return val || def || '';
};

export const mkConfig = (flag: Flag): Record<string, string> => {
    const ret: Record<string, string> = {};

    for (const [key, val] of Object.entries(spec)) {
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
