import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ForwardTraceResult {
    lotNo: string;
    muesliDates: Array<string>;
    packingEntries: Array<PackingReference>;
}
export interface FlaggedRecord {
    linkedLotNumbers: Array<string>;
    linkedBatchCodes: Array<string>;
    tankEntry: TankRoomLogEntry;
}
export interface MuesliProcessLogInput {
    run: string;
    date: string;
    shift: string;
    ingredients: Array<IngredientRow>;
    product: string;
}
export interface TankRoomLogInput {
    remark: string;
    productRun: string;
    tankStatus: TankStatus;
    date: string;
    fillingTimeIn: string;
    fillingTimeOut: string;
    shift: string;
    cleaned: boolean;
    permanentTankNumber: string;
    reasonForHold: string;
    foodTankNo: string;
    correctiveAction: string;
    batchCode: string;
}
export interface PackingLogInput {
    mrp: string;
    bulkBagLotNo: string;
    bestBefore: string;
    caseCode: string;
    crew: string;
    date: string;
    netWeight: string;
    productName: string;
    tankBatchCodes: Array<string>;
    casePartitionSupplier: string;
    variety: string;
    machineNo: string;
    casePartitionLotNo: string;
    batchCode: string;
    bulkBagSupplier: string;
    mfgDate: string;
}
export interface ShiftReport {
    tankEntries: Array<TankRoomLogEntry>;
    rawMaterialEntries: Array<MuesliProcessLogEntry>;
    date: string;
    shift: string;
    packingEntries: Array<PackingLogEntry>;
}
export interface TankUsage {
    date: string;
    shift: string;
    foodTankNo: string;
}
export interface DashboardStats {
    holdsCount: bigint;
    totalBatchesThisWeek: bigint;
    rawMaterialsConsumedThisWeek: bigint;
}
export interface BackwardTraceResult {
    tanks: Array<TankUsage>;
    muesliLogs: Array<DateIngredients>;
    batchCode: string;
}
export interface IngredientRow {
    qty: string;
    issueFromStores: string;
    lotNo: string;
    closingStock: string;
    ingredientName: string;
    openingStock: string;
}
export interface DateRange {
    toDate: DateText;
    fromDate: DateText;
}
export interface TankRoomLogEntry {
    id: bigint;
    remark: string;
    productRun: string;
    tankStatus: TankStatus;
    date: string;
    createdAt: bigint;
    createdBy: string;
    fillingTimeIn: string;
    fillingTimeOut: string;
    shift: string;
    updatedAt?: bigint;
    updatedBy?: string;
    cleaned: boolean;
    permanentTankNumber: string;
    reasonForHold: string;
    foodTankNo: string;
    correctiveAction: string;
    batchCode: string;
}
export type DateText = string;
export interface PackingLogEntry {
    id: bigint;
    mrp: string;
    bulkBagLotNo: string;
    bestBefore: string;
    caseCode: string;
    crew: string;
    date: string;
    netWeight: string;
    createdAt: bigint;
    createdBy: string;
    productName: string;
    updatedAt?: bigint;
    updatedBy?: string;
    tankBatchCodes: Array<string>;
    casePartitionSupplier: string;
    variety: string;
    machineNo: string;
    casePartitionLotNo: string;
    batchCode: string;
    bulkBagSupplier: string;
    mfgDate: string;
}
export interface PackingReference {
    date: string;
    productName: string;
    foodTankNos: Array<string>;
    batchCode: string;
}
export interface MuesliProcessLogEntry {
    id: bigint;
    run: string;
    date: string;
    createdAt: bigint;
    createdBy: string;
    shift: string;
    updatedAt?: bigint;
    updatedBy?: string;
    ingredients: Array<IngredientRow>;
    product: string;
}
export interface DateIngredients {
    run: string;
    date: string;
    shift: string;
    ingredients: Array<IngredientRow>;
    product: string;
}
export enum TankStatus {
    Feed = "Feed",
    Food = "Food",
    Hold = "Hold"
}
export interface backendInterface {
    addMuesliProcessLog(input: MuesliProcessLogInput): Promise<{
        __kind__: "ok";
        ok: MuesliProcessLogEntry;
    } | {
        __kind__: "err";
        err: string;
    }>;
    addPackingLog(input: PackingLogInput): Promise<{
        __kind__: "ok";
        ok: PackingLogEntry;
    } | {
        __kind__: "err";
        err: string;
    }>;
    addTankRoomLog(input: TankRoomLogInput): Promise<{
        __kind__: "ok";
        ok: TankRoomLogEntry;
    } | {
        __kind__: "err";
        err: string;
    }>;
    backwardTraceability(batchCode: string): Promise<BackwardTraceResult>;
    checkDuplicateBatchCode(batchCode: string): Promise<boolean>;
    checkDuplicateLotNumber(lotNumber: string, logBook: string): Promise<boolean>;
    deleteMuesliProcessLog(id: bigint): Promise<boolean>;
    deletePackingLog(id: bigint): Promise<boolean>;
    deleteTankRoomLog(id: bigint): Promise<boolean>;
    forwardTraceability(lotNo: string): Promise<ForwardTraceResult>;
    getDashboardStats(): Promise<DashboardStats>;
    getFlaggedRecords(): Promise<Array<FlaggedRecord>>;
    getMuesliProcessLogs(dateRange: DateRange | null): Promise<Array<MuesliProcessLogEntry>>;
    getPackingLogs(dateRange: DateRange | null): Promise<Array<PackingLogEntry>>;
    getShiftReport(date: string, shift: string): Promise<ShiftReport>;
    getTankRoomLogs(dateRange: DateRange | null): Promise<Array<TankRoomLogEntry>>;
    updateMuesliProcessLog(entry: MuesliProcessLogEntry): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updatePackingLog(entry: PackingLogEntry): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateTankRoomLog(entry: TankRoomLogEntry): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: string;
    }>;
}
