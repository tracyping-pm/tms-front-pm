export interface IPlaceRecord {
  id: number;
  description: string;
}

export interface IPlaceGeoRecord {
  id: number;
  name: string;
}

export interface IPlaceGeoResolveAddressResult {
  pad: number;
  padName: string;
  sad: number;
  sadName: string;
  tad: number;
  tadName: string;
}
