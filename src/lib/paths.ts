export type Pathname = `/${string}`;

type Path<Pattern extends string> = {
    (params: Params<Pattern>): Pathname;
    pattern: Pattern;
    paramsOf: (pathname: string) => Params<Pattern>;
};

type ParamNames<Pattern extends string> = Pattern extends `:${infer Param}/${infer Rest}`
    ? Param | ParamNames<Rest>
    : Pattern extends `:${infer Param}`
    ? Param
    : Pattern extends `${infer _Prefix}/:${infer Rest}`
    ? ParamNames<`:${Rest}`>
    : never;

/** Given a Pattern `/foo/:lol`, this gives: `{ lol: string }`. */
export type Params<Pattern extends string> = {
    [K in ParamNames<Pattern>]: string;
};

export const path = <Pattern extends string>(pattern: Pattern): Path<Pattern> => {
    const match = makeMatcher();

    const toPath = (params: Params<Pattern>): Pathname =>
        ('/' +
            pattern
                .split('/')
                .map((part) =>
                    part.startsWith(':') ? params[part.substring(1) as keyof Params<Pattern>] : part
                )
                .filter((v) => v != '')
                .join('/')) as Pathname;

    toPath.pattern =
        // noop if we only deal with a single root path
        pattern == '/'
            ? pattern
            : (pattern
                  // remove multiple slashes
                  .replace(/\/+/g, '/')
                  // remove trailing slash
                  .replace(
                      /^(.+)\/$/,
                      (_match, patternWithoutTrailingSlash) => patternWithoutTrailingSlash
                  ) as Pattern);

    toPath.paramsOf = (pathname: string) => {
        const params = match(pattern, pathname);

        if (params == null) throw new Error(`Params from path ${pathname} with pattern ${pattern} was null`);

        return params;
    };

    return toPath;
};

// Pattern->Regex
// From https://github.com/molefrog/wouter/blob/master/matcher.js

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

const makeMatcher = () => {
    const cache: Record<string, { keys: Array<Record<'name', string>>; regexp: RegExp }> = {};

    // obtains a cached regexp version of the pattern
    const getRegexp = (pattern: string) => cache[pattern] || (cache[pattern] = pathToRegexp(pattern));

    return <Pattern extends string>(pattern: Pattern, pathname: string): Params<Pattern> | null => {
        const { regexp, keys } = getRegexp(pattern || '');
        const out = regexp.exec(pathname);

        if (!out) return null;

        const params = {} as Params<Pattern>;

        keys.forEach((key, i) => {
            params[key.name as keyof Params<Pattern>] = out[i + 1];
        });

        return params;
    };
};

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
