import { hydrate, h } from './deps';
import { App } from './App';
import { Router, Navigator } from './router';

const navigator: Navigator = (pathname, replace = false, redirect = false) => {
    window.history[replace || redirect ? 'replaceState' : 'pushState'](null, '', pathname);
};

const RoutedApp = () => (
    <Router initialUrl={new URL(window.location.href)} navigator={navigator}>
        {(route) => <App route={route} />}
    </Router>
);

hydrate(<RoutedApp />, document.getElementById('app')!);
