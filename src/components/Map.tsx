import { h, useEffect, useRef, Mapbox } from '../deps.ts';
import { getConfig } from '../config.ts';
import { Coords } from '../model/state.ts';
import { coordsToGeoJSON } from '../lib/geo.ts';

Mapbox.accessToken = getConfig('MAPBOX_TOKEN');

interface Props {
    route?: Array<Coords>;
}

export const Map = ({ route }: Props) => {
    const mapEl = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mapEl.current) return;

        const tearDown = mkMap(mapEl.current, route && coordsToGeoJSON(route));

        return tearDown;
    }, []);

    return <div class="Map" ref={mapEl} style="height: 300px"></div>;
};

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
