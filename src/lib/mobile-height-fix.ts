let lastHeight: number | null = null;

const debounce = (func: (...args: unknown[]) => unknown, wait: number) => {
    let timeout: NodeJS.Timeout;

    return (...args: unknown[]) => {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const setAppHeight = debounce(() => {
    const doc = document.documentElement;
    const height = window.innerHeight;

    if (height != lastHeight) {
        doc.style.setProperty('--app-height', `${height - MAGIC_NUMBER}px`);
        lastHeight = height;
    }
}, 100);

// This is the magic offset which one can subtract in order to hide scrollbars
// AT LEAST ON MY PHONE.
const MAGIC_NUMBER = 3;

/** This is solving the STILL outstanding problem of using
 * height: 100vh on Mobile Safari. The problem is outlined here:
 * https://chanind.github.io/javascript/2019/09/28/avoid-100vh-on-mobile-web.html
 *
 * Instead, we control the height of a CSS variable which is mirroring
 * the window.innerHeight property.
 */
export const fixMobileHeight = () => {
    window.addEventListener('resize', setAppHeight);

    setAppHeight();

    return () => window.removeEventListener('resize', setAppHeight);
};
