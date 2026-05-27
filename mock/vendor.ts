/** Vendor / Truck / Crew / Application mock data */

const ok = (data: any) => ({ code: 200, msg: 'success', data });
const page = (list: any[], total?: number) =>
  ok({ list, total: total ?? list.length, pageNum: 1, pageSize: 20, pages: 1 });

const vendors = [
  { id: 1, vendorName: 'FastTrack Transport', vendorTag: 'Preferred', vendorType: 'Corporate', status: 'Accredited', garageLocation: 'Quezon City', region: 'Metro Manila', trucks: 12, bdUserName: 'Alice', accreditationRemainingDays: 180, createdAt: '2024-01-05T08:00:00Z' },
  { id: 2, vendorName: 'Island Cargo Services', vendorTag: 'Regular', vendorType: 'Corporate', status: 'Accredited', garageLocation: 'Lapu-Lapu City', region: 'Cebu', trucks: 8, bdUserName: 'Bob', accreditationRemainingDays: 90, createdAt: '2024-02-10T09:00:00Z' },
  { id: 3, vendorName: 'Juan De la Cruz Hauling', vendorTag: 'Owner Operator', vendorType: 'Individual', status: 'Unaccredited', garageLocation: 'Pasig City', region: 'Metro Manila', trucks: 2, bdUserName: 'Carol', accreditationRemainingDays: 30, createdAt: '2024-03-15T10:00:00Z' },
  { id: 4, vendorName: 'Southern Logistics Corp.', vendorTag: 'Key Partner', vendorType: 'Corporate', status: 'Accredited', garageLocation: 'Davao City', region: 'Davao', trucks: 20, bdUserName: 'Dave', accreditationRemainingDays: 270, createdAt: '2024-04-20T11:00:00Z' },
  { id: 5, vendorName: 'Northern Fleet Inc.', vendorTag: 'New', vendorType: 'Corporate', status: 'Unaccredited', garageLocation: 'Angeles City', region: 'Pampanga', trucks: 5, bdUserName: 'Eve', accreditationRemainingDays: 0, createdAt: '2024-05-25T12:00:00Z' },
];

const trucks = [
  { id: 1, plateNumber: 'ABC-1234', truckTypeName: '10-Wheeler', status: 'Accredited', transportationStatus: 'Available', vanType: 'Closed Van', netCapacity: 10, volume: 40, vendorName: 'FastTrack Transport', vendorTag: 'Preferred', ownership: 'Company-owned', accreditationRemainingDays: 180, updatedAt: '2024-05-01T08:00:00Z', createdAt: '2024-01-05T08:00:00Z' },
  { id: 2, plateNumber: 'DEF-5678', truckTypeName: '6-Wheeler', status: 'Accredited', transportationStatus: 'Transit', vanType: 'Open Truck', netCapacity: 5, volume: 20, vendorName: 'Island Cargo Services', vendorTag: 'Regular', ownership: 'Company-owned', accreditationRemainingDays: 90, updatedAt: '2024-05-10T09:00:00Z', createdAt: '2024-02-10T09:00:00Z' },
  { id: 3, plateNumber: 'GHI-9012', truckTypeName: 'Elf', status: 'Inactive', transportationStatus: 'Available', vanType: 'Reefer', netCapacity: 2, volume: 8, vendorName: 'Juan De la Cruz Hauling', vendorTag: 'Owner Operator', ownership: 'Owner-operated', accreditationRemainingDays: 0, updatedAt: '2024-04-15T10:00:00Z', createdAt: '2024-03-15T10:00:00Z' },
  { id: 4, plateNumber: 'JKL-3456', truckTypeName: '10-Wheeler', status: 'Accredited', transportationStatus: 'Available', vanType: 'Closed Van', netCapacity: 10, volume: 42, vendorName: 'Southern Logistics Corp.', vendorTag: 'Key Partner', ownership: 'Company-owned', accreditationRemainingDays: 270, updatedAt: '2024-05-20T11:00:00Z', createdAt: '2024-04-20T11:00:00Z' },
];

const crew = [
  { id: 1, name: 'Pedro Santos', status: 'Accredited', transportationStatus: 'Available', phone: '+63 912 111 0001', vendorName: 'FastTrack Transport', role: 'Driver', licenseNumber: 'D123456', createdAt: '2024-01-05T08:00:00Z' },
  { id: 2, name: 'Maria Garcia', status: 'Accredited', transportationStatus: 'Transit', phone: '+63 917 222 0002', vendorName: 'Island Cargo Services', role: 'Driver', licenseNumber: 'D234567', createdAt: '2024-02-10T09:00:00Z' },
  { id: 3, name: 'Jose Reyes', status: 'Inactive', transportationStatus: 'Available', phone: '+63 918 333 0003', vendorName: 'Juan De la Cruz Hauling', role: 'Helper', licenseNumber: null, createdAt: '2024-03-15T10:00:00Z' },
];

