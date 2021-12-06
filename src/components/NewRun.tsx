import { h, useEffect } from '../deps';
import { Coords, Err } from '../model/state';
import { getCurrentPosition } from '../lib/geo';
import { Map } from './Map';
import { Link } from './Link';
import { routes } from '../router';

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
