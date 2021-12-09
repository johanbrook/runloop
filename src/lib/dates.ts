type Millis = number;

interface DateTimeFormat extends Intl.DateTimeFormat {
    formatRange: (start: Date, end: Date) => string;
}

export const formatTime = (ms: number) => timeFormatter.format(new Date(ms));

export const formatDate = (ms: number) => dateFormatter.format(new Date(ms));

export const formatRange = (start: number, end: number) =>
    (dateFormatter as DateTimeFormat).formatRange(new Date(start), new Date(end));

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeStyle: 'short',
});

export const formatDuration = (durMs: Millis, format: 'numerical' | 'units') => {
    const totalSecs = durMs / 1_000;
    const secs = Math.floor(totalSecs % 60);
    const mins = Math.floor(totalSecs / 60);
    const hours = Math.floor(mins / 60);

    const ret = [];

    if (format == 'units') {
        if (hours > 0) ret.push(hours + ' h');
        if (mins > 0) ret.push(mins + ' m');
        ret.push(secs + ' s');

        return ret.join(' ');
    } else {
        if (hours > 0) ret.push(pad(hours));
        if (mins > 0) ret.push(pad(mins));
        ret.push(pad(secs));

        return ret.join(':');
    }
};

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

export const formatRunTitle = (startedAt: Millis): string => {
    const hours = new Date(startedAt).getHours();
    let prev: string = 'A nice';

    for (const [hour, name] of Object.entries(INTERVALS)) {
        if (hours > parseInt(hour, 10)) {
            prev = name;
            continue;
        }
        return prev;
    }

    return prev;
};

export const pad = (num: number) => (num < 10 ? `0${num}` : num);
