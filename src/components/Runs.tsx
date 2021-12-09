import { h, Fragment, useMemo } from '../deps';
import { formatDate, formatDuration, formatRange, formatRunTitle } from '../lib/dates';
import { Run } from '../model/state';
import { formatDistance, distanceOf, formatPace } from '../lib/geo';
import { Link } from './Link';
import { routes } from '../router';
import { useHasMounted } from '../lib/has-mounted';

interface Props {
    runs: Run[];
}

export const Runs = ({ runs }: Props) => {
    const hasMounted = useHasMounted();
    const sortedRuns = useMemo(() => [...runs].sort(sortBy<Run>('startedAt')), [runs]);

    if (!hasMounted) {
        return <h1>Runs</h1>;
    }

    return (
        <>
            <h1>Runs</h1>
            {sortedRuns.length == 0 ? (
                <p>No runs yet</p>
            ) : (
                <ol>
                    {sortedRuns.map((r) => (
                        <li key={r.id}>
                            <Link to={routes.viewRun({ id: r.id.toString() })} class="block color-inherit">
                                <Run run={r} />
                            </Link>
                        </li>
                    ))}
                </ol>
            )}
        </>
    );
};

const Run = ({ run }: { run: Run }) => {
    const distance = distanceOf(run.geoUpdates.map((u) => u.coords));
    const duration = run.finishedAt ? formatDuration(Math.abs(run.finishedAt - run.startedAt), 'units') : '-';
    const pace = run.finishedAt ? formatPace(distance, run.finishedAt - run.startedAt) : '-';

    return (
        <article class="RunItem">
            <header class="flex justify-between items-baseline">
                <h2 class="flex-1">{formatRunTitle(run.startedAt)} run</h2>
                <time class="detail no-wrap">{formatDate(run.startedAt)}</time>
            </header>
            <table>
                <tr>
                    <th class="detail">Distance</th>
                    <th class="detail">Pace</th>
                    <th class="detail">Time</th>
                </tr>
                <tr>
                    <td>{formatDistance(distance)}</td>
                    <td>{pace} min/km</td>
                    <td>{duration}</td>
                </tr>
            </table>
        </article>
    );
};

/** DESC sort on a key of `T`. */
const sortBy =
    <T extends unknown>(key: keyof T): ((a: T, b: T) => number) =>
    (a, b) => {
        if (a[key] < b[key]) return 1;
        if (a[key] > b[key]) return -1;
        return 0;
    };
