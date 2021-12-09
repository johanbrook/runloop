import { h, useEffect, lazy, Suspense } from '../deps';
import { Coords, Err } from '../model/state';
import { getCurrentPosition } from '../lib/geo';
import { Link } from './Link';
import { routes } from '../router';

const Map = lazy(() => import('./Map'));

interface Props {
    onStartRun: () => void;
    onCurrentPosition: (coords: Coords) => void;
    onGeolocationError: (err: Err) => void;
    hasCurrentPosition: boolean;
}

export const NewRun = ({ onStartRun, onCurrentPosition, onGeolocationError, hasCurrentPosition }: Props) => {
    useEffect(() => {
        getCurrentPosition(
            ({ coords }) => onCurrentPosition([coords.longitude, coords.latitude]),
            onGeolocationError
        );
    }, []);

    return (
        <section>
            <p>
                <Link to={routes.runs({})} class="BtnLink BackLink">
                    Back
                </Link>
            </p>

            <h1>New run</h1>
            <p>
                <button class="btn" disabled={!hasCurrentPosition} onClick={() => onStartRun()}>
                    Start running
                </button>
            </p>

            <Suspense fallback={<p>Loading...</p>}>
                <Map />
            </Suspense>
        </section>
    );
};
