import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { NewRun } from './components/NewRun.tsx';
import { CurrentRun } from './components/CurrentRun.tsx';
import { Runs } from './components/Runs.tsx';
import { ViewRun } from './components/ViewRun.tsx';
import { Action, usePersistReducer } from './model/reducer.ts';
import { AppState, findRunById, State } from './model/state.ts';
import { Route, RouteName, routes } from './router.tsx';
import { Link } from './components/Link.tsx';
import { useHasMounted } from './lib/has-mounted.ts';

interface Props {
    route: Route<RouteName>;
}

export const App = ({ route }: Props) => {
    const [state, dispatch] = usePersistReducer();

    // leak state for easy console debugging
    (window as AppWindow).state = state;
    (window as AppWindow).dispatch = dispatch;

    if (state.appState == AppState.Failed) {
        return (
            <section>
                <h1>Failure</h1>
                <p>{state.err?.msg || 'Unknown error'}</p>
            </section>
        );
    }

    return (
        <main>
            {(() => {
                switch (route.name) {
                    case 'viewRun':
                        return <ViewRunRoute state={state} dispatch={dispatch} route={route} />;

                    case 'runs':
                        return (
                            <section>
                                <Link to={routes.newRun({})} class="btn">
                                    New run
                                </Link>
                                <Runs runs={state.appConf.runs} />
                            </section>
                        );

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
                }
            })()}
        </main>
    );
};

const ViewRunRoute = ({
    state,
    dispatch,
    route,
}: {
    state: State;
    dispatch: (a: Action) => void;
    route: Route<RouteName>;
}) => {
    const hasMounted = useHasMounted();

    if (!hasMounted) {
        return (
            <section>
                <h1>Run {route.params.id}</h1>
            </section>
        );
    }

    const run = findRunById(state, Number(route.params.id));

    if (!run) {
        return (
            <section>
                <h1>No such run</h1>
            </section>
        );
    }

    return !run.finishedAt ? (
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
            }}
        />
    ) : (
        <ViewRun
            run={run}
            onDelete={(run) =>
                dispatch({
                    kind: 'delete_run',
                    id: run.id,
                })
            }
        />
    );
};

interface AppWindow {
    state?: State;
    dispatch?: (msg: Action) => void;
}
