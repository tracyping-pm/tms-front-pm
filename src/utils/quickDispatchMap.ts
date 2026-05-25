import { zip } from './map';

interface IResult {
  mapJsonStr: string;
  distance: number;
  duration: number;
}

export interface IPoint extends google.maps.LatLngLiteral {
  address: string;
}

export class QuickDispatchMapClass {
  private region: string;
  private language?: string;
  private routeFilter: {
    highways: string;
    ferries: string;
    tolls: string;
  };
  private pointList: IPoint[];

  constructor(pointList: IPoint[], region: string, language?: string) {
    this.region = region;
    this.language = language;
    this.pointList = pointList;
    this.routeFilter = {
      highways: 'Allow',
      ferries: 'Allow',
      tolls: 'Allow',
    };
  }

  private getRouteFilter() {
    return this.routeFilter;
  }

  private getDirectionsServiceParams() {
    if (this.pointList?.length < 2) {
      throw new Error('pointList length must be greater than 2');
    }

    const _pointList = this.pointList.map((item) => {
      return { lat: item.lat, lng: item.lng };
    });

    const origin = _pointList[0];
    const destination = _pointList[this.pointList.length - 1];

    const waypoints = _pointList
      .slice(1, this.pointList.length - 1)
      ?.map((item) => {
        return {
          location: item,
          stopover: true,
        };
      });

    return {
      origin,
      waypoints,
      destination,
    };
  }

  private formatServiceRoutesItem(route: google.maps.DirectionsRoute) {
    const { legs } = route;
    const distance = legs?.reduce((acc, cur) => {
      return acc + (cur?.distance?.value || 0);
    }, 0);

    const duration = legs?.reduce((acc, cur) => {
      return acc + (cur.duration?.value || 0);
    }, 0);
    return {
      distance,
      duration,
    };
  }

  private getMaxDistanceRoute(routes: google.maps.DirectionsRoute[]) {
    const list = routes.map((route) => {
      return this.formatServiceRoutesItem(route);
    });
    list.sort((a, b) => {
      return b.distance - a.distance;
    });

    return list[0];
  }

  private getMapJsonStr(routeList: google.maps.DirectionsRoute[]): string {
    const originList = [this.pointList[0]];
    const destinationList = [this.pointList[this.pointList.length - 1]];
    const routes = routeList?.map((item) => {
      return {
        bounds: item.bounds,
        legs: item.legs,
        summary: item.summary,
      };
    });

    const obj = {
      routeFilter: this.routeFilter,
      routes: routes,
      activeRouteIndex: 0,
      originList,
      destinationList,
    };

    const compressed = zip(obj);
    return compressed;
  }

  public async getResult(): Promise<IResult> {
    const { origin, waypoints, destination } =
      this.getDirectionsServiceParams();
    const routeFilter = this.getRouteFilter();
    const params: google.maps.DirectionsRequest = {
      origin,
      waypoints,
      destination,
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true,
      avoidHighways: routeFilter.highways === 'Avoid',
      avoidFerries: routeFilter.ferries === 'Avoid',
      avoidTolls: routeFilter.tolls === 'Avoid',
      region: this.region,
      // language: this.language,
    };

    const directionsService = new window.google.maps.DirectionsService();

    return new Promise((resolve, reject) => {
      directionsService
        .route({ ...params })
        .then((res: google.maps.DirectionsResult) => {
          const { routes } = res;
          if (routes?.length > 0) {
            const maxDistanceRoute = this.getMaxDistanceRoute(routes);
            const result = {
              mapJsonStr: this.getMapJsonStr(routes),
              distance: maxDistanceRoute.distance,
              duration: maxDistanceRoute.duration,
            };
            resolve(result);
          } else {
            console.error('no routes');
            reject('no routes');
          }
        })
        .catch((err: any) => {
          console.error(err);
          reject(err);
        })
        .finally(() => {});
    });
  }
}
