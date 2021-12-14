import { h, useEffect, Fragment } from './deps';
import { NewRun } from './components/NewRun';
import { CurrentRun } from './components/CurrentRun';
import { Runs } from './components/Runs';
import { ViewRun } from './components/ViewRun';
import { Action, useModel } from './model/reducer';
import { AppState, findRunById, State } from './model/state';
import { Route, RouteName, routes, useRouter } from './router';

import './app.css';
import { NavBar } from './components/NavBar';
import { Settings } from './components/Settings';

interface Props {
    route: Route<RouteName>;
}

export const App = ({ route }: Props) => {
    const [state, dispatch] = useModel();
    const { navigate } = useRouter();

    // leak state for easy console debugging
    (window as AppWindow).state = state;
    (window as AppWindow).dispatch = dispatch;

    useEffect(() => {
        if (state.appConf.currentRun) {
            navigate(routes.currentRun({}));
        }
    }, [state.appConf.currentRun]);

    if (state.appState == AppState.Failed) {
        return (
            <section>
                <h1>Error</h1>
                <p>{state.err?.msg || 'Unknown error'}</p>
                {state.err?.cause && <pre>{state.err?.cause}</pre>}
            </section>
        );
    }

    return (
        <>
            <main>
                {(() => {
                    switch (route.name) {
                        case 'viewRun':
                            return <ViewRunPage state={state} dispatch={dispatch} route={route} />;

                        case 'runs':
                            return <Runs runs={Object.values(state.appConf.runs)} />;

                        case 'newRun':
                            return (
                                <NewRun
                                    hasCurrentPosition={!!state.currentCoords}
                                    onCurrentPosition={(coords) =>
                                        dispatch({
                                            kind: 'set_current_position',
                                            coords,
                                        })
                                    }
                                    onGeolocationError={(err) => dispatch(err)}
                                    onStartRun={() =>
                                        dispatch({
                                            kind: 'start_run',
                                        })
                                    }
                                />
                            );

                        case 'currentRun':
                            return <CurrentRunPage state={state} dispatch={dispatch} route={route} />;

                        case 'stats':
                            return <p>To be implemented</p>;

                        case 'settings':
                            return (
                                <Settings
                                    onReset={() =>
                                        dispatch({
                                            kind: 'reset',
                                        })
                                    }
                                    appConf={state.appConf}
                                    onImport={(conf) =>
                                        dispatch({
                                            kind: 'import_app_conf',
                                            conf,
                                        })
                                    }
                                />
                            );
                    }
                    // Assert exhaustive
                    ((x: never) => {})(route.name);
                })()}
            </main>

            <NavBar currentRun={state.appConf.currentRun} />
        </>
    );
};

interface PageProps {
    state: State;
    dispatch: (a: Action) => void;
    route: Route<RouteName>;
}

const ViewRunPage = ({ state, dispatch, route }: PageProps) => {
    const { redirect } = useRouter();

    const run = findRunById(state, Number(route.params.id));

    if (!run) {
        return (
            <section>
                <h1>No such run</h1>
            </section>
        );
    }

    return (
        <ViewRun
            run={run}
            onDelete={(run) => {
                dispatch({
                    kind: 'delete_run',
                    id: run.id,
                });
                redirect(routes.runs({}));
            }}
        />
    );
};

const CurrentRunPage = ({ state, dispatch, route }: PageProps) => {
    const { redirect } = useRouter();

    const run = state.appConf.currentRun;

    if (!run) {
        return (
            <section>
                <h1>No active run</h1>
            </section>
        );
    }

    return (
        <CurrentRun
            currentRun={run}
            onError={(err) => dispatch(err)}
            onGeoUpdate={(update) => {
                dispatch({
                    kind: 'geo_update_msg',
                    update,
                });
            }}
            onFinishRun={() => {
                dispatch({
                    kind: 'finish_run',
                });
                redirect(routes.viewRun({ id: run.id.toString() }));
            }}
            onPauseResumeRun={(pause) =>
                dispatch({
                    kind: 'pause_resume_run',
                    pause,
                })
            }
        />
    );
};

interface AppWindow {
    state?: State;
    dispatch?: (msg: Action) => void;
}
