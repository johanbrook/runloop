import { h } from 'preact';
import { formatDuration, formatRange, formatDate } from '../lib/dates.ts';
import { distanceOf, paceOf, formatDistance } from '../lib/geo.ts';
import { Run } from '../model/state.ts';
import { routes } from '../router.tsx';
import { Link } from './Link.tsx';
import { Map } from './Map.tsx';

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

            <Map route={run.geoUpdates.map((u) => u.coords)} />
        </article>
    );
};
