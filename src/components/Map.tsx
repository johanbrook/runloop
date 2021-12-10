import { h, useEffect, useRef } from '../deps';
import Mapbox from 'mapbox-gl';
import { getConfig } from '../config';
import { Coords } from '../model/state';
import { coordsToGeoJSON } from '../lib/geo';

Mapbox.accessToken = getConfig('MAPBOX_TOKEN');

interface Props {
    route?: Array<Coords>;
    height?: number;
}

const Map = ({ route, height = 300 }: Props) => {
    const mapEl = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mapEl.current) return;

        const tearDown = mkMap(mapEl.current, route && coordsToGeoJSON(route));

        return tearDown;
    }, []);

    // Lazy load the Mapbox CSS – if needed – when <Map /> is rendered
    useEffect(() => {
        const id = 'mapbox-lazy-css';

        if (document.getElementById(id)) return;

        const head = document.getElementsByTagName('head')[0]!;
        const link = document.createElement('link');
        link.id = id;
        link.setAttribute('href', 'https://api.mapbox.com/mapbox-gl-js/v2.6.0/mapbox-gl.css');
        link.setAttribute('rel', 'stylesheet');
        head.insertAdjacentElement('beforeend', link);
    }, []);

    return <div class="Map" ref={mapEl} style={{ height }}></div>;
};

export default Map;

type TearDown = () => void;

const mkMap = (container: HTMLElement, route?: GeoJSON.Feature<GeoJSON.LineString>): TearDown => {
    const map = new Mapbox.Map({
        container,
        style: 'mapbox://styles/mapbox/streets-v11',
        zoom: 15,
        // XXX autocenter?
        center: route ? [route.geometry.coordinates[0][0], route.geometry.coordinates[0][1]] : undefined,
    });

    if (!route) {
        map.addControl(
            new Mapbox.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true,
                },
                trackUserLocation: true,
                showUserHeading: true,
            })
        );
    }

    map.on('load', () => {
        if (route) {
            map.addSource('route', {
                type: 'geojson',
                data: route,
            });

            map.addLayer({
                id: 'route',
                type: 'line',
                source: 'route',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round',
                },
                paint: {
                    'line-color': 'yellow',
                    'line-width': 5,
                },
            });
        }
    });

    return () => {
        map.remove();
    };
};
