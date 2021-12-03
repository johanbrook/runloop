import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { formatTime, formatDuration } from '../lib/dates.ts';
import { startWatchPosition } from '../lib/geo.ts';
import { Coords, positionHasChanged, Err, GeoUpdate, Run } from '../model/state.ts';

interface Props {
    currentRun: Run;
    onGeoUpdate: (update: GeoUpdate) => void;
    onError: (err: Err) => void;
    onFinishRun: () => void;
}

export const CurrentRun = ({ currentRun, onGeoUpdate, onError, onFinishRun }: Props) => {
    const duration = useTimer(currentRun.startedAt);

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
        <section>
            <h1>Running</h1>
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
                    <td>{currentRun.geoUpdates.at(-1)?.coords.join(', ') ?? 'n/a'}</td>
                </tr>
                <tr>
                    <td>
                        <b>Duration</b>
                    </td>
                    <td>{formatDuration(duration, 'units')}</td>
                </tr>
            </table>

            <button class="btn" onClick={onFinishRun}>
                Finish run
            </button>
        </section>
    );
};

const useTimer = (initTime: number = Date.now()) => {
    const [time, setTime] = useState<number>(() => Date.now() - initTime);

    useEffect(() => {
        const id = setInterval(() => {
            setTime(Date.now() - initTime);
        }, 1000);

        return () => clearInterval(id);
    }, [initTime]);

    return time;
};
