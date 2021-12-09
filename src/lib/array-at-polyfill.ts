// From https://github.com/tc39/proposal-relative-indexing-method#polyfill

function at(this: Array<unknown>, n: number) {
    // ToInteger() abstract op
    n = Math.trunc(n) || 0;
    // Allow negative indexing from the end
    if (n < 0) n += this.length;
    // OOB access is guaranteed to return undefined
    if (n < 0 || n >= this.length) return undefined;
    // Otherwise, this is just normal property access
    return this[n];
}

for (const C of [Array, String]) {
    if (C == null) continue;
    if ('at' in C.prototype) continue;

    Object.defineProperty(C.prototype, 'at', {
        value: at,
        writable: true,
        enumerable: false,
        configurable: true,
    });
}
