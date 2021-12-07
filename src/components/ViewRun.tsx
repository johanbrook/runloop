import { h, lazy, Suspense } from '../deps';
import { formatDuration, formatRange, formatDate } from '../lib/dates';
import { distanceOf, paceOf, formatDistance } from '../lib/geo';
import { Run } from '../model/state';
import { routes } from '../router';
import { Link } from './Link';

const Map = lazy(() => import('./Map'));

interface Props {
    run: Run;
    onDelete: (run: Run) => void;
}

export const ViewRun = ({ run, onDelete }: Props) => {
    const distance = distanceOf(run.geoUpdates.map((u) => u.coords));
    const duration = run.finishedAt ? formatDuration(Math.abs(run.finishedAt - run.startedAt), 'units') : -1;
    const pace = run.finishedAt ? paceOf(distance, run.finishedAt - run.startedAt) : -1;

    return (
        <article>
            <h1>Run {run.id}</h1>
            <p>
                <Link to={routes.runs({})}>Back</Link>
            </p>
            <p>
                {formatDistance(distance)}
                {duration != -1 && distance > 0 ? ` — ${duration} — ${pace} min/km` : null}
            </p>
            <p>
                <small>
                    {run.finishedAt ? formatRange(run.startedAt, run.finishedAt) : formatDate(run.startedAt)}
                </small>
            </p>

            <p>
                <button class="btn" onClick={() => onDelete(run)}>
                    Delete run
                </button>
            </p>
            <Suspense fallback={<p>Loading...</p>}>
                <Map route={run.geoUpdates.map((u) => u.coords)} />
            </Suspense>
        </article>
    );
};
