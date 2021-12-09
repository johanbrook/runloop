import { length } from '../deps';
import { Coords, Err, Run } from '../model/state';
import { formatDuration, pad } from './dates';

export const startWatchPosition = (
    onUpdate: (pos: GeolocationPosition) => void,
    onError: (err: Err) => void
): (() => void) => {
    const id = navigator.geolocation.watchPosition(
        onUpdate,
        (err) =>
            onError({
                kind: 'err',
                msg: 'Error when watching GPS location',
                cause: new Error(err.message),
            }),
        {
            enableHighAccuracy: true,
        }
    );

    return () => navigator.geolocation.clearWatch(id);
};

export const getCurrentPosition = (
    onPosition: (pos: GeolocationPosition) => void,
    onError: (err: Err) => void
) => {
    navigator.geolocation.getCurrentPosition(
        onPosition,
        (err) =>
            onError({
                kind: 'err',
                msg: 'Error when getting current position',
                cause: new Error(err.message),
            }),
        {
            enableHighAccuracy: true,
        }
    );
};

export const coordsToGeoJSON = (coords: Array<Coords>): GeoJSON.Feature<GeoJSON.LineString> => ({
    type: 'Feature',
    properties: {},
    geometry: {
        type: 'LineString',
        coordinates: coords,
    },
});

type Kilometers = number;
type Ms = number;

export const distanceOf = (coords: Array<Coords>): Kilometers =>
    length(coordsToGeoJSON(coords), {
        units: 'kilometers',
    });

export const formatDistance = (distance: Kilometers): string => round(distance) + ' km';

/** Returns the pace in minutes per kilometer. */
export const formatPace = (distance: Kilometers, duration: Ms) => {
    if (distance <= 0 || duration <= 0) return '-';

    const totalSecs = duration / 1000 / distance;
    const secs = Math.floor(totalSecs % 60);
    const mins = Math.floor(totalSecs / 60);

    return `${pad(mins)}:${pad(secs)} min/km`;
};

interface FormattedRunStats {
    /** In Kilometers. */
    distance: string;
    /** Minutes per Kilometer. */
    pace: string;
    /** Minutes and seconds. */
    duration: string;
}

export const statsOf = (run: Run): FormattedRunStats => {
    const distance = distanceOf(run.geoUpdates.map((u) => u.coords));
    const duration = run.finishedAt ? formatDuration(Math.abs(run.finishedAt - run.startedAt), 'units') : '-';
    const pace = run.finishedAt ? formatPace(distance, run.finishedAt - run.startedAt) : '-';

    return {
        distance: formatDistance(distance),
        duration,
        pace,
    };
};

/** Rounds a number to two decimals. */
const round = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;
