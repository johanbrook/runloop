import { h, Fragment } from '../deps';
import { formatDate, formatDuration, formatRange } from '../lib/dates';
import { Run } from '../model/state';
import { formatDistance, distanceOf, paceOf } from '../lib/geo';
import { Link } from './Link';
import { routes } from '../router';
import { useHasMounted } from '../lib/has-mounted';

interface Props {
    runs: Run[];
}

export const Runs = ({ runs }: Props) => {
    const hasMounted = useHasMounted();

    if (!hasMounted) {
        return <h1>Runs</h1>;
    }

    return (
        <>
            <h1>Runs</h1>
            {runs.length == 0 ? (
                <p>No runs yet</p>
            ) : (
                <ol>
                    {runs.map((r) => (
                        <li key={r.id}>
                            <Link to={routes.viewRun({ id: r.id.toString() })} class="block">
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
    const duration = run.finishedAt ? formatDuration(Math.abs(run.finishedAt - run.startedAt), 'units') : -1;
    const pace = run.finishedAt ? paceOf(distance, run.finishedAt - run.startedAt) : -1;

    return (
        <article>
            <h2>Run {run.id}</h2>
            <p>
                {formatDistance(distance)}
                {duration != -1 && distance > 0 ? ` — ${duration} — ${pace} min/km` : null}
            </p>
            <p>
                <small>
                    {run.finishedAt ? formatRange(run.startedAt, run.finishedAt) : formatDate(run.startedAt)}
                </small>
            </p>
        </article>
    );
};
