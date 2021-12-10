import { h } from '../deps';

export const MapPlaceholder = ({ height = 300 }: { height?: number }) => {
    return (
        <div class="MapPlaceholder" style={{ height }}>
            Loading map…
        </div>
    );
};
