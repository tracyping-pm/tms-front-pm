import {
  getDirectionsServiceParamsByPointList,
  getGoogleMapRoute,
  splitPoints,
} from './map';

export interface IPoint extends google.maps.LatLngLiteral {
  address?: string;
}

export class SplitMapPoints {
  private pointList: IPoint[];

  constructor(pointList: IPoint[]) {
    this.pointList = pointList;
  }

  public async getResult(): Promise<IPoint[]> {
    const result = splitPoints(this.pointList);
    const allRequest: Array<Promise<any>> = [];

    result.forEach((group) => {
      const serviceParams = getDirectionsServiceParamsByPointList(group);
      allRequest.push(getGoogleMapRoute(serviceParams));
    });

    return new Promise((resolve, reject) => {
      Promise.all(allRequest)
        .then((resp) => {
          let list: any[] = [];
          resp.forEach((group) => {
            list = list.concat(group);
          });
          resolve(list);
        })
        .catch((err: any) => {
          console.error(err);
          reject(err);
        })
        .finally(() => {});
    });
  }
}
