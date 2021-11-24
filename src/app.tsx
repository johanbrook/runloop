interface Err {
    kind: 'err';
    message: string;
    cause?: Error;
}

type StopWatching = () => void;

const startWatchPosition = (
    onUpdate: (pos: GeolocationPosition) => void,
    onError: (err: Err) => void
): StopWatching => {
    const id = navigator.geolocation.watchPosition(
        onUpdate,
        (err) =>
            onError({
                kind: 'err',
                message: 'Error when watching GPS location',
                cause: new Error(err.message),
            }),
        {
            enableHighAccuracy: true,
        }
    );

    return () => navigator.geolocation.clearWatch(id);
};

const init = () => {
    startWatchPosition(console.log, console.error);
};

init();
