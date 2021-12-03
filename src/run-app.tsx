import { hydrate, h } from 'preact';
import { App } from './App.tsx';
import { Router, browserNavigator } from './router.tsx';

const RoutedApp = () => (
    <Router initialUrl={new URL(window.location.href)} navigator={browserNavigator}>
        {(route) => <App route={route} />}
    </Router>
);

hydrate(<RoutedApp />, document.getElementById('app')!);
