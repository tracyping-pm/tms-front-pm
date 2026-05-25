import { Loader, LoaderOptions } from '@googlemaps/js-api-loader';
import { useModel } from '@umijs/max';
import { useCallback, useEffect, useState } from 'react';
import { renderToString } from 'react-dom/server';
import destinationUrl from '../../public/svg/map/destination.svg';
import originUrl from '../../public/svg/map/origin.svg';
import { ReactComponent as RotateLeftIcon } from '../../public/svg/map/rotate-left.svg';
import { ReactComponent as RotateRightIcon } from '../../public/svg/map/rotate-right.svg';
// import stopPointUrl from '../../public/svg/map/stop-point.svg';
import { ReactComponent as TiltDownIcon } from '../../public/svg/map/tilt-down.svg';
import { ReactComponent as TiltUpIcon } from '../../public/svg/map/tilt-up.svg';

export class Overlay {
  constructor() {
    this.overlays = [];
  }
  overlays: any[];
  addOverlay(overlay: any) {
    this.overlays?.push?.(overlay);
  }
  clearOverlays() {
    this.overlays?.forEach?.((overlay) => {
      if (!overlay) {
        return;
      }
      if (overlay.setMap) {
        overlay.setMap(null);
      } else if (overlay.map) {
        overlay.map = null;
      }
    });
  }
}

export const defaultLoaderOptions: LoaderOptions = {
  apiKey: GOOGLE_API_KEY,
  // version: 'weekly',
  region: 'PH',
  // language: 'en',
  libraries: ['routes', 'geometry', 'drawing', 'places', 'marker'],
};

export const defaultMapOptions: google.maps.MapOptions = {
  center: { lat: 14.5995124, lng: 120.9842195 },
  zoom: 10,
  mapTypeControl: false,
  clickableIcons: false,
  draggable: true,
  scrollwheel: true,
  zoomControl: true,
  streetViewControl: false,
  panControl: true,
  scaleControl: true,
  // overviewMapControl: false,
  fullscreenControl: true,
  rotateControl: true,
  minZoom: 3,
  maxZoom: 18,
  mapId: GOOGLE_MAP_ID,
  // styles: styles.hiding,
};

export const polylineMainColor = '#1890FF';
export const defaultStrokeOpacity = 0;
export const highlightStrokeOpacity = 1;
export const dashSymbol: google.maps.Symbol = {
  path: 'M 0,0 L 0,0.5',
  strokeOpacity: 1,
  scale: 5,
};
export const dashSymbolRepeat = '14px';
export const defaultPolylineOptions: google.maps.PolylineOptions = {
  strokeColor: polylineMainColor,
  strokeWeight: 5,
  strokeOpacity: defaultStrokeOpacity,
};

const REGION_CODE: { [key: number]: string } = {
  1: 'PH',
  2: 'TH',
};

const REGION_CENTER: { [key: number]: { lat: number; lng: number } } = {
  1: { lat: 14.5995, lng: 120.9842 }, // Manila
  2: { lat: 13.7563, lng: 100.5018 }, // Bangkok
};

const REGION_CENTER_ADDRESS = {
  1: 'Manila', // Manila
  2: 'Bangkok', // Bangkok
};

export const fitPadding = (bounds: google.maps.LatLngBounds) => {
  const paddingNE = -0.2; // 内缩百分比
  const paddingSW = -0.05; // 内缩百分比
  const neBound = bounds.getNorthEast();
  const swBound = bounds.getSouthWest();

  const ne = { lat: neBound.lat(), lng: neBound.lng() };
  const sw = { lat: swBound.lat(), lng: swBound.lng() };

  const insetNE = {
    lat: ne.lat - (ne.lat - sw.lat) * paddingNE,
    lng: ne.lng - (ne.lng - sw.lng) * paddingNE,
  };

  const insetSW = {
    lat: sw.lat + (ne.lat - sw.lat) * paddingSW,
    lng: sw.lng + (ne.lng - sw.lng) * paddingSW,
  };

  bounds.extend(insetNE);
  bounds.extend(insetSW);
};

export const formatServiceRoutesItem = (
  route: google.maps.DirectionsRoute,
  isMVC?: boolean,
  overlay?: Overlay,
) => {
  const { legs, bounds } = route;

  if (isMVC) {
    fitPadding(bounds);
  }

  // 通过 legs 来构建pathList
  const pathList: google.maps.LatLngLiteral[] = [];

  if (isMVC) {
    legs?.forEach((leg) => {
      const { steps } = leg;
      steps?.forEach((step) => {
        const { path } = step;
        path?.forEach((p) => {
          pathList.push({ lat: p.lat(), lng: p.lng() });
        });
      });
    });
  } else {
    legs?.forEach((leg) => {
      const { steps } = leg;
      steps?.forEach((step) => {
        const { path } = step;
        path?.forEach((p) => {
          // @ts-ignore
          pathList.push({ lat: p.lat, lng: p.lng });
        });
      });
    });
  }

  const distance = legs?.reduce((acc, cur) => {
    return acc + (cur?.distance?.value || 0);
  }, 0);

  const duration = legs?.reduce((acc, cur) => {
    return acc + (cur.duration?.value || 0);
  }, 0);

  const polylineInstance = new google.maps.Polyline(null);
  const markerInstance = new google.maps.marker.AdvancedMarkerElement();
  overlay?.addOverlay?.(polylineInstance);
  overlay?.addOverlay?.(markerInstance);

  return {
    bounds: route.bounds,
    pathList,
    distance, // m
    duration, // s
    summary: route.summary,
    polylineInstance,
    markerInstance,
  };
};

