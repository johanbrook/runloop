import { useCallback, useReducer, Reducer } from '../deps';
import { Err, INITIAL_STATE, State, GeoUpdate, Run, Coords, AppConf, Event } from './state';

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

interface PauseResumeRun {
    kind: 'pause_resume_run';
    pause: boolean;
}

interface ImportAppConf {
    kind: 'import_app_conf';
    conf: AppConf;
}

interface Reset {
    kind: 'reset';
}

export type Action =
    | StartRun
    | FinishRun
    | GeoUpdateMsg
    | SetCurrentPosition
    | DeleteRun
    | PauseResumeRun
    | ImportAppConf
    | Reset
    | Err;

const STORAGE_KEY = 'runloop_v1';

const reducer: Reducer<State, Action> = (prev, action): State => {
    switch (action.kind) {
        case 'start_run': {
            const id = prev.appConf.latestRunNo + 1;

            return {
                ...prev,
                appConf: {
                    ...prev.appConf,
                    latestRunNo: id,
                    currentRun: {
                        id,
                        startedAt: Date.now(),
                        geoUpdates: [],
                        events: [],
                    },
                },
            };
        }

        case 'geo_update_msg': {
            const { currentRun } = prev.appConf;

            invariant(currentRun, `No currentRun when receiving ${action.kind}`);

            return {
                ...prev,
                currentCoords: action.update.coords,
                appConf: {
                    ...prev.appConf,
                    currentRun: {
                        ...currentRun,
                        geoUpdates: [...currentRun.geoUpdates, action.update],
                    },
                },
            };
        }

        case 'finish_run': {
            const { currentRun } = prev.appConf;

            invariant(currentRun, `No currentRun when receiving ${action.kind}`);

            const finishedRun: Run = {
                ...currentRun,
                finishedAt: Date.now(),
            };

            return {
                ...prev,
                appConf: {
                    ...prev.appConf,
                    currentRun: undefined,
                    runs: {
                        [finishedRun.id]: finishedRun,
                        ...prev.appConf.runs,
                    },
                },
            };
        }

        case 'set_current_position':
            return {
                ...prev,
                currentCoords: action.coords,
            };

        case 'delete_run': {
            const runs = { ...prev.appConf.runs };
            delete runs[action.id];

            return {
                ...prev,
                appConf: {
                    ...prev.appConf,
                    runs,
                },
            };
        }

        case 'pause_resume_run':
            const { currentRun } = prev.appConf;

            invariant(currentRun, `No currentRun when receiving ${action.kind}`);

            const type = action.pause ? 'pause' : 'resume';

            invariant(
                currentRun.events.at(-1)?.type != type,
                `Previous event type is equal to the next resulting event type (${type})`
            );

            const event: Event = {
                type,
                time: Date.now(),
            };

            return {
                ...prev,
                appConf: {
                    ...prev.appConf,
                    currentRun: {
                        ...currentRun,
                        events: [...currentRun.events, event],
                    },
                },
            };

        case 'import_app_conf':
            return {
                ...prev,
                appConf: action.conf,
            };

        case 'reset':
            const newState = INITIAL_STATE;
            resetStorage(newState);
            return newState;

        case 'err':
            return {
                ...prev,
                err: action,
            };
    }
};

function invariant(cond: unknown, msg: string): asserts cond {
    if (!cond) {
        throw new Error(`Invariant: ${msg}`);
    }
}

const pack = (s: State) => s.appConf;
const unpack = (s: State, appConf: AppConf): State => ({
    ...s,
    appConf,
});

export const useModel = (): [State, (a: Action) => void] => {
    const reducerLocalStorage = useCallback(
        (state: State, action: Action) => {
            console.log('action', action);

            const newState = reducer(state, action);

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

    const [state, dispatch] = useReducer(reducerLocalStorage, INITIAL_STATE, initializer);

    return [state, dispatch];
};

const initializer = (initial: State): State => {
    const state = ((): State => {
        try {
            const persisted = localStorage.getItem(STORAGE_KEY);

            if (persisted != null) {
                return unpack(initial, JSON.parse(persisted));
            } else {
                resetStorage(initial);
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

const resetStorage = (state: State) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pack(state)));
};
