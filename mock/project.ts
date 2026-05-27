/** Project / Waybill / Subtask / Transmittal / Capacity Pool / Claim mock data */

const ok = (data: any) => ({ code: 200, msg: 'success', data });
const page = (list: any[], total?: number) =>
  ok({ list, total: total ?? list.length, pageNum: 1, pageSize: 20, pages: 1 });

const projects = [
  { id: 1, projectName: 'Metro Manila Distribution 2024', customerName: 'ABC Logistics Co.', customerTag: 'Key Account', logisticsCategory: 'transportation', serviceCategory: 'Truck Transport', logisticsFlow: 'B2B', distance: 'Intercity', projectStatus: 'inProgress', transportationStatus: 'Active', financialStatus: 'Normal', createdAt: '2024-01-10T08:00:00Z' },
  { id: 2, projectName: 'Cebu Cold Chain Operations', customerName: 'XYZ Trading Inc.', customerTag: 'SME', logisticsCategory: 'transportation', serviceCategory: 'CC+Delivery', logisticsFlow: 'B2C', distance: 'Intracity', projectStatus: 'preparing', transportationStatus: 'Inactive', financialStatus: 'Normal', createdAt: '2024-02-15T09:00:00Z' },
  { id: 3, projectName: 'Mindanao Pharma Express', customerName: 'Southeast Pharma', customerTag: 'Key Account', logisticsCategory: 'freightForwarding', serviceCategory: 'Truck Transport', logisticsFlow: 'B2B', distance: 'Long Haul', projectStatus: 'inProgress', transportationStatus: 'Active', financialStatus: 'Normal', createdAt: '2024-03-20T10:00:00Z' },
  { id: 4, projectName: 'NCR Retail Distribution', customerName: 'Manila Fresh Foods', customerTag: 'New', logisticsCategory: 'transportation', serviceCategory: 'Truck Transport', logisticsFlow: 'B2B', distance: 'Intercity', projectStatus: 'suspended', transportationStatus: 'Inactive', financialStatus: 'Hold', createdAt: '2024-04-05T11:00:00Z' },
  { id: 5, projectName: 'Pampanga Construction Haul', customerName: 'Island Builders Corp.', customerTag: 'SME', logisticsCategory: 'transportation', serviceCategory: 'Truck Transport', logisticsFlow: 'B2B', distance: 'Intracity', projectStatus: 'completed', transportationStatus: 'Inactive', financialStatus: 'Completed', createdAt: '2024-05-12T12:00:00Z' },
];

const waybills = [
  { id: 1, waybillNumber: 'WB-2024-001', projectId: 1, customerName: 'ABC Logistics Co.', customerTag: 'Key Account', status: 'In Transit', financialStatus: 'Awaiting Settlement', plateNumber: 'ABC-1234', truckId: 1, vendorId: 1, driverId: 1, dispatchType: 'Standard Dispatch', originPadId: 1, destinationPadId: 2, positionTime: '2024-05-20T08:30:00Z', creationTime: '2024-05-20T07:00:00Z', destinationTime: null, unloadingCompletionTime: null, logisticsCategory: 'transportation' },
  { id: 2, waybillNumber: 'WB-2024-002', projectId: 1, customerName: 'ABC Logistics Co.', customerTag: 'Key Account', status: 'Delivered', financialStatus: 'Settled', plateNumber: 'DEF-5678', truckId: 2, vendorId: 2, driverId: 2, dispatchType: 'Standard Dispatch', originPadId: 1, destinationPadId: 3, positionTime: '2024-05-19T14:00:00Z', creationTime: '2024-05-19T07:00:00Z', destinationTime: '2024-05-19T16:00:00Z', unloadingCompletionTime: '2024-05-19T17:00:00Z', logisticsCategory: 'transportation' },
  { id: 3, waybillNumber: 'WB-2024-003', projectId: 2, customerName: 'XYZ Trading Inc.', customerTag: 'SME', status: 'Pending', financialStatus: 'Not Started', plateNumber: 'GHI-9012', truckId: 3, vendorId: 3, driverId: 3, dispatchType: 'Temporary Dispatch', originPadId: 4, destinationPadId: 5, positionTime: null, creationTime: '2024-05-21T09:00:00Z', destinationTime: null, unloadingCompletionTime: null, logisticsCategory: 'transportation' },
  { id: 4, waybillNumber: 'WB-2024-004', projectId: 3, customerName: 'Southeast Pharma', customerTag: 'Key Account', status: 'Planning', financialStatus: 'Not Started', plateNumber: 'JKL-3456', truckId: 4, vendorId: 4, driverId: 1, dispatchType: 'Standard Dispatch', originPadId: 6, destinationPadId: 7, positionTime: null, creationTime: '2024-05-22T10:00:00Z', destinationTime: null, unloadingCompletionTime: null, logisticsCategory: 'transportation' },
  { id: 5, waybillNumber: 'WB-2024-005', projectId: 1, customerName: 'ABC Logistics Co.', customerTag: 'Key Account', status: 'Abnormal', financialStatus: 'Awaiting Exception Handling', plateNumber: 'ABC-1234', truckId: 1, vendorId: 1, driverId: 2, dispatchType: 'Standard Dispatch', originPadId: 1, destinationPadId: 8, positionTime: '2024-05-18T11:00:00Z', creationTime: '2024-05-18T07:00:00Z', destinationTime: null, unloadingCompletionTime: null, logisticsCategory: 'transportation' },
];

