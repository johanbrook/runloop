type TimestampMs = number;

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
    runs: { [id: number]: Run };
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
    startedAt: TimestampMs;
    finishedAt?: TimestampMs;
    geoUpdates: GeoUpdate[];
    events: Event[];
}

export interface GeoUpdate {
    coords: Coords;
    timestamp: TimestampMs;
}

export interface Event {
    type: 'pause' | 'resume';
    time: TimestampMs;
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

export const findRunById = (state: State, id: number): Run | undefined => state.appConf.runs[id];

const COORD_TOLERANCE = 0.00001;

const INTERVALS: { [k: number]: string } = {
    0: 'Midnight',
    1: 'Night',
    3: 'Early morning',
    5: 'Before breakfast',
    6: 'Morning',
    9: 'Late morning',
    11: 'Lunch',
    13: 'Afternoon',
    17: 'Evening',
    20: 'Late evening',
    23: 'Night',
};

export const runTitleOf = (startedAt: TimestampMs): string => {
    const hours = new Date(startedAt).getHours();
    let prev: string = 'A nice';
    const suffix = ' run';

    for (const [hour, name] of Object.entries(INTERVALS)) {
        if (hours > parseInt(hour, 10)) {
            prev = name;
            continue;
        }
        return prev + suffix;
    }

    return prev + suffix;
};

export const isPaused = (run: Run) => run.events.at(-1)?.type == 'pause';

export const fileOf = (appConf: AppConf): File => {
    return new File([JSON.stringify(appConf, null, 4)], 'runloop.json', {
        type: 'application/json',
    });
};
