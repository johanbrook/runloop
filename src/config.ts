type Config = Record<string, string>;
type ConfigSpec = Record<string, Flag>;

export enum Flag {
    /** Visible on server. */
    Server = 1,
    /** Visible on client. */
    Client = 2,
}

const config: ConfigSpec = {
    USE_TLS: Flag.Server,
    USE_EMIT: Flag.Server,
    PORT: Flag.Server,
    ENV: Flag.Server | Flag.Client,
    MAPBOX_TOKEN: Flag.Server | Flag.Client,
};

export const isBrowser = () => typeof Deno == 'undefined';

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
            const envVar = Deno.env.get(key);

            if (envVar) ret[key] = envVar;
        }
    }

    return ret;
};

export const BROWSER_WINDOW_ENV_KEY = 'RUNLOOP';

interface AppWindow extends Window {
    [BROWSER_WINDOW_ENV_KEY]?: Record<string, string>;
}

const envObject = (): Record<string, string> => {
    if (!isBrowser()) return Deno.env.toObject();

    const config = (window as AppWindow)[BROWSER_WINDOW_ENV_KEY];

    if (!config) {
        throw new Error(`Couldn't find runtime config in "window.${BROWSER_WINDOW_ENV_KEY}"`);
    }

    return config;
};
