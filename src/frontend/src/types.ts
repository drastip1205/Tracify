// ─── Core domain types — re-exported from backend.d.ts for frontend use ──────
import type {
  BackwardTraceResult,
  ForwardTraceResult,
  IngredientRow,
  MuesliProcessLogEntry,
  PackingLogEntry,
  PackingReference,
  TankRoomLogEntry,
  TankStatus,
  TankUsage,
} from "@/backend";

export type {
  BackwardTraceResult,
  ForwardTraceResult,
  IngredientRow,
  MuesliProcessLogEntry,
  PackingLogEntry,
  PackingReference,
  TankRoomLogEntry,
  TankStatus,
  TankUsage,
};

// ─── Aliases for backward-compatibility with existing pages ──────────────────
/** Tank usage entry in a backward trace result */
export type BackwardTraceTank = TankUsage;
/** Muesli log entry in a backward trace result */
export type BackwardTraceMuesliLog = import("@/backend").DateIngredients;
/** Packing entry in a forward trace result */
export type ForwardTracePackingEntry = PackingReference;

// ─── Form input types (omit id / computed fields) ────────────────────────────

export type PackingLogInput = Omit<PackingLogEntry, "id">;
export type TankRoomLogInput = Omit<TankRoomLogEntry, "id">;
export type MuesliProcessLogInput = Omit<MuesliProcessLogEntry, "id">;

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function tankStatusLabel(status: TankStatus): string {
  return String(status) || "Unknown";
}
