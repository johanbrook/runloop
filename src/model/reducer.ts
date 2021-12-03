import { Err, INITIAL_STATE, State, GeoUpdate, AppState, Run, Coords, AppConf } from './state.ts';
import { useCallback, useReducer, Reducer } from 'preact/hooks';

interface StartRun {
    kind: 'start_run';
}

interface FinishRun {
    kind: 'finish_run';
}

interface GeoUpdateMsg {
    kind: 'geo_update_msg';
    update: GeoUpdate;
}

interface SetCurrentPosition {
    kind: 'set_current_position';
    coords: Coords;
}

interface DeleteRun {
    kind: 'delete_run';
    id: number;
}

export type Action = StartRun | FinishRun | GeoUpdateMsg | SetCurrentPosition | DeleteRun | Err;

const STORAGE_KEY = 'runloop_v1';

const reducer: Reducer<State, Action> = (prev, action): State => {
    switch (action.kind) {
        case 'start_run':
            return {
                ...prev,
                appConf: {
                    ...prev.appConf,
                    currentRun: {
                        id: prev.appConf.latestRunNo + 1,
                        startedAt: Date.now(),
                        geoUpdates: [],
                    },
                    latestRunNo: prev.appConf.latestRunNo + 1,
                },
            };

        case 'geo_update_msg':
            // Invariant: needs currentRun
            if (!prev.appConf.currentRun) {
                throw new Error('Invariant fail: state.appConf.currentRun not set');
            }

            return {
                ...prev,
                currentCoords: action.update.coords,
                appConf: {
                    ...prev.appConf,
                    currentRun: {
                        ...prev.appConf.currentRun,
                        geoUpdates: [...prev.appConf.currentRun.geoUpdates, action.update],
                    },
                },
            };

        case 'finish_run': {
            // Invariant: needs currentRun
            if (!prev.appConf.currentRun) {
                throw new Error('Invariant fail: state.currentRun not set');
            }

            const finishedRun: Run = {
                ...prev.appConf.currentRun,
                finishedAt: Date.now(),
            };

            return {
                ...prev,
                appConf: {
                    ...prev.appConf,
                    currentRun: undefined,
                    // keep the array sorted latest first
                    runs: [finishedRun, ...prev.appConf.runs],
                },
            };
        }

        case 'set_current_position':
            return {
                ...prev,
                currentCoords: action.coords,
            };

        case 'delete_run':
            return {
                ...prev,
                appConf: {
                    ...prev.appConf,
                    currentRun:
                        action.id == prev.appConf.currentRun?.id ? undefined : prev.appConf.currentRun,
                    runs: prev.appConf.runs.filter((r) => r.id != action.id),
                },
            };

        case 'err':
            return {
                ...prev,
                err: action,
            };
    }
};

const derived = (prev: State): Partial<State> => {
    const derivedAppState = ((): AppState => {
        // if (prev.wantNewRun && !prev.appConf.currentRun) {
        //     return AppState.NewRun;
        // }
        // if (prev.selectedRun) {
        //     return AppState.ViewRun;
        // }
        // if (prev.appConf.currentRun) {
        //     return AppState.Running;
        // } else if (!prev.appConf.currentRun) {
        //     return AppState.Begin;
        // }

        return prev.appState;
    })();

    return { appState: derivedAppState };
};

const pack = (s: State) => s.appConf;
const unpack = (s: State, appConf: AppConf): State => {
    const unpackedState = {
        ...s,
        appConf,
    };

    return {
        ...unpackedState,
        ...derived(unpackedState),
    };
};

export const usePersistReducer = () => {
    const reducerLocalStorage = useCallback(
        (state: State, action: Action) => {
            console.log('action', action);

            const reducerState = reducer(state, action);
            const newState = {
                ...reducerState,
                ...derived(reducerState),
            };

            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(pack(newState)));
            } catch {
                // incognito mode
            }

            console.log('state', newState);

            return newState;
        },
        [STORAGE_KEY]
    );

    return useReducer(reducerLocalStorage, INITIAL_STATE, initializer);
};

const initializer = (initial: State): State => {
    const state = ((): State => {
        try {
            const persisted = localStorage.getItem(STORAGE_KEY);

            if (persisted != null) {
                return unpack(initial, JSON.parse(persisted));
            } else {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(pack(initial)));
                return initial;
            }
        } catch {
            // incognito mode or other error
            return initial;
        }
    })();

    console.log('state', state);

    return state;
};
