import type { backendInterface } from "../backend";

export const mockBackend: backendInterface = {
  addPackingLog: async (input) => ({ __kind__: 'ok' as const, ok: {
    ...input,
    id: BigInt(Date.now()),
    createdAt: BigInt(Date.now()),
    createdBy: "operator1",
  } }),
  addTankRoomLog: async (input) => ({ __kind__: 'ok' as const, ok: {
    ...input,
    id: BigInt(Date.now()),
    createdAt: BigInt(Date.now()),
    createdBy: "operator1",
  } }),
  addMuesliProcessLog: async (input) => ({ __kind__: 'ok' as const, ok: {
    ...input,
    id: BigInt(Date.now()),
    createdAt: BigInt(Date.now()),
    createdBy: "operator1",
  } }),
  getPackingLogs: async () => [],
  getTankRoomLogs: async () => [],
  getMuesliProcessLogs: async () => [],
  deletePackingLog: async () => true,
  deleteTankRoomLog: async () => true,
  deleteMuesliProcessLog: async () => true,
  updatePackingLog: async () => ({ __kind__: 'ok' as const, ok: true }),
  updateTankRoomLog: async () => ({ __kind__: 'ok' as const, ok: true }),
  updateMuesliProcessLog: async () => ({ __kind__: 'ok' as const, ok: true }),
  backwardTraceability: async (batchCode) => ({
    batchCode,
    tanks: [],
    muesliLogs: [],
  }),
  checkDuplicateBatchCode: async (_batchCode) => false,
  checkDuplicateLotNumber: async (_lotNumber, _logBook) => false,
  getDashboardStats: async () => ({
    totalBatchesThisWeek: BigInt(0),
    holdsCount: BigInt(0),
    rawMaterialsConsumedThisWeek: BigInt(0),
  }),
  getFlaggedRecords: async () => [],
  getShiftReport: async (date, shift) => ({ date, shift, packingEntries: [], tankEntries: [], rawMaterialEntries: [] }),
  forwardTraceability: async (lotNo) => ({
    lotNo,
    muesliDates: [],
    packingEntries: [],
  }),
};