export interface IFormatRoutesItem {
  bounds: google.maps.LatLngBounds;
  pathList: google.maps.LatLngLiteral[];
  distance: number;
  duration: number;
  summary: string;
  polylineInstance?: google.maps.Polyline;
  markerInstance?: google.maps.marker.AdvancedMarkerElement;
}

export interface IFormatRoutesPayload {
  routes: google.maps.DirectionsRoute[];
  isMVC?: boolean;
  map?: google.maps.Map;
  overlay?: Overlay;
}

export const formatServiceRoutes = ({
  routes,
  isMVC = true,
  overlay,
}: IFormatRoutesPayload): IFormatRoutesItem[] => {
  const list = routes.map((route) => {
    return formatServiceRoutesItem(route, isMVC, overlay);
  });

  // 根据距离倒序
  list.sort((a, b) => {
    return b.distance - a.distance;
  });

  return list;
};

export const formatServiceRoutesInstantiated = ({
  routes,
}: IFormatRoutesPayload): IFormatRoutesItem[] => {
  const list = routes.map((route) => {
    const { bounds } = route;
    const boundsInstance = new google.maps.LatLngBounds(bounds);

    return formatServiceRoutesItem(
      {
        ...route,
        bounds: boundsInstance,
      },
      false,
    );
  });

  // 根据距离倒序
  list.sort((a, b) => {
    return b.distance - a.distance;
  });

  return list;
};

export interface IHighlightRouteByIndex {
  routeList: IFormatRoutesItem[];
  index: number;
  map: google.maps.Map;
}

export const highlightRouteByIndex = ({
  routeList,
  index,
  map,
}: IHighlightRouteByIndex) => {
  routeList.forEach((route, idx) => {
    const { pathList, polylineInstance, bounds } = route;
    const isHighlight = idx === index;

    let _polylineInstance = polylineInstance;
    if (!polylineInstance) {
      console.log('🚀🚀🚀～～～地图异步加载容错:');
      _polylineInstance = new google.maps.Polyline(null);
    }

    _polylineInstance?.setOptions({
      map,
      path: pathList,
      ...defaultPolylineOptions,
      strokeOpacity: isHighlight
        ? highlightStrokeOpacity
        : defaultStrokeOpacity,
      zIndex: isHighlight ? 2 : 1,
      clickable: false,
      icons: [
        {
          icon: dashSymbol,
          offset: '0',
          repeat: dashSymbolRepeat,
        },
      ],
    });

    if (isHighlight) {
      map.panToBounds(bounds);
      map.fitBounds(bounds);
    }
    // _polylineInstance.setMap(map);
  });
};

export interface ILaunchRender {
  routeList: IFormatRoutesItem[];
  activeRouteIndex?: number;
  originList: Array<
    google.maps.LatLngLiteral & { address: string; isStop: boolean }
  >;
  destinationList: Array<
    google.maps.LatLngLiteral & { address: string; isStop: boolean }
  >;
  map: google.maps.Map;
  overlay?: Overlay;
}

export const launchRender = ({
  routeList,
  activeRouteIndex = 0,
  originList,
  destinationList,
  map,
  overlay,
}: ILaunchRender) => {
  // 默认高亮第一条
  highlightRouteByIndex({ routeList, map, index: activeRouteIndex });

  let originListMarker: google.maps.marker.AdvancedMarkerElement[] = [];

  originList.forEach((origin) => {
    const content = document.createElement('img');
    // content.src = origin.isStop ? stopPointUrl : originUrl;
    content.src = originUrl;

    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: origin,
      content,
      zIndex: 1,
    });
    overlay?.addOverlay?.(marker);
    originListMarker.push(marker);
  });

  let destinationListMarker: google.maps.marker.AdvancedMarkerElement[] = [];
  destinationList.forEach((destination) => {
    const content = document.createElement('img');
    // content.src = destination.isStop ? stopPointUrl : destinationUrl;
    content.src = destinationUrl;

    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: destination,
      content,
      zIndex: 1,
    });
    overlay?.addOverlay?.(marker);
    destinationListMarker.push(marker);
  });

  // 添加infoWindow
  const infoWindow = new google.maps.InfoWindow({
    // position: point,
    // disableAutoPan: true,
    maxWidth: 300,
    zIndex: 2,
  });
  overlay?.addOverlay?.(infoWindow);

  const allMarker = [...originListMarker, ...destinationListMarker];
  const pointList = [...originList, ...destinationList];
  // allMarker绑定事件
  allMarker.forEach((marker, index) => {
    // https://stackoverflow.com/questions/76860379/google-maps-advancedmarker-hover-listener-function-not-working
    marker.addListener('click', () => {});
    marker.content?.addEventListener('mouseover', () => {
      const point = pointList[index];
      const content = `
      <div style="background: white; padding: 4px">
        ${point?.address}
      </div>

      <style>
        .gm-ui-hover-effect {
          display: none !important;
        }
      </style>
      `;
      infoWindow.setContent(content);
      infoWindow.open({ map, anchor: marker });
    });

    marker.content?.addEventListener('mouseout', () => {
      infoWindow.close();
    });
  });
};

