export const data = [
  {
    projectId: 1,
    customerId: 1,
    projectName: 'test Project',
    industryId: 0,
    industryName: 'test industryName',
    routeLibraryId: 0,
    routeLibraryName: 'test routeLibraryName',
    routeIds: 'string',
    routeNum: 0,
    mileage: 0,
    requirementFrequency: 'On Call - Stable Volume',
    routeLibraryCreateTime: '2025-07-23 23:23:23',
    dataByRoute: [
      {
        originAddress: 'test originAddress',
        destinationAddress: 'test destinationAddress',
        totalDeliveryTrips: 10,
        customerData: {
          merchantId: 1,
          merchantName: 'customer Name',
          totalRouteDeliveredTrips: 20,
          priceVersionList: [
            {
              priceVersionId: 0,
              validityPeriod: ' 2025-07-01 - 2025-07-01',
              priceVersionStatus: 'status',
              truckTypeList: [
                {
                  truckTypeId: 1,
                  truckTypeName: '1*10',
                  versionPrice: 30,
                  deliveredTrips: 30,
                },
                {
                  truckTypeId: 12,
                  truckTypeName: '2*10',
                  versionPrice: 40,
                  deliveredTrips: 40,
                },
              ],
            },
            {
              priceVersionId: 10,
              validityPeriod: ' 2025-07-01 - 2025-07-03',
              priceVersionStatus: 'status 1',
              truckTypeList: [
                {
                  truckTypeId: 1,
                  truckTypeName: '1*10',
                  versionPrice: 10,
                  deliveredTrips: 10,
                },
                {
                  truckTypeId: 12,
                  truckTypeName: '2*10',
                  versionPrice: 20,
                  deliveredTrips: 20,
                },
              ],
            },
          ],
        },
        vendorData: [
          {
            merchantId: 1,
            merchantName: 'vendorData Name1',
            totalRouteDeliveredTrips: 30,
            priceVersionList: [
              {
                priceVersionId: 0,
                validityPeriod: ' 2025-06-21 - 2025-07-01',
                priceVersionStatus: 'vendorData status`',
                truckTypeList: [
                  {
                    truckTypeId: 1,
                    truckTypeName: '1*10',
                    versionPrice: 130,
                    deliveredTrips: 130,
                  },
                  {
                    truckTypeId: 12,
                    truckTypeName: '2*10',
                    versionPrice: 40,
                    deliveredTrips: 40,
                  },
                ],
              },
              {
                priceVersionId: 10,
                validityPeriod: ' 2025-05-31 - 2025-07-03',
                priceVersionStatus: ' vendorDatastatus 1',
                truckTypeList: [
                  {
                    truckTypeId: 1,
                    truckTypeName: '1*10',
                    versionPrice: 110,
                    deliveredTrips: 210,
                  },
                  {
                    truckTypeId: 12,
                    truckTypeName: '2*10',
                    versionPrice: 230,
                    deliveredTrips: 420,
                  },
                ],
              },
            ],
          },
          {
            merchantId: 2,
            merchantName: 'vendorData Name2',
            totalRouteDeliveredTrips: 40,
            priceVersionList: [
              {
                priceVersionId: 2,
                validityPeriod: ' 2025-06-21 - 2025-07-01',
                priceVersionStatus: 'vendorData status2',
                truckTypeList: [
                  {
                    truckTypeId: 1,
                    truckTypeName: '1*10',
                    versionPrice: 1302,
                    deliveredTrips: 1302,
                  },
                  {
                    truckTypeId: 12,
                    truckTypeName: '2*10',
                    versionPrice: 402,
                    deliveredTrips: 402,
                  },
                ],
              },
              {
                priceVersionId: 120,
                validityPeriod: ' 2025-05-31 - 2025-07-03',
                priceVersionStatus: ' vendorDatastatus 2',
                truckTypeList: [
                  {
                    truckTypeId: 1,
                    truckTypeName: '1*10',
                    versionPrice: 1102,
                    deliveredTrips: 2102,
                  },
                  {
                    truckTypeId: 12,
                    truckTypeName: '2*10',
                    versionPrice: 2302,
                    deliveredTrips: 4202,
                  },
                ],
              },
            ],
          },
          {
            merchantId: 3,
            merchantName: 'vendorData Name3',
            totalRouteDeliveredTrips: 3333,
            priceVersionList: [
              {
                priceVersionId: 2,
                validityPeriod: ' 2025-06-21 - 2025-07-01',
                priceVersionStatus: 'vendorData status333',
                truckTypeList: [
                  {
                    truckTypeId: 1,
                    truckTypeName: '1*10',
                    versionPrice: 1302,
                    deliveredTrips: 1302,
                  },
                  {
                    truckTypeId: 12,
                    truckTypeName: '2*10',
                    versionPrice: 402,
                    deliveredTrips: 402,
                  },
                ],
              },
              {
                priceVersionId: 120,
                validityPeriod: ' 2025-05-31 - 2025-07-03',
                priceVersionStatus: ' vendorDatastatus 333',
                truckTypeList: [
                  {
                    truckTypeId: 1,
                    truckTypeName: '1*10',
                    versionPrice: 1102,
                    deliveredTrips: 2102,
                  },
                  {
                    truckTypeId: 12,
                    truckTypeName: '2*10',
                    versionPrice: 2302,
                    deliveredTrips: 4202,
                  },
                ],
              },
            ],
          },
          {
            merchantId: 4,
            merchantName: 'vendorData Name4',
            totalRouteDeliveredTrips: 444,
            priceVersionList: [
              {
                priceVersionId: 2,
                validityPeriod: ' 2025-06-21 - 2025-07-01',
                priceVersionStatus: 'vendorData status4444',
                truckTypeList: [
                  {
                    truckTypeId: 1,
                    truckTypeName: '1*10',
                    versionPrice: 1302,
                    deliveredTrips: 1302,
                  },
                  {
                    truckTypeId: 12,
                    truckTypeName: '2*10',
                    versionPrice: 402,
                    deliveredTrips: 402,
                  },
                ],
              },
              {
                priceVersionId: 120,
                validityPeriod: ' 2025-05-31 - 2025-07-03',
                priceVersionStatus: ' vendorDatastatus 44444',
                truckTypeList: [
                  {
                    truckTypeId: 1,
                    truckTypeName: '1*10',
                    versionPrice: 1102,
                    deliveredTrips: 2102,
                  },
                  {
                    truckTypeId: 12,
                    truckTypeName: '2*10',
                    versionPrice: 2302,
                    deliveredTrips: 4202,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        originAddress: 'test originAddress 2222',
        destinationAddress: 'test destinationAddress2222',
        totalDeliveryTrips: 2222,
        customerData: {
          merchantId: 2,
          merchantName: 'customer Name2222',
          totalRouteDeliveredTrips: 230,
          priceVersionList: [
            {
              priceVersionId: 2,
              validityPeriod: ' 2025-07-01 - 2025-07-01',
              priceVersionStatus: 'status',
              truckTypeList: [
                {
                  truckTypeId: 2,
                  truckTypeName: '14*10',
                  versionPrice: 30,
                  deliveredTrips: 30,
                },
                {
                  truckTypeId: 22,
                  truckTypeName: '24*10',
                  versionPrice: 40,
                  deliveredTrips: 40,
                },
              ],
            },
            {
              priceVersionId: 22,
              validityPeriod: ' 2025-07-01 - 2025-07-03',
              priceVersionStatus: 'status 1',
              truckTypeList: [
                {
                  truckTypeId: 2,
                  truckTypeName: '14*10',
                  versionPrice: 10,
                  deliveredTrips: 10,
                },
                {
                  truckTypeId: 22,
                  truckTypeName: '24*10',
                  versionPrice: 20,
                  deliveredTrips: 20,
                },
              ],
            },
          ],
        },
        vendorData: [
          {
            merchantId: 2,
            merchantName: 'vendorData Name',
            totalRouteDeliveredTrips: 60,
            priceVersionList: [
              {
                priceVersionId: 2,
                validityPeriod: ' 2025-06-21 - 2025-07-01',
                priceVersionStatus: 'vendorData status',
                truckTypeList: [
                  {
                    truckTypeId: 2,
                    truckTypeName: '14*10',
                    versionPrice: 130,
                    deliveredTrips: 130,
                  },
                  {
                    truckTypeId: 22,
                    truckTypeName: '24*10',
                    versionPrice: 40,
                    deliveredTrips: 40,
                  },
                ],
              },
              {
                priceVersionId: 22,
                validityPeriod: ' 2025-05-31 - 2025-07-03',
                priceVersionStatus: ' vendorDatastatus 1',
                truckTypeList: [
                  {
                    truckTypeId: 2,
                    truckTypeName: '14*10',
                    versionPrice: 110,
                    deliveredTrips: 210,
                  },
                  {
                    truckTypeId: 22,
                    truckTypeName: '24*10',
                    versionPrice: 230,
                    deliveredTrips: 420,
                  },
                ],
              },
            ],
          },
          {
            merchantId: 22,
            merchantName: 'vendorData Name',
            totalRouteDeliveredTrips: 70,
            priceVersionList: [
              {
                priceVersionId: 2,
                validityPeriod: ' 2025-06-21 - 2025-07-01',
                priceVersionStatus: 'vendorData status',
                truckTypeList: [
                  {
                    truckTypeId: 2,
                    truckTypeName: '14*10',
                    versionPrice: 1302,
                    deliveredTrips: 1302,
                  },
                  {
                    truckTypeId: 22,
                    truckTypeName: '24*10',
                    versionPrice: 402,
                    deliveredTrips: 402,
                  },
                ],
              },
              {
                priceVersionId: 22,
                validityPeriod: ' 2025-05-31 - 2025-07-03',
                priceVersionStatus: ' vendorDatastatus 1',
                truckTypeList: [
                  {
                    truckTypeId: 2,
                    truckTypeName: '1*10',
                    versionPrice: 1102,
                    deliveredTrips: 2102,
                  },
                  {
                    truckTypeId: 22,
                    truckTypeName: '2*10',
                    versionPrice: 2302,
                    deliveredTrips: 4202,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];