const subtasks = [
  { id: 1, processType: 'Billing', projectName: 'Metro Manila Distribution 2024', waybillNumber: 'WB-2024-001', status: 'Pending', assignee: 'Alice', dueDate: '2024-05-30T00:00:00Z', createdAt: '2024-05-20T08:00:00Z' },
  { id: 2, processType: 'POD Verification', projectName: 'Cebu Cold Chain Operations', waybillNumber: 'WB-2024-002', status: 'In Progress', assignee: 'Bob', dueDate: '2024-05-28T00:00:00Z', createdAt: '2024-05-19T08:00:00Z' },
  { id: 3, processType: 'Settlement', projectName: 'Mindanao Pharma Express', waybillNumber: 'WB-2024-003', status: 'Completed', assignee: 'Carol', dueDate: '2024-05-25T00:00:00Z', createdAt: '2024-05-18T08:00:00Z' },
];

const transmittals = [
  { id: 1, transmittalNumber: 'TR-2024-001', projectName: 'Metro Manila Distribution 2024', customerName: 'ABC Logistics Co.', status: 'Submitted', waybillCount: 5, createdAt: '2024-05-15T08:00:00Z' },
  { id: 2, transmittalNumber: 'TR-2024-002', projectName: 'Cebu Cold Chain Operations', customerName: 'XYZ Trading Inc.', status: 'Draft', waybillCount: 3, createdAt: '2024-05-18T09:00:00Z' },
];

const capacityPools = [
  { id: 1, poolName: 'Metro Manila Fleet', projectName: 'Metro Manila Distribution 2024', truckCount: 5, status: 'Active', createdAt: '2024-01-15T08:00:00Z' },
  { id: 2, poolName: 'Cebu Operations Pool', projectName: 'Cebu Cold Chain Operations', truckCount: 3, status: 'Active', createdAt: '2024-02-20T09:00:00Z' },
];

const claimTickets = [
  { id: 1, ticketNumber: 'CT-2024-001', type: 'Claim', waybillNumber: 'WB-2024-005', customerName: 'ABC Logistics Co.', status: 'Pending', amount: 15000, createdAt: '2024-05-18T12:00:00Z' },
  { id: 2, ticketNumber: 'CT-2024-002', type: 'Refund', waybillNumber: 'WB-2024-002', customerName: 'ABC Logistics Co.', status: 'Confirmed', amount: 5000, createdAt: '2024-05-20T14:00:00Z' },
];

const routeLibraries = [
  { id: 1, name: 'MM Route Library', region: 'Metro Manila', status: 'Active', routeCount: 25, createdAt: '2024-01-01T08:00:00Z' },
  { id: 2, name: 'Visayas Routes', region: 'Cebu', status: 'Active', routeCount: 15, createdAt: '2024-02-01T08:00:00Z' },
];

const alarms = [
  { id: 1, waybillNumber: 'WB-2024-005', alarmType: 'Delay', severity: 'High', description: 'Waybill delayed by 2 hours', status: 'Open', createdAt: '2024-05-18T10:00:00Z' },
  { id: 2, waybillNumber: 'WB-2024-001', alarmType: 'Route Deviation', severity: 'Medium', description: 'Truck deviated from planned route', status: 'Acknowledged', createdAt: '2024-05-20T09:30:00Z' },
];

