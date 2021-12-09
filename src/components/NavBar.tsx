import { h } from '../deps';
import { routes } from '../router';
import { Link } from './Link';

export const NavBar = () => {
    return (
        <nav role="navigation" class="NavBar">
            <Link to={routes.newRun({})} class="NavBar__Float">
                New run
            </Link>
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
