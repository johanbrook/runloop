import { h } from '../deps';
import { Run } from '../model/state';
import { routes, useRouter } from '../router';
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
                <li>
                    <Link to={routes.runs({})}>Runs</Link>
                </li>
                <li>
                    <Link to={routes.stats({})}>Stats</Link>
                </li>
                <li>
                    <Link to={routes.settings({})}>Settings</Link>
                </li>
            </ul>
        </nav>
    );
};