const applications = [
  { id: 1, vendorName: 'FastTrack Transport', applicationType: 'Accreditation', status: 'Pending', submittedAt: '2024-05-01T08:00:00Z', reviewedAt: null },
  { id: 2, vendorName: 'New Vendor Ltd.', applicationType: 'Registration', status: 'Under Review', submittedAt: '2024-05-15T09:00:00Z', reviewedAt: null },
  { id: 3, vendorName: 'Island Cargo Services', applicationType: 'Reaccreditation', status: 'Approved', submittedAt: '2024-04-10T10:00:00Z', reviewedAt: '2024-04-20T10:00:00Z' },
];

export default {
  // Vendor
  'POST /api/vendor/list': (req: any, res: any) => res.json(page(vendors, 5)),
  'GET /api/vendor/detail': (req: any, res: any) => res.json(ok({ ...vendors[0], contactList: [], followUpRecords: [], truckList: [], driverList: [] })),
  'POST /api/vendor/add': (req: any, res: any) => res.json(ok({ id: Date.now() })),
  'POST /api/vendor/change': (req: any, res: any) => res.json(ok(null)),
  'POST /api/vendor/delete': (req: any, res: any) => res.json(ok(null)),
  'POST /api/vendor/approval': (req: any, res: any) => res.json(ok(null)),
  'POST /api/vendor/terminate': (req: any, res: any) => res.json(ok(null)),
  'POST /api/vendor/re-accredit': (req: any, res: any) => res.json(ok(null)),
  'POST /api/vendor/contact/list': (req: any, res: any) => res.json(page([])),
  'POST /api/vendor/contact/add': (req: any, res: any) => res.json(ok(null)),
  'POST /api/vendor/contact/delete': (req: any, res: any) => res.json(ok(null)),
  'POST /api/vendor/contact/change': (req: any, res: any) => res.json(ok(null)),
  'POST /api/vendor/followRecord/list': (req: any, res: any) => res.json(page([])),
  'POST /api/vendor/followRecord/add': (req: any, res: any) => res.json(ok(null)),
  'POST /api/vendor/followRecord/change': (req: any, res: any) => res.json(ok(null)),
  'POST /api/vendor/followRecord/delete': (req: any, res: any) => res.json(ok(null)),
  'POST /api/vendor/helper/list': (req: any, res: any) => res.json(page([])),
  'POST /api/vendor/helper/add': (req: any, res: any) => res.json(ok(null)),
  'POST /api/vendor/helper/change': (req: any, res: any) => res.json(ok(null)),
  'POST /api/vendor/helper/delete': (req: any, res: any) => res.json(ok(null)),
  'POST /api/vendor/helper/block': (req: any, res: any) => res.json(ok(null)),
  'POST /api/vendor/helper/unblock': (req: any, res: any) => res.json(ok(null)),
  'POST /api/vendor/summary/list': (req: any, res: any) => res.json(page([])),
  'POST /api/vendor/summary/edit': (req: any, res: any) => res.json(ok(null)),
  'POST /api/vendor/summary/delete': (req: any, res: any) => res.json(ok(null)),
  'POST /api/vendor/accreditation/list': (req: any, res: any) => res.json(page([])),
  'POST /api/vendor/accreditation/category/add': (req: any, res: any) => res.json(ok(null)),
  'POST /api/vendor/accreditation/category/delete': (req: any, res: any) => res.json(ok(null)),
  'POST /api/vendor/financial-document/list': (req: any, res: any) => res.json(page([])),
  'POST /api/vendor/financial-document/category/add': (req: any, res: any) => res.json(ok(null)),
  'POST /api/vendor/financial-document/category/delete': (req: any, res: any) => res.json(ok(null)),
  'POST /api/vendor/financial-document/material/delete': (req: any, res: any) => res.json(ok(null)),
  'POST /api/vendor/driver/unbind': (req: any, res: any) => res.json(ok(null)),
  'POST /api/vendor/file-expire-count': (req: any, res: any) => res.json(ok({ count: 0 })),
  'GET /api/vendor/userRole/list': (req: any, res: any) => res.json(ok([])),
  'GET /api/vendor/transfer/list': (req: any, res: any) => res.json(ok([])),
  'GET /api/vendor/driver/list': (req: any, res: any) => res.json(ok(crew.slice(0, 2))),
  'GET /api/vendor/vendor/list': (req: any, res: any) => res.json(ok(vendors)),
  'GET /api/vendor/project': (req: any, res: any) => res.json(ok([])),
  'GET /api/vendor/contract/list': (req: any, res: any) => res.json(ok([])),

  // Trucks
  'POST /api/truck/list': (req: any, res: any) => res.json(page(trucks, 4)),
  'GET /api/truck/detail': (req: any, res: any) => res.json(ok(trucks[0])),
  'POST /api/truck/add': (req: any, res: any) => res.json(ok({ id: Date.now() })),
  'POST /api/truck/change': (req: any, res: any) => res.json(ok(null)),
  'POST /api/truck/approval': (req: any, res: any) => res.json(ok(null)),
  'POST /api/truck/deactivate': (req: any, res: any) => res.json(ok(null)),
  'POST /api/truck/activate': (req: any, res: any) => res.json(ok(null)),
  'POST /api/truck/vendors': (req: any, res: any) => res.json(ok(vendors)),
  'POST /api/truck/checkAttribution': (req: any, res: any) => res.json(ok(false)),
  'POST /api/truck/checkUnable': (req: any, res: any) => res.json(ok(false)),
  'POST /api/truck/checkDuplicate': (req: any, res: any) => res.json(ok(false)),
  'POST /api/truck/file-expire-count': (req: any, res: any) => res.json(ok({ count: 0 })),
  'POST /api/truck/attribution': (req: any, res: any) => res.json(ok(null)),
  'POST /api/truck/truckVendorRef': (req: any, res: any) => res.json(ok(null)),
  'GET /api/truck/truckType': (req: any, res: any) => res.json(ok([{ id: 1, name: '10-Wheeler' }, { id: 2, name: '6-Wheeler' }, { id: 3, name: 'Elf' }, { id: 4, name: 'Boom Truck' }])),
  'GET /api/truck/vendor/list': (req: any, res: any) => res.json(ok(vendors)),
  'GET /api/truck/unbind': (req: any, res: any) => res.json(ok(null)),
  'GET /api/truck/checkUnbind': (req: any, res: any) => res.json(ok(false)),
  'GET /api/truck/accreditation/list': (req: any, res: any) => res.json(ok([])),
  'GET /api/truck/accreditation/category/add': (req: any, res: any) => res.json(ok(null)),
  'GET /api/truck/accreditation/category/delete': (req: any, res: any) => res.json(ok(null)),
  'GET /api/truck/truckVendorRef': (req: any, res: any) => res.json(ok(null)),

  // Crew/Driver
  'POST /api/driver/list': (req: any, res: any) => res.json(page(crew, 3)),
  'GET /api/driver/detail': (req: any, res: any) => res.json(ok(crew[0])),
  'POST /api/driver/add': (req: any, res: any) => res.json(ok({ id: Date.now() })),
  'POST /api/driver/change': (req: any, res: any) => res.json(ok(null)),
  'POST /api/driver/approval': (req: any, res: any) => res.json(ok(null)),
  'POST /api/driver/enable': (req: any, res: any) => res.json(ok(null)),
  'POST /api/driver/batch/transfer': (req: any, res: any) => res.json(ok(null)),
  'POST /api/driver/transfer/list': (req: any, res: any) => res.json(page([])),
  'POST /api/driver/file-expire-count': (req: any, res: any) => res.json(ok({ count: 0 })),
  'GET /api/driver/accreditation/list': (req: any, res: any) => res.json(ok([])),

  'POST /api/crew/list': (req: any, res: any) => res.json(page(crew, 3)),
  'GET /api/crew/detail': (req: any, res: any) => res.json(ok(crew[0])),
  'POST /api/crew/add': (req: any, res: any) => res.json(ok({ id: Date.now() })),
  'POST /api/crew/update': (req: any, res: any) => res.json(ok(null)),
  'POST /api/crew/checkDuplicate': (req: any, res: any) => res.json(ok(false)),
  'POST /api/crew/unbind': (req: any, res: any) => res.json(ok(null)),
  'POST /api/crew/deactivate': (req: any, res: any) => res.json(ok(null)),
  'POST /api/crew/activate': (req: any, res: any) => res.json(ok(null)),
  'POST /api/crew/block': (req: any, res: any) => res.json(ok(null)),
  'POST /api/crew/approval': (req: any, res: any) => res.json(ok(null)),
  'POST /api/crew/activate-check': (req: any, res: any) => res.json(ok(null)),
  'POST /api/crew/attribute': (req: any, res: any) => res.json(ok(null)),
  'POST /api/crew/file-expire-count': (req: any, res: any) => res.json(ok({ count: 0 })),
  'POST /api/crew/accreditation/update': (req: any, res: any) => res.json(ok(null)),
  'POST /api/crew/accreditation/create-version': (req: any, res: any) => res.json(ok(null)),
  'POST /api/crew/accreditation/history': (req: any, res: any) => res.json(ok([])),
  'POST /api/crew/accreditation/version-history': (req: any, res: any) => res.json(ok([])),
  'GET /api/crew/vendor-crew-list': (req: any, res: any) => res.json(ok([])),
  'GET /api/crew/accreditation/list': (req: any, res: any) => res.json(ok([])),
  'GET /api/crew/accreditation/default-category': (req: any, res: any) => res.json(ok([])),

  // Applications
  'POST /api/accred-application/list': (req: any, res: any) => res.json(page(applications, 3)),
  'POST /api/accred-application/check-under-review': (req: any, res: any) => res.json(ok(false)),
  'POST /api/accred-application/vendor/add': (req: any, res: any) => res.json(ok(null)),
  'POST /api/accred-application/reject': (req: any, res: any) => res.json(ok(null)),
  'POST /api/accred-application/approve': (req: any, res: any) => res.json(ok(null)),
  'GET /api/accred-application/vendor/detail': (req: any, res: any) => res.json(ok(applications[0])),
  'GET /api/accred-application/truck/detail': (req: any, res: any) => res.json(ok(trucks[0])),
  'GET /api/accred-application/crew/detail': (req: any, res: any) => res.json(ok(crew[0])),
};
