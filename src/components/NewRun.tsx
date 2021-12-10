import { h, useEffect, lazy, Suspense } from '../deps';
import { Coords, Err } from '../model/state';
import { getCurrentPosition } from '../lib/geo';
import { MapPlaceholder } from './Loading';

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
            <h1>New run</h1>

            <Suspense fallback={<MapPlaceholder />}>
                <Map />
            </Suspense>

            <button class="btn w-full" disabled={!hasCurrentPosition} onClick={onStartRun}>
                Start running
            </button>
        </section>
    );
};
