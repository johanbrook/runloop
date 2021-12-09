import { h, lazy, Suspense } from '../deps';
import { formatDuration, formatRange, formatDate } from '../lib/dates';
import { distanceOf, formatPace, formatDistance, statsOf } from '../lib/geo';
import { Run, runTitleOf } from '../model/state';
import { routes } from '../router';
import { Link } from './Link';

const Map = lazy(() => import('./Map'));

interface Props {
    run: Run;
    onDelete: (run: Run) => void;
}

export const ViewRun = ({ run, onDelete }: Props) => {
    const { distance, pace, duration } = statsOf(run);

    return (
        <article>
            <p>
                <Link to={routes.runs({})} class="BtnLink BackLink">
                    Back
                </Link>
            </p>

            <h1>{runTitleOf(run.startedAt)}</h1>

            <table class="RunStatsTable">
                <tr>
                    <th class="detail">Distance</th>
                    <th class="detail">Pace</th>
                    <th class="detail">Time</th>
                </tr>
                <tr>
                    <td>{distance}</td>
                    <td>{pace}</td>
                    <td>{duration}</td>
                </tr>
            </table>

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
