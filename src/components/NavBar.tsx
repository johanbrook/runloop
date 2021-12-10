import { h } from '../deps';
import { Run } from '../model/state';
import { RouteName, routes, useRouter } from '../router';
import { Link } from './Link';

interface Props {
    currentRun?: Run;
}

export const NavBar = ({ currentRun }: Props) => {
    const { route } = useRouter();

    return (
        <nav role="navigation" class="NavBar">
            {route.name == 'currentRun' || route.name == 'newRun' ? null : currentRun ? (
                <Link to={routes.currentRun({})} class="NavBar__Float">
                    Current run
                </Link>
            ) : (
                <Link to={routes.newRun({})} class="NavBar__Float">
                    New run
                </Link>
            )}

            <ul>
                <li class={currentClass(route.name, 'runs')}>
                    <Link to={routes.runs({})}>Runs</Link>
                </li>
                <li class={currentClass(route.name, 'stats')}>
                    <Link to={routes.stats({})}>Stats</Link>
                </li>
                <li class={currentClass(route.name, 'settings')}>
                    <Link to={routes.settings({})}>Settings</Link>
                </li>
            </ul>
        </nav>
    );
};

const currentClass = (current: RouteName, thisOne: RouteName) => (current == thisOne ? 'current' : undefined);
