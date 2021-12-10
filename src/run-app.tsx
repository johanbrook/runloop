import './lib/array-at-polyfill';

import { render, h } from './deps';
import { App } from './App';
import { Router, Navigator } from './router';
import { fixMobileHeight } from './lib/mobile-height-fix';

const navigator: Navigator = (pathname, { replace, redirect, force }) => {
    if (!force && location.pathname == pathname) return;
    window.history[replace || redirect ? 'replaceState' : 'pushState'](null, '', pathname);
};

const RoutedApp = () => (
    <Router initialUrl={new URL(window.location.href)} navigator={navigator}>
        {(route) => <App route={route} />}
    </Router>
);

render(<RoutedApp />, document.getElementById('app')!);

// Adding an empty touch listener will make :active CSS pseudo selector
// work in order to style taps on elements. Joy.
document.addEventListener('touchstart', (evt) => {});

// This is solving the STILL outstanding problem of using
// height: 100vh on Mobile Safari.
fixMobileHeight();
