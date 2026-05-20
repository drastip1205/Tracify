import { createActor } from "@/backend";
import type {
  BackwardTraceResult,
  DashboardStats,
  FlaggedRecord,
  ForwardTraceResult,
  MuesliProcessLogEntry,
  PackingLogEntry,
  ShiftReport,
  TankRoomLogEntry,
} from "@/backend";
import type {
  MuesliProcessLogInput,
  PackingLogInput,
  TankRoomLogInput,
} from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const QK = {
  packingLogs: ["packingLogs"] as const,
  tankRoomLogs: ["tankRoomLogs"] as const,
  muesliProcessLogs: ["muesliProcessLogs"] as const,
  backwardTrace: (batchCode: string) => ["backwardTrace", batchCode] as const,
  forwardTrace: (lotNo: string) => ["forwardTrace", lotNo] as const,
  dashboardStats: ["dashboardStats"] as const,
  flaggedRecords: ["flaggedRecords"] as const,
  shiftReport: (date: string, shift: string) =>
    ["shiftReport", date, shift] as const,
};

// ─── Query Hooks ──────────────────────────────────────────────────────────────

export function usePackingLogs() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<PackingLogEntry[]>({
    queryKey: QK.packingLogs,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPackingLogs(null);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTankRoomLogs() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<TankRoomLogEntry[]>({
    queryKey: QK.tankRoomLogs,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTankRoomLogs(null);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMuesliProcessLogs() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<MuesliProcessLogEntry[]>({
    queryKey: QK.muesliProcessLogs,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMuesliProcessLogs(null);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDashboardStats() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<DashboardStats>({
    queryKey: QK.dashboardStats,
    queryFn: async () => {
      if (!actor)
        return {
          totalBatchesThisWeek: BigInt(0),
          holdsCount: BigInt(0),
          rawMaterialsConsumedThisWeek: BigInt(0),
        };
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFlaggedRecords() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<FlaggedRecord[]>({
    queryKey: QK.flaggedRecords,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFlaggedRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useShiftReport(date: string, shift: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ShiftReport | null>({
    queryKey: QK.shiftReport(date, shift),
    queryFn: async () => {
      if (!actor || !date || !shift) return null;
      return actor.getShiftReport(date, shift);
    },
    enabled: !!actor && !isFetching && !!date && !!shift,
  });
}

export function useCheckDuplicateBatchCode() {
  const { actor } = useActor(createActor);
  return async (batchCode: string): Promise<boolean> => {
    if (!actor) return false;
    return actor.checkDuplicateBatchCode(batchCode);
  };
}

export function useCheckDuplicateLotNumber() {
  const { actor } = useActor(createActor);
  return async (lotNumber: string, logBook: string): Promise<boolean> => {
    if (!actor) return false;
    return actor.checkDuplicateLotNumber(lotNumber, logBook);
  };
}

export function useBackwardTrace(batchCode: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<BackwardTraceResult | null>({
    queryKey: QK.backwardTrace(batchCode),
    queryFn: async () => {
      if (!actor || !batchCode.trim()) return null;
      return actor.backwardTraceability(batchCode.trim());
    },
    enabled: !!actor && !isFetching && batchCode.trim().length > 0,
  });
}

export function useForwardTrace(lotNo: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ForwardTraceResult | null>({
    queryKey: QK.forwardTrace(lotNo),
    queryFn: async () => {
      if (!actor || !lotNo.trim()) return null;
      return actor.forwardTraceability(lotNo.trim());
    },
    enabled: !!actor && !isFetching && lotNo.trim().length > 0,
  });
}

// ─── Shared invalidation ─────────────────────────────────────────────────────

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: QK.packingLogs });
  qc.invalidateQueries({ queryKey: QK.tankRoomLogs });
  qc.invalidateQueries({ queryKey: QK.muesliProcessLogs });
  qc.invalidateQueries({ queryKey: QK.dashboardStats });
  qc.invalidateQueries({ queryKey: QK.flaggedRecords });
  qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === "backwardTrace" });
  qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === "forwardTrace" });
}

// ─── Packing Log Mutations ────────────────────────────────────────────────────

export function useAddPackingLog() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: PackingLogInput) => {
      const r = await actor!.addPackingLog(input);
      if (r.__kind__ === "err") throw new Error(r.err);
      return r.ok;
    },
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdatePackingLog() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: { id: bigint; input: PackingLogInput }) => {
      const entry: PackingLogEntry = {
        id,
        ...input,
      };
      const r = await actor!.updatePackingLog(entry);
      if (r.__kind__ === "err") throw new Error(r.err);
      return r.ok;
    },
    onSuccess: () => invalidateAll(qc),
  });
}

export function useDeletePackingLog() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.deletePackingLog(id),
    onSuccess: () => invalidateAll(qc),
  });
}

// ─── Tank Room Log Mutations ──────────────────────────────────────────────────

export function useAddTankRoomLog() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TankRoomLogInput) => {
      const r = await actor!.addTankRoomLog(input);
      if (r.__kind__ === "err") throw new Error(r.err);
      return r.ok;
    },
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdateTankRoomLog() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: { id: bigint; input: TankRoomLogInput }) => {
      const entry: TankRoomLogEntry = {
        id,
        ...input,
      };
      const r = await actor!.updateTankRoomLog(entry);
      if (r.__kind__ === "err") throw new Error(r.err);
      return r.ok;
    },
    onSuccess: () => invalidateAll(qc),
  });
}

export function useDeleteTankRoomLog() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.deleteTankRoomLog(id),
    onSuccess: () => invalidateAll(qc),
  });
}

// ─── Muesli Process Log Mutations ────────────────────────────────────────────

export function useAddMuesliProcessLog() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: MuesliProcessLogInput) => {
      const r = await actor!.addMuesliProcessLog(input);
      if (r.__kind__ === "err") throw new Error(r.err);
      return r.ok;
    },
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdateMuesliProcessLog() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: { id: bigint; input: MuesliProcessLogInput }) => {
      const entry: MuesliProcessLogEntry = {
        id,
        ...input,
      };
      const r = await actor!.updateMuesliProcessLog(entry);
      if (r.__kind__ === "err") throw new Error(r.err);
      return r.ok;
    },
    onSuccess: () => invalidateAll(qc),
  });
}

export function useDeleteMuesliProcessLog() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.deleteMuesliProcessLog(id),
    onSuccess: () => invalidateAll(qc),
  });
}