export default {
  // Project
  'POST /api/project/list': (req: any, res: any) => res.json(page(projects, 5)),
  'POST /api/project/detail': (req: any, res: any) => res.json(ok({ ...projects[0], teamList: [], log: [], businessDocuments: [] })),
  'POST /api/project/add': (req: any, res: any) => res.json(ok({ id: Date.now() })),
  'POST /api/project/update': (req: any, res: any) => res.json(ok(null)),
  'POST /api/project/start': (req: any, res: any) => res.json(ok(null)),
  'POST /api/project/check-start': (req: any, res: any) => res.json(ok(null)),
  'POST /api/project/cancel': (req: any, res: any) => res.json(ok(null)),
  'POST /api/project/suspend': (req: any, res: any) => res.json(ok(null)),
  'POST /api/project/resume': (req: any, res: any) => res.json(ok(null)),
  'POST /api/project/terminate': (req: any, res: any) => res.json(ok(null)),
  'POST /api/project/completed': (req: any, res: any) => res.json(ok(null)),
  'POST /api/project/team': (req: any, res: any) => res.json(ok([])),
  'POST /api/project/log': (req: any, res: any) => res.json(ok([])),
  'POST /api/project/assign': (req: any, res: any) => res.json(ok(null)),
  'POST /api/project/assign-user': (req: any, res: any) => res.json(ok(null)),
  'POST /api/project/delete/team/member': (req: any, res: any) => res.json(ok(null)),
  'POST /api/project/additionSetting': (req: any, res: any) => res.json(ok(null)),
  'POST /api/project/additionSetting/confirm': (req: any, res: any) => res.json(ok(null)),
  'POST /api/project/contract/list': (req: any, res: any) => res.json(page([])),
  'POST /api/project/businessDocument/category/add': (req: any, res: any) => res.json(ok(null)),
  'POST /api/project/businessDocument/category/delete': (req: any, res: any) => res.json(ok(null)),
  'POST /api/project/customerCodeType/list': (req: any, res: any) => res.json(ok([])),
  'POST /api/project/customerCodeConfig/list': (req: any, res: any) => res.json(ok([])),
  'POST /api/project/customerCodeConfig/update': (req: any, res: any) => res.json(ok(null)),
  'GET /api/project/commodity': (req: any, res: any) => res.json(ok(['Electronics', 'Food', 'Medicine', 'Construction Materials', 'Clothing', 'FMCG'])),
  'GET /api/project/team/managers': (req: any, res: any) => res.json(ok([])),
  'GET /api/project/businessDocument/list': (req: any, res: any) => res.json(ok([])),
  'GET /api/project/pod/config/list': (req: any, res: any) => res.json(ok([])),
  'POST /api/project/pod/config/save': (req: any, res: any) => res.json(ok(null)),
  'GET /api/project/subtask/config/list': (req: any, res: any) => res.json(ok([])),
  'GET /api/project/subtask/config/processDef/list': (req: any, res: any) => res.json(ok([])),
  'POST /api/project/subtask/config/save': (req: any, res: any) => res.json(ok(null)),

  // Waybill
  'POST /api/waybill/list': (req: any, res: any) => res.json(page(waybills, 5)),
  'POST /api/waybill/count': (req: any, res: any) => res.json(ok({ total: 5, inTransit: 1, pending: 1, abnormal: 1 })),
  'POST /api/waybill/add': (req: any, res: any) => res.json(ok({ id: Date.now() })),
  'POST /api/waybill/update': (req: any, res: any) => res.json(ok(null)),
  'POST /api/waybill/add/check': (req: any, res: any) => res.json(ok(null)),
  'GET /api/waybill/detail/basicInfo': (req: any, res: any) => res.json(ok(waybills[0])),
  'GET /api/waybill/detail/additionalCharge': (req: any, res: any) => res.json(ok([])),
  'GET /api/waybill/detail/basicAmount': (req: any, res: any) => res.json(ok({ amount: 12000, currency: 'PHP' })),
  'GET /api/waybill/detail/claim': (req: any, res: any) => res.json(ok([])),
  'GET /api/waybill/detail/exception-fee': (req: any, res: any) => res.json(ok([])),
  'GET /api/waybill/detail/reimb-expense': (req: any, res: any) => res.json(ok([])),
  'POST /api/waybill/confirm-verification': (req: any, res: any) => res.json(ok(null)),
  'POST /api/waybill/confirm-price': (req: any, res: any) => res.json(ok(null)),
  'POST /api/waybill/confirm-pod-receipt': (req: any, res: any) => res.json(ok(null)),
  'POST /api/waybill/reject': (req: any, res: any) => res.json(ok(null)),
  'POST /api/waybill/batch/submit': (req: any, res: any) => res.json(ok(null)),
  'POST /api/waybill/batch/start': (req: any, res: any) => res.json(ok(null)),
  'POST /api/waybill/batch/update': (req: any, res: any) => res.json(ok(null)),
  'POST /api/waybill/batch/cancel': (req: any, res: any) => res.json(ok(null)),
  'POST /api/waybill/batch/abnormal': (req: any, res: any) => res.json(ok(null)),
  'POST /api/waybill/truckType/list': (req: any, res: any) => res.json(ok([{ id: 1, name: '10-Wheeler' }, { id: 2, name: '6-Wheeler' }, { id: 3, name: 'Elf' }])),
  'GET /api/waybill/truckType/show/list': (req: any, res: any) => res.json(ok([{ id: 1, name: '10-Wheeler' }, { id: 2, name: '6-Wheeler' }])),
  'POST /api/waybill/vendor/list': (req: any, res: any) => res.json(ok([{ id: 1, vendorName: 'FastTrack Transport' }, { id: 2, vendorName: 'Island Cargo Services' }])),
  'POST /api/waybill/truck/list': (req: any, res: any) => res.json(ok([{ id: 1, plateNumber: 'ABC-1234' }, { id: 2, plateNumber: 'DEF-5678' }])),
  'POST /api/waybill/driver/list': (req: any, res: any) => res.json(ok([{ id: 1, name: 'Pedro Santos' }, { id: 2, name: 'Maria Garcia' }])),
  'POST /api/waybill/helper/list': (req: any, res: any) => res.json(ok([])),
  'POST /api/waybill/carrier/check': (req: any, res: any) => res.json(ok(true)),
  'POST /api/waybill/listAllAction': (req: any, res: any) => res.json(ok([])),
  'POST /api/waybill/addShippingRecord': (req: any, res: any) => res.json(ok(null)),
  'POST /api/waybill/listShippingRecord': (req: any, res: any) => res.json(ok([])),
  'POST /api/waybill/mapJsonStr': (req: any, res: any) => res.json(ok(null)),
  'POST /api/waybill/confirmRoute': (req: any, res: any) => res.json(ok(null)),
  'POST /api/waybill/filter/create': (req: any, res: any) => res.json(ok(null)),
  'GET /api/waybill/filter/list': (req: any, res: any) => res.json(ok([])),
  'DELETE /api/waybill/filter/delete': (req: any, res: any) => res.json(ok(null)),
  'POST /api/waybill/cancel/check': (req: any, res: any) => res.json(ok(null)),
  'POST /api/waybill/editPosition': (req: any, res: any) => res.json(ok(null)),
  'POST /api/waybill/detail/billing/linked-statement': (req: any, res: any) => res.json(ok(null)),
  'POST /api/waybill/detail/claim/linked-statement': (req: any, res: any) => res.json(ok(null)),
  'POST /api/waybill/detail/claim/linked-ticket': (req: any, res: any) => res.json(ok(null)),
  'POST /api/waybill/alarm/list': (req: any, res: any) => res.json(page(alarms, 2)),
  'POST /api/waybill/alarm/statistic': (req: any, res: any) => res.json(ok({ total: 2, open: 1, acknowledged: 1 })),
  'POST /api/waybill/alarm/doneBy/list': (req: any, res: any) => res.json(ok([])),

  // Waybill routes
  'GET /api/waybill/route/origin/list': (req: any, res: any) => res.json(ok([{ id: 1, name: 'Makati City' }, { id: 2, name: 'Quezon City' }])),
  'GET /api/waybill/route/waypoint/list': (req: any, res: any) => res.json(ok([])),
  'GET /api/waybill/route/destination/list': (req: any, res: any) => res.json(ok([{ id: 3, name: 'Pasig City' }, { id: 4, name: 'Mandaluyong' }])),
  'GET /api/waybill/route/detail': (req: any, res: any) => res.json(ok(null)),
  'POST /api/waybill/route/add': (req: any, res: any) => res.json(ok(null)),
  'POST /api/waybill/route/address/check': (req: any, res: any) => res.json(ok(true)),
  'POST /api/waybill/route/price/check': (req: any, res: any) => res.json(ok(true)),

  // Waybill automation
  'POST /api/waybillAutomation/sync': (req: any, res: any) => res.json(ok(null)),
  'POST /api/waybillAutomation/sync-confirm-verification': (req: any, res: any) => res.json(ok(null)),
  'POST /api/waybillAutomation/sync/confirm-delivery': (req: any, res: any) => res.json(ok(null)),
  'POST /api/waybillAutomation/update': (req: any, res: any) => res.json(ok(null)),
  'POST /api/waybillAutomation/google-drive-link': (req: any, res: any) => res.json(ok(null)),
  'GET /api/waybillAutomation/sync/status': (req: any, res: any) => res.json(ok({ status: 'idle' })),

  // Export
  'GET /api/export-download-manage/export-waybill': (req: any, res: any) => res.json(ok(null)),
  'GET /api/export-download-manage/exportAllWaybill': (req: any, res: any) => res.json(ok(null)),
  'GET /api/export-download-manage/latest-list': (req: any, res: any) => res.json(ok([])),
  'GET /api/export-download-manage/export-rev': (req: any, res: any) => res.json(ok(null)),
  'POST /api/export-download-manage/checkExportNumber': (req: any, res: any) => res.json(ok(true)),
  'POST /api/export-download-manage/download': (req: any, res: any) => res.json(ok(null)),

  // Subtask
  'GET /api/subtask/listProcessType': (req: any, res: any) => res.json(ok(['Billing', 'POD Verification', 'Settlement'])),
  'GET /api/subtask/list': (req: any, res: any) => res.json(page(subtasks, 3)),
  'GET /api/subtask/detail/list': (req: any, res: any) => res.json(ok([])),
  'GET /api/subtask/instruction': (req: any, res: any) => res.json(ok(null)),
  'GET /api/subtask/remind': (req: any, res: any) => res.json(ok(null)),
  'POST /api/subtask/create': (req: any, res: any) => res.json(ok(null)),
  'POST /api/subtask/handleNode': (req: any, res: any) => res.json(ok(null)),
  'POST /api/subtask/cancel': (req: any, res: any) => res.json(ok(null)),
  'POST /api/subtask/processInstance/nodeAssignee': (req: any, res: any) => res.json(ok(null)),

  // Transmittal
  'POST /api/transmittal/list': (req: any, res: any) => res.json(page(transmittals, 2)),
  'POST /api/transmittal/add': (req: any, res: any) => res.json(ok({ id: Date.now() })),
  'POST /api/transmittal/search/waybill': (req: any, res: any) => res.json(ok([])),
  'POST /api/transmittal/submit/proof': (req: any, res: any) => res.json(ok(null)),
  'POST /api/transmittal/cancel': (req: any, res: any) => res.json(ok(null)),
  'GET /api/transmittal/detail': (req: any, res: any) => res.json(ok(transmittals[0])),
  'GET /api/transmittal/detail/waybill': (req: any, res: any) => res.json(ok([])),
  'GET /api/transmittal/proof/list': (req: any, res: any) => res.json(ok([])),
  'GET /api/transmittal/log': (req: any, res: any) => res.json(ok([])),

  // Route Library
  'GET /api/routeLibrary/list': (req: any, res: any) => res.json(page(routeLibraries, 2)),
  'GET /api/routeLibrary/detail': (req: any, res: any) => res.json(ok(routeLibraries[0])),
  'GET /api/routeLibrary/route/list': (req: any, res: any) => res.json(ok([])),
  'GET /api/routeLibrary/settings': (req: any, res: any) => res.json(ok({})),
  'GET /api/routeLibrary/truckType/list': (req: any, res: any) => res.json(ok([])),
  'POST /api/routeLibrary/add': (req: any, res: any) => res.json(ok({ id: Date.now() })),
  'POST /api/routeLibrary/change': (req: any, res: any) => res.json(ok(null)),
  'POST /api/routeLibrary/settings/update': (req: any, res: any) => res.json(ok(null)),

  // Capacity Pool
  'GET /api/capacity-pool/list': (req: any, res: any) => res.json(page(capacityPools, 2)),
  'GET /api/capacity-pool/detail': (req: any, res: any) => res.json(ok(capacityPools[0])),
  'GET /api/capacity-pool/truck/list': (req: any, res: any) => res.json(ok([])),
  'GET /api/capacity-pool/vendor/list': (req: any, res: any) => res.json(ok([])),
  'GET /api/capacity-pool/crew/list': (req: any, res: any) => res.json(ok([])),
  'POST /api/capacity-pool/create': (req: any, res: any) => res.json(ok({ id: Date.now() })),
  'POST /api/capacity-pool/change': (req: any, res: any) => res.json(ok(null)),
  'POST /api/capacity-pool/bind': (req: any, res: any) => res.json(ok(null)),

  // Claim Tickets
  'POST /api/claim/list': (req: any, res: any) => res.json(page(claimTickets, 2)),
  'POST /api/claim/request/list': (req: any, res: any) => res.json(page(claimTickets, 2)),
  'POST /api/claim/request/create': (req: any, res: any) => res.json(ok({ id: Date.now() })),
  'POST /api/claim/request/cancel': (req: any, res: any) => res.json(ok(null)),
  'POST /api/claim/create': (req: any, res: any) => res.json(ok({ id: Date.now() })),
  'POST /api/claim/detail': (req: any, res: any) => res.json(ok(claimTickets[0])),
  'POST /api/claim/confirm': (req: any, res: any) => res.json(ok(null)),
  'POST /api/claim/complete': (req: any, res: any) => res.json(ok(null)),
  'POST /api/claim/cancel': (req: any, res: any) => res.json(ok(null)),
  'POST /api/claim/submit': (req: any, res: any) => res.json(ok(null)),
  'GET /api/claim/request/detail': (req: any, res: any) => res.json(ok(claimTickets[0])),
  'GET /api/claim/list-type': (req: any, res: any) => res.json(ok([])),
  'GET /api/claim/export-list': (req: any, res: any) => res.json(ok(null)),
  'POST /api/refund/submit': (req: any, res: any) => res.json(ok(null)),
  'POST /api/refund/create': (req: any, res: any) => res.json(ok({ id: Date.now() })),
  'POST /api/refund/confirm': (req: any, res: any) => res.json(ok(null)),
  'POST /api/refund/complete': (req: any, res: any) => res.json(ok(null)),
  'POST /api/refund/cancel': (req: any, res: any) => res.json(ok(null)),
  'GET /api/refund/list': (req: any, res: any) => res.json(page([], 0)),
  'GET /api/refund/detail': (req: any, res: any) => res.json(ok(null)),
  'GET /api/ticket/proof/list': (req: any, res: any) => res.json(ok([])),
  'POST /api/ticket/proof/add': (req: any, res: any) => res.json(ok(null)),
  'POST /api/ticket/proof/delete': (req: any, res: any) => res.json(ok(null)),
  'GET /api/ticket/remark/list': (req: any, res: any) => res.json(ok([])),
  'POST /api/ticket/remark/add': (req: any, res: any) => res.json(ok(null)),
  'GET /api/ticket/log/list': (req: any, res: any) => res.json(ok([])),

  // Contract
  'POST /api/contract/delete': (req: any, res: any) => res.json(ok(null)),
  'POST /api/contract/refuseContract': (req: any, res: any) => res.json(ok(null)),
  'POST /api/contract/approveContract': (req: any, res: any) => res.json(ok(null)),
  'POST /api/contract/voidContract': (req: any, res: any) => res.json(ok(null)),
  'POST /api/contract/checkContractNumber': (req: any, res: any) => res.json(ok(false)),
  'POST /api/contract/add/note': (req: any, res: any) => res.json(ok(null)),
  'GET /api/contract/queryCustomerSigner': (req: any, res: any) => res.json(ok([])),
  'GET /api/contract/listOperationLog': (req: any, res: any) => res.json(ok([])),
  'GET /api/contract/vendor-contract-list': (req: any, res: any) => res.json(ok([])),

  // Statement fields
  'GET /api/statement/fields/list': (req: any, res: any) => res.json(ok([])),
  'POST /api/statement/fields/add': (req: any, res: any) => res.json(ok(null)),
};
