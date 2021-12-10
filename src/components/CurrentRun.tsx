import { h } from '../deps';
import { useEffect, useState } from '../deps';
import { formatTime, formatDuration } from '../lib/dates';
import { startWatchPosition } from '../lib/geo';
import { Coords, positionHasChanged, Err, GeoUpdate, Run, isPaused } from '../model/state';

interface Props {
    currentRun: Run;
    onGeoUpdate: (update: GeoUpdate) => void;
    onError: (err: Err) => void;
    onFinishRun: () => void;
    onPauseResumeRun: (pause: boolean) => void;
}

export const CurrentRun = ({ currentRun, onGeoUpdate, onError, onFinishRun, onPauseResumeRun }: Props) => {
    const paused = isPaused(currentRun);
    const duration = useTimer(currentRun.startedAt, paused);

    useEffect(() => {
        const stopWatchPos = startWatchPosition((pos) => {
            const coords: Coords = [pos.coords.longitude, pos.coords.latitude];

            if (positionHasChanged(currentRun, coords)) {
                onGeoUpdate({
                    coords,
                    timestamp: pos.timestamp,
                });
            }
        }, onError);

        return () => stopWatchPos();
    });

    return (
        <section class="flex flex-col h-full">
            <div class="flex-1">
                <h1>{paused ? 'Paused run' : 'Running'}</h1>
                <table>
                    <tr>
                        <td>
                            <b>Start time</b>
                        </td>
                        <td>{formatTime(currentRun.startedAt)}</td>
                    </tr>
                    <tr>
                        <td>
                            <b>Latest position</b>
                        </td>
                        <td class="numerical">{currentRun.geoUpdates.at(-1)?.coords.join(', ') ?? 'n/a'}</td>
                    </tr>
                    <tr>
                        <td>
                            <b>Duration</b>
                        </td>
                        <td class="numerical">{formatDuration(duration, 'units')}</td>
                    </tr>
                </table>
            </div>

            <div>
                <p>
                    <button class="btn w-full" onClick={() => onPauseResumeRun(!paused)}>
                        {paused ? 'Resume' : 'Pause'}
                    </button>
                </p>

                <button
                    class="btn w-full"
                    onClick={() => {
                        if (confirm('Are you sure?')) {
                            onFinishRun();
                        }
                    }}
                >
                    Finish
                </button>
            </div>
        </section>
    );
};

const useTimer = (initTime: number = Date.now(), isPaused: boolean): number => {
    const [time, setTime] = useState<number>(() => Date.now() - initTime);

    useEffect(() => {
        let id: NodeJS.Timer | null = null;

        if (isPaused) {
            // Be safe
            id && clearInterval(id);
            return;
        }

        id = setInterval(() => {
            setTime(Date.now() - initTime);
        }, 1000);

        return () => id && clearInterval(id);
    }, [initTime, isPaused]);

    return time;
};
