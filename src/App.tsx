import { h, useEffect } from './deps';
import { NewRun } from './components/NewRun';
import { CurrentRun } from './components/CurrentRun';
import { Runs } from './components/Runs';
import { ViewRun } from './components/ViewRun';
import { Action, useModel } from './model/reducer';
import { AppState, findRunById, State } from './model/state';
import { Route, RouteName, routes, useRouter } from './router';
import { Link } from './components/Link';
import { useHasMounted } from './lib/has-mounted';

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
                        return <ViewRunPage state={state} dispatch={dispatch} route={route} />;

                    case 'runs':
                        return (
                            <section>
                                <Link to={routes.newRun({})} class="btn">
                                    New run
                                </Link>
                                <Runs runs={Object.values(state.appConf.runs)} />
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

                    case 'currentRun':
                        return <CurrentRunPage state={state} dispatch={dispatch} route={route} />;
                }
            })()}
        </main>
    );
};

interface PageProps {
    state: State;
    dispatch: (a: Action) => void;
    route: Route<RouteName>;
}

const ViewRunPage = ({ state, dispatch, route }: PageProps) => {
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

    return (
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

const CurrentRunPage = ({ state, dispatch, route }: PageProps) => {
    const hasMounted = useHasMounted();
    const { redirect } = useRouter();

    if (!hasMounted) {
        return (
            <section>
                <h1>Run {route.params.id}</h1>
            </section>
        );
    }

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
                    id: run.id,
                });
                redirect(routes.viewRun({ id: run.id.toString() }));
            }}
        />
    );
};

interface AppWindow {
    state?: State;
    dispatch?: (msg: Action) => void;
}
