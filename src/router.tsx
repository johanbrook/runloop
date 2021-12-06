import { h, VNode, createContext, useEffect, useMemo, useState, useContext } from './deps';
import { Params, path, Pathname } from './lib/paths';

export const routes = {
    runs: path('/'),
    newRun: path('/runs/new'),
    currentRun: path('/runs/current'),
    viewRun: path('/runs/:id'),
};

export type Route<R extends RouteName> = {
    name: R;
    params: Params<typeof routes[R]['pattern']>;
};

export type RouteName = keyof typeof routes;

type RouterFn = (callback: In, navigator: Navigator) => Router;

type In = (route: Route<RouteName>) => void;

interface Router {
    start: () => Stop;
    navigate: (to: Pathname, replace?: boolean) => void;
    redirect: (to: Pathname) => void;
}

export interface Navigator {
    (pathname: string, replace?: boolean, redirect?: boolean): void;
}

type Stop = () => void;

const mkRouter: RouterFn = (callback, navigator) => {
    const check = () => {
        const route = getMatchingRoute(new URL(window.location.href));

        if (route) callback(route);
    };

    const router: Router = {
        start: () => {
            events.forEach((ev) => addEventListener(ev, check));

            check();

            return () => events.forEach((ev) => removeEventListener(ev, check));
        },

        navigate: (pathname, replace = false) => {
            navigator(pathname, replace);
        },

        redirect: (pathname) => {
            navigator(pathname, true, true);
        },
    };

    return router;
};

const getMatchingRoute = (url: URL): Route<RouteName> | null => {
    for (const [route, pathFn] of Object.entries(routes)) {
        const res = matcher(pathFn.pattern, url.pathname as Pathname);

        if (res[0]) {
            return {
                name: route as RouteName,
                params: res[1],
            };
        }
    }

    return null;
};

// Components

interface RouterCtx {
    navigate: (to: Pathname, replace?: boolean) => void;
    redirect: (to: Pathname) => void;
}

const RouterContext = createContext<RouterCtx>(null!);

interface RouterProps {
    initialUrl: URL;
    navigator: Navigator;
    children: (route: Route<RouteName>) => VNode;
}

export const Router = ({ initialUrl, children, navigator }: RouterProps) => {
    const [route, setRoute] = useState<Route<RouteName> | null>(() => getMatchingRoute(initialUrl));

    console.log('route', route);

    const router = useMemo(() => mkRouter(setRoute, navigator), [navigator]);

    useEffect(() => {
        const stop = router.start();

        return () => stop();
    }, []);

    const ctx: RouterCtx = {
        navigate: router.navigate,
        redirect: router.redirect,
    };

    return <RouterContext.Provider value={ctx} children={route ? children(route) : null} />;
};

export const useRouter = () => {
    return useContext(RouterContext);
};

const eventPopstate = 'popstate';
const eventPushState = 'pushState';
const eventReplaceState = 'replaceState';
const events = [eventPopstate, eventPushState, eventReplaceState];

// From https://github.com/molefrog/wouter/blob/master/use-location.js
if (typeof history !== 'undefined') {
    for (const type of [eventPushState, eventReplaceState] as const) {
        const original = history[type];

        history[type] = function (
            ...args: [data: unknown, unused: string, url: URL | string | null | undefined]
        ) {
            const result = original.apply(this, args);
            const event = new Event(type);

            dispatchEvent(event);

            return result;
        };
    }
}

// Pattern->Regex
// From https://github.com/molefrog/wouter/blob/master/matcher.js

// Singleton matcher
const matcher = makeMatcher();

// escapes a regexp string (borrowed from path-to-regexp sources)
// https://github.com/pillarjs/path-to-regexp/blob/v3.0.0/index.js#L202
const escapeRx = (str: string) => str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');

// returns a segment representation in RegExp based on flags
// adapted and simplified version from path-to-regexp sources
const rxForSegment = (repeat: boolean, optional: boolean, prefix: 0 | 1) => {
    let capture = repeat ? '((?:[^\\/]+?)(?:\\/(?:[^\\/]+?))*)' : '([^\\/]+?)';
    if (optional && prefix) capture = '(?:\\/' + capture + ')';
    return capture + (optional ? '?' : '');
};

type Matcher = <Pattern extends string>(
    pattern: Pattern,
    pathname: Pathname
) => [match: true, params: Params<Pattern>] | [match: false, params: null];

function makeMatcher(): Matcher {
    const cache: Record<string, { keys: Array<Record<'name', string>>; regexp: RegExp }> = {};

    // obtains a cached regexp version of the pattern
    const getRegexp = (pattern: string) => cache[pattern] || (cache[pattern] = pathToRegexp(pattern));

    return <Pattern extends string>(pattern: Pattern, pathname: Pathname) => {
        const { regexp, keys } = getRegexp(pattern || '');
        const out = regexp.exec(pathname);

        if (!out) return [false, null];

        const params = {} as Params<Pattern>;

        keys.forEach((key, i) => {
            params[key.name as keyof Params<Pattern>] = out[i + 1];
        });

        return [true, params];
    };
}

/** Make a `RegEx` from a route pattern. */
const pathToRegexp = <Pattern extends string>(pattern: Pattern) => {
    const groupRx = /:([A-Za-z0-9_]+)([?+*]?)/g;

    let match = null;
    let lastIndex = 0;
    let result = '';

    const keys: Array<Record<'name', string>> = [];

    while ((match = groupRx.exec(pattern)) !== null) {
        const [_, segment, mod] = match;

        // :foo  [1]      (  )
        // :foo? [0 - 1]  ( o)
        // :foo+ [1 - ∞]  (r )
        // :foo* [0 - ∞]  (ro)
        const repeat = mod === '+' || mod === '*';
        const optional = mod === '?' || mod === '*';
        const prefix = optional && pattern[match.index - 1] === '/' ? 1 : 0;

        const prev = pattern.substring(lastIndex, match.index - prefix);

        keys.push({ name: segment });
        lastIndex = groupRx.lastIndex;

        result += escapeRx(prev) + rxForSegment(repeat, optional, prefix);
    }

    result += escapeRx(pattern.substring(lastIndex));
    return { keys, regexp: new RegExp('^' + result + '(?:\\/)?$', 'i') };
};
