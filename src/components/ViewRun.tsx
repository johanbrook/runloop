import { h, lazy, Suspense } from '../deps';
import { statsOf } from '../lib/geo';
import { Run, runTitleOf } from '../model/state';
import { routes } from '../router';
import { Link } from './Link';
import { MapPlaceholder } from './Loading';

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

            <Suspense fallback={<MapPlaceholder />}>
                <Map route={run.geoUpdates.map((u) => u.coords)} />
            </Suspense>

            <button
                class="btn btn-danger w-full"
                onClick={() => {
                    if (confirm('Are you sure?')) {
                        onDelete(run);
                    }
                }}
            >
                Delete run
            </button>
        </article>
    );
};
