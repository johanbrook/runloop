import { h, useEffect } from '../deps.ts';
import { Coords, Err } from '../model/state.ts';
import { getCurrentPosition } from '../lib/geo.ts';
import { Map } from './Map.tsx';
import { Link } from './Link.tsx';
import { routes } from '../router.tsx';

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
            <div>
                <button class="btn" disabled={!hasCurrentPosition} onClick={() => onStartRun()}>
                    Start running
                </button>
                <Link to={routes.runs({})} class="btn">
                    Cancel
                </Link>
            </div>

            <Map />
        </section>
    );
};