type ILoaderOptions = Omit<LoaderOptions, 'apiKey'> & {
  tiltRotationControl?: boolean;
};

export const useGoogleMap = (loaderOptions?: ILoaderOptions) => {
  // const service = new google.maps.places.AutocompleteService();
  // const directionsRenderer = new google.maps.DirectionsRenderer();
  // const polyline = new google.maps.Polyline( );
  // google.maps.geometry.encoding.encodePath();
  // google.maps.geometry.encoding.decodePath();

  const { tiltRotationControl = true } = loaderOptions ?? {};
  const { initialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId ?? 1;
  const region = REGION_CODE[countryId];
  const center = REGION_CENTER[countryId];
  // @ts-ignore
  const centerAddress = REGION_CENTER_ADDRESS[countryId];
  const [ready, setReady] = useState<boolean>(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapLoading, setMapLoading] = useState<boolean>(false);
  const [overlay, setOverlay] = useState<Overlay>();

  const initLoader = useCallback(() => {
    const loader = new Loader({
      ...defaultLoaderOptions,
      ...loaderOptions,
      region: region,
    });

    const allPromise: Array<Promise<any>> = [];
    defaultLoaderOptions.libraries?.forEach((library) => {
      allPromise.push(loader.importLibrary(library));
    });

    Promise.all(allPromise)
      .then(() => {
        setReady(true);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {});
  }, []);

  const initMap = useCallback(
    (
      containerEl: HTMLElement,
      mapOptions?: google.maps.MapOptions,
      loaderOptionsVal?: LoaderOptions,
    ) => {
      setMapLoading(true);
      const loader = new Loader({
        ...defaultLoaderOptions,
        ...loaderOptionsVal,
        region: region,
      });

      const allPromise: Array<Promise<any>> = [];
      defaultLoaderOptions.libraries?.forEach((library) => {
        allPromise.push(loader.importLibrary(library));
      });

      Promise.all(allPromise)
        .then(() => {
          const newMap = new google.maps.Map(containerEl, {
            ...defaultMapOptions,
            ...mapOptions,
            center: center,
          });

          google.maps.event.addListenerOnce(newMap, 'tilesloaded', function () {
            setMapLoading(false);
            setMap(newMap);
            const newOverlay = new Overlay();
            setOverlay(newOverlay);
          });
        })
        .catch((e) => {
          console.log(e);
        })
        .finally(() => {});
    },
    [],
  );

  useEffect(() => {
    initLoader();

    return () => {
      setReady(false);
    };
  }, []);

  useEffect(() => {
    if (!map || !tiltRotationControl) {
      return;
    }

    const adjustMap = function (mode: string, amount: number) {
      switch (mode) {
        case 'tilt':
          map.setTilt(map.getTilt()! + amount);
          break;
        case 'rotate':
          map.setHeading(map.getHeading()! + amount);
          break;
        default:
          break;
      }
    };

    const buttons: [
      string,
      string,
      string,
      number,
      google.maps.ControlPosition,
    ][] = [
      [
        renderToString(<RotateLeftIcon />),
        'Rotate Left',
        'rotate',
        20,
        google.maps.ControlPosition.LEFT_CENTER,
      ],
      [
        renderToString(<RotateRightIcon />),
        'Rotate Right',
        'rotate',
        -20,
        google.maps.ControlPosition.RIGHT_CENTER,
      ],
      [
        renderToString(<TiltDownIcon />),
        'Tilt Down',
        'tilt',
        90,
        google.maps.ControlPosition.TOP_CENTER,
      ],
      [
        renderToString(<TiltUpIcon />),
        'Tilt Up',
        'tilt',
        -90,
        google.maps.ControlPosition.BOTTOM_CENTER,
      ],
    ];

    buttons.forEach(([icon, text, mode, amount, position]) => {
      const controlDiv = document.createElement('div');

      controlDiv.classList.add('google-map-rotate-tilt');
      // controlDiv.innerHTML = `<img src="${icon}" alt="${text}" width="32" height="32" />`;
      controlDiv.innerHTML = icon;
      controlDiv.title = text;
      controlDiv.addEventListener('click', () => {
        adjustMap(mode, amount);
      });
      map.controls[position].push(controlDiv);
    });
  }, [map]);

  return {
    ready,
    map,
    mapLoading,
    initMap,
    overlay,
    region,
    center,
    centerAddress,
    // language: 'en',
  };
};
