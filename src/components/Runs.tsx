import { h, Fragment, useMemo } from '../deps';
import { formatDate } from '../lib/dates';
import { Run, runTitleOf } from '../model/state';
import { statsOf } from '../lib/geo';
import { Link } from './Link';
import { routes } from '../router';

interface Props {
    runs: Run[];
}

export const Runs = ({ runs }: Props) => {
    const sortedRuns = useMemo(() => [...runs].sort(sortBy<Run>('startedAt')), [runs]);

    return (
        <section>
            <h1>Runs</h1>
            {sortedRuns.length == 0 ? (
                <p>No runs yet</p>
            ) : (
                <ol>
                    {sortedRuns.map((r) => (
                        <li key={r.id}>
                            <Link to={routes.viewRun({ id: r.id.toString() })} class="link-block">
                                <Run run={r} />
                            </Link>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
};

const Run = ({ run }: { run: Run }) => {
    const { distance, pace, duration } = statsOf(run);

    return (
        <article class="RunItem">
            <header>
                <h2 class="no-wrap">{runTitleOf(run.startedAt)} →</h2>
                <time class="detail">{formatDate(run.startedAt)}</time>
            </header>

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
