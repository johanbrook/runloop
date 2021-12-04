import { hydrate, h } from 'preact';
import { App } from './App.tsx';
import { Router, Navigator } from './router.tsx';

const navigator: Navigator = (pathname, replace = false, redirect = false) => {
    window.history[replace || redirect ? 'replaceState' : 'pushState'](null, '', pathname);
};

const RoutedApp = () => (
    <Router initialUrl={new URL(window.location.href)} navigator={navigator}>
        {(route) => <App route={route} />}
    </Router>
);

hydrate(<RoutedApp />, document.getElementById('app')!);
