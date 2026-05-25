import _ from 'lodash';
import pako from 'pako';

// 压缩
export const zip = (data: any) => {
  if (!data) return data;

  const dataJson =
    typeof data !== 'string' && typeof data !== 'number'
      ? JSON.stringify(data)
      : data;

  const str = encodeURIComponent(dataJson);

  const binaryString = pako.gzip(str);

  const arr = Array.from(binaryString);

  let s = '';
  arr.forEach((item) => {
    s += String.fromCharCode(item);
  });

  return btoa(s);
};

// 解压
export const unzip = (compressedData: any): any => {
  const chunk = 8 * 1024;
  const strData = atob(compressedData);
  const charData = strData.split('').map(function (x) {
    return x.charCodeAt(0);
  });

  const binData = new Uint8Array(charData);

  const data = pako.ungzip(binData);

  // start 切片处理数据，防止内存溢出报错
  let str = '';

  let i;
  for (i = 0; i < data.length / chunk; i++) {
    str += String.fromCharCode(...data.slice(i * chunk, (i + 1) * chunk));
  }

  str += String.fromCharCode(...data.slice(i * chunk));
  // end 切片处理数据，防止内存溢出报错

  const unzipStr = decodeURIComponent(str);

  let result = '';

  try {
    result = JSON.parse(unzipStr);
  } catch (err) {
    // 基本数据类型无法parse，进入catch直接赋值即可
    result = unzipStr;
  }

  return result;
};

export const getPathByRoute = (route: google.maps.DirectionsRoute) => {
  const { legs } = route;
  // 通过 legs 来构建pathList
  const pathList: google.maps.LatLngLiteral[] = [];
  legs?.forEach((leg) => {
    const { steps } = leg;
    steps?.forEach((step) => {
      const { path } = step;
      path?.forEach((p) => {
        const lat = _.isFunction(p.lat) ? p.lat() : p.lat;
        const lng = _.isFunction(p.lng) ? p.lng() : p.lng;
        // @ts-ignore
        pathList.push({ lat, lng });
      });
    });
  });

  return pathList;
};

export const getDirectionsServiceParamsByPointList = (
  pointList: google.maps.LatLngLiteral[],
) => {
  if (pointList?.length < 2) {
    throw new Error('pointList length must be greater than 2');
  }

  const _pointList = pointList.map((item) => {
    return { lat: item.lat, lng: item.lng };
  });

  const origin = _pointList[0];
  const destination = _pointList[pointList.length - 1];

  const waypoints = _pointList.slice(1, pointList.length - 1)?.map((item) => {
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
};

export const getGoogleMapRoute = (
  params: Partial<google.maps.DirectionsRequest>,
): Promise<any> => {
  const defaultParams: Partial<google.maps.DirectionsRequest> = {
    travelMode: window.google.maps.TravelMode.DRIVING,
    provideRouteAlternatives: false,
    // optimizeWaypoints: true,
  };

  const directionsService = new window.google.maps.DirectionsService();

  return new Promise((resolve, reject) => {
    directionsService
      // @ts-ignore
      .route({ ...defaultParams, ...params })
      .then((res: google.maps.DirectionsResult) => {
        const { routes } = res;
        if (routes?.length > 0) {
          const pathList = getPathByRoute(routes[0]);
          resolve(pathList);
        } else {
          reject('no routes');
        }
      })
      .catch((err: any) => {
        reject(err);
      })
      .finally(() => {});
  });
};

export const getDistanceAndDurationByRoute = (
  route: google.maps.DirectionsRoute,
) => {
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
};

export const getSortRoutes = (routes: google.maps.DirectionsRoute[]) => {
  // 对 routes 进行排序, distance 从大到小
  const sortRoutes = routes.sort((a, b) => {
    const aDistance = getDistanceAndDurationByRoute(a).distance;
    const bDistance = getDistanceAndDurationByRoute(b).distance;
    return bDistance - aDistance;
  });

  return sortRoutes;
};

export const splitPoints = (
  pointList: google.maps.LatLngLiteral[],
  chunkSize: number = 10,
) => {
  const result = [];

  for (let i = 0; i < pointList.length; i += chunkSize) {
    result.push(pointList.slice(i, i + chunkSize));
  }

  const lastIndex = result.length - 1;
  const last = result[lastIndex];

  if (last.length < 2) {
    result.splice(lastIndex, 1);
    const newLast = result[result.length - 1];
    newLast.push(...last);
  }

  return result;
};
