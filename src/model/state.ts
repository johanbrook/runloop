export enum AppState {
    Inited = 'INITED',
    Failed = 'FAILED',
}

export interface State {
    appState: AppState;
    appConf: AppConf;
    err?: Err;
    currentCoords?: Coords;
}

/** Persisted in storage. */
export interface AppConf {
    currentRun?: Run;
    runs: Run[];
    latestRunNo: number;
}

export interface Err {
    kind: 'err';
    /** User friendly. */
    msg: string;
    cause?: Error;
}

export interface Run {
    id: number;
    startedAt: number; // ms
    finishedAt?: number; // ms
    geoUpdates: GeoUpdate[];
}

export interface GeoUpdate {
    coords: Coords;
    timestamp: number; // ms
}

/** Defined as `(longitude, latitude)` as decimal numbers.
 * https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.1
 */
export type Coords = [lon: number, lat: number];

export const INITIAL_STATE: State = {
    appState: AppState.Inited,
    appConf: {
        latestRunNo: 0,
        runs: [],
    },
};

export const coordsAreEqual = (c1: Coords, c2: Coords): boolean => {
    const lat = Math.abs(c1[0] - c2[0]) < COORD_TOLERANCE;
    const lon = Math.abs(c1[1] - c2[1]) < COORD_TOLERANCE;
    return lat && lon;
};

export const positionHasChanged = (run: Run, coords: Coords): boolean => {
    const last = run.geoUpdates.at(-1);

    if (!last) return true;

    return !coordsAreEqual(last.coords, coords);
};

export const findRunById = (state: State, id: number): Run | undefined =>
    state.appConf.runs.find((r) => r.id == id);

const COORD_TOLERANCE = 0.00001;
