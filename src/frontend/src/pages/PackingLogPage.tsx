import { DateRangeFilter } from "@/components/DateRangeFilter";
import { Layout } from "@/components/Layout";
import { QrScannerModal } from "@/components/QrScannerModal";
import { useAuth } from "@/hooks/useAuth";
import {
  useAddPackingLog,
  useCheckDuplicateBatchCode,
  useDeletePackingLog,
  usePackingLogs,
  useUpdatePackingLog,
} from "@/lib/backend-client";
import type { PackingLogEntry, PackingLogInput } from "@/types";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Package,
  Pencil,
  Plus,
  QrCode,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Empty form state ─────────────────────────────────────────────────────────
const EMPTY_FORM: PackingLogInput = {
  date: "",
  crew: "",
  machineNo: "",
  productName: "",
  netWeight: "",
  variety: "",
  mfgDate: "",
  batchCode: "",
  mrp: "",
  bestBefore: "",
  caseCode: "",
  bulkBagSupplier: "",
  bulkBagLotNo: "",
  casePartitionSupplier: "",
  casePartitionLotNo: "",
  tankBatchCodes: [""],
  createdAt: BigInt(0),
  createdBy: "",
};

type SortField = "date" | "batchCode";
type SortDir = "asc" | "desc";

// ─── Entry Form Modal ─────────────────────────────────────────────────────────
function EntryModal({
  entry,
  onClose,
}: {
  entry: PackingLogEntry | null;
  onClose: () => void;
}) {
  const addMutation = useAddPackingLog();
  const updateMutation = useUpdatePackingLog();
  const checkDuplicateBatchCode = useCheckDuplicateBatchCode();
  const isPending = addMutation.isPending || updateMutation.isPending;
  const [errors, setErrors] = useState<
    Partial<Record<keyof PackingLogInput, string>>
  >({});
  const [dupWarning, setDupWarning] = useState<string | null>(null);
  const [showQrBatchCode, setShowQrBatchCode] = useState(false);
  const pendingFormRef = useRef<PackingLogInput | null>(null);

  const [form, setForm] = useState<PackingLogInput>(
    entry
      ? {
          date: entry.date,
          crew: entry.crew,
          machineNo: entry.machineNo,
          productName: entry.productName,
          netWeight: entry.netWeight,
          variety: entry.variety,
          mfgDate: entry.mfgDate,
          batchCode: entry.batchCode,
          mrp: entry.mrp,
          bestBefore: entry.bestBefore,
          caseCode: entry.caseCode,
          bulkBagSupplier: entry.bulkBagSupplier,
          bulkBagLotNo: entry.bulkBagLotNo,
          casePartitionSupplier: entry.casePartitionSupplier,
          casePartitionLotNo: entry.casePartitionLotNo,
          tankBatchCodes:
            entry.tankBatchCodes.length > 0 ? [...entry.tankBatchCodes] : [""],
          createdAt: entry.createdAt,
          createdBy: entry.createdBy,
        }
      : { ...EMPTY_FORM, tankBatchCodes: [""] },
  );

  function setField<K extends keyof PackingLogInput>(
    key: K,
    val: PackingLogInput[K],
  ) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function setTank(i: number, val: string) {
    setForm((f) => {
      const tanks = [...f.tankBatchCodes];
      tanks[i] = val;
      return { ...f, tankBatchCodes: tanks };
    });
  }

  function addTank() {
    setForm((f) => ({ ...f, tankBatchCodes: [...f.tankBatchCodes, ""] }));
  }

  function removeTank(i: number) {
    setForm((f) => {
      const tanks = f.tankBatchCodes.filter((_, idx) => idx !== i);
      return { ...f, tankBatchCodes: tanks.length > 0 ? tanks : [""] };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Partial<Record<keyof PackingLogInput, string>> = {};
    if (!form.date) newErrors.date = "Date is required";
    if (!form.batchCode) newErrors.batchCode = "Batch code is required";
    if (!form.productName) newErrors.productName = "Product name is required";
    if (!form.netWeight) newErrors.netWeight = "Net weight is required";
    if (!form.mrp) newErrors.mrp = "MRP is required";
    if (!form.bestBefore) newErrors.bestBefore = "Best before date is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    const data: PackingLogInput = {
      ...form,
      tankBatchCodes: form.tankBatchCodes.filter((t) => t.trim() !== ""),
    };
    if (!entry) {
      const isDup = await checkDuplicateBatchCode(form.batchCode);
      if (isDup) {
        pendingFormRef.current = data;
        setDupWarning(form.batchCode);
        return;
      }
    }
    try {
      if (entry) {
        await updateMutation.mutateAsync({ id: entry.id, input: data });
        toast.success("Entry updated");
      } else {
        await addMutation.mutateAsync(data);
        toast.success("Entry added");
      }
      onClose();
    } catch {
      toast.error("Failed to save entry");
    }
  }

  async function proceedWithDuplicate() {
    if (!pendingFormRef.current) return;
    try {
      await addMutation.mutateAsync(pendingFormRef.current);
      toast.success("Entry added");
      onClose();
    } catch {
      toast.error("Failed to save entry");
    } finally {
      pendingFormRef.current = null;
      setDupWarning(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 overflow-y-auto py-8"
      data-ocid="packing-log.dialog"
    >
      <div className="w-full max-w-2xl border-2 border-border bg-card shadow-2xl mx-4">
        {/* Modal Header */}
        <div className="section-header">
          <span className="font-display font-bold text-xs uppercase tracking-widest">
            {entry ? "Edit Entry" : "New Packing Log Entry"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:opacity-70 transition-smooth"
            aria-label="Close"
            data-ocid="packing-log.close_button"
          >
            <X size={16} />
          </button>
        </div>

        {dupWarning && (
          <div className="bg-yellow-50 border border-yellow-300 rounded p-3 m-4 mb-0">
            <p className="font-body text-sm text-yellow-900">
              Batch code <strong>{dupWarning}</strong> already exists. Do you
              still want to add this entry?
            </p>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={proceedWithDuplicate}
                className="btn-accent text-xs py-1 px-3"
                data-ocid="packing-log.dup_confirm_button"
              >
                Yes, Add Anyway
              </button>
              <button
                type="button"
                onClick={() => {
                  setDupWarning(null);
                  pendingFormRef.current = null;
                }}
                className="btn-ghost text-xs py-1 px-3"
                data-ocid="packing-log.dup_cancel_button"
              >
                No, Cancel
              </button>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Row 1: Date, Crew, Machine */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="pl-date"
                className="block font-display text-xs uppercase tracking-widest text-muted-foreground mb-1"
              >
                Date *
              </label>
              <input
                id="pl-date"
                type="date"
                required
                value={form.date}
                onChange={(e) => setField("date", e.target.value)}
                className="input-industrial"
                data-ocid="packing-log.date.input"
              />
              {errors.date && (
                <p className="text-destructive text-xs mt-1">{errors.date}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="pl-crew"
                className="block font-display text-xs uppercase tracking-widest text-muted-foreground mb-1"
              >
                Crew *
              </label>
              <input
                id="pl-crew"
                type="text"
                required
                placeholder="A / B / C"
                value={form.crew}
                onChange={(e) => setField("crew", e.target.value)}
                className="input-industrial"
                data-ocid="packing-log.crew.input"
              />
            </div>
            <div>
              <label
                htmlFor="pl-machine"
                className="block font-display text-xs uppercase tracking-widest text-muted-foreground mb-1"
              >
                Machine No. *
              </label>
              <input
                id="pl-machine"
                type="text"
                required
                placeholder="M-01"
                value={form.machineNo}
                onChange={(e) => setField("machineNo", e.target.value)}
                className="input-industrial"
                data-ocid="packing-log.machine_no.input"
              />
            </div>
          </div>

          {/* Row 2: Product, Variety, Net Weight */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="pl-product"
                className="block font-display text-xs uppercase tracking-widest text-muted-foreground mb-1"
              >
                Product Name *
              </label>
              <input
                id="pl-product"
                type="text"
                required
                placeholder="Muesli Original"
                value={form.productName}
                onChange={(e) => setField("productName", e.target.value)}
                className="input-industrial"
                data-ocid="packing-log.product_name.input"
              />
              {errors.productName && (
                <p className="text-destructive text-xs mt-1">
                  {errors.productName}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="pl-variety"
                className="block font-display text-xs uppercase tracking-widest text-muted-foreground mb-1"
              >
                Variety
              </label>
              <input
                id="pl-variety"
                type="text"
                placeholder="Classic / Fruit"
                value={form.variety}
                onChange={(e) => setField("variety", e.target.value)}
                className="input-industrial"
                data-ocid="packing-log.variety.input"
              />
            </div>
            <div>
              <label
                htmlFor="pl-weight"
                className="block font-display text-xs uppercase tracking-widest text-muted-foreground mb-1"
              >
                Net Weight
              </label>
              <input
                id="pl-weight"
                type="text"
                placeholder="500g"
                value={form.netWeight}
                onChange={(e) => setField("netWeight", e.target.value)}
                className="input-industrial"
                data-ocid="packing-log.net_weight.input"
              />
              {errors.netWeight && (
                <p className="text-destructive text-xs mt-1">
                  {errors.netWeight}
                </p>
              )}
            </div>
          </div>

          {/* Row 3: Batch Code, Mfg Date, Best Before */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="pl-batch"
                className="block font-display text-xs uppercase tracking-widest text-muted-foreground mb-1"
              >
                Batch Code *
              </label>
              <div className="flex gap-2">
                <input
                  id="pl-batch"
                  type="text"
                  required
                  placeholder="BC-2024-001"
                  value={form.batchCode}
                  onChange={(e) => setField("batchCode", e.target.value)}
                  className="input-industrial flex-1"
                  data-ocid="packing-log.batch_code.input"
                />
                <button
                  type="button"
                  onClick={() => setShowQrBatchCode(true)}
                  className="inline-flex items-center gap-1 px-3 border-2 border-border hover:border-accent hover:text-accent transition-smooth text-muted-foreground text-xs font-display uppercase tracking-widest shrink-0"
                  aria-label="Scan QR for batch code"
                  data-ocid="packing-log.batch_code_qr_button"
                >
                  <QrCode size={14} /> Scan
                </button>
              </div>
              {errors.batchCode && (
                <p className="text-destructive text-xs mt-1">
                  {errors.batchCode}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="pl-mfg"
                className="block font-display text-xs uppercase tracking-widest text-muted-foreground mb-1"
              >
                Mfg Date
              </label>
              <input
                id="pl-mfg"
                type="date"
                value={form.mfgDate}
                onChange={(e) => setField("mfgDate", e.target.value)}
                className="input-industrial"
                data-ocid="packing-log.mfg_date.input"
              />
            </div>
            <div>
              <label
                htmlFor="pl-best-before"
                className="block font-display text-xs uppercase tracking-widest text-muted-foreground mb-1"
              >
                Best Before
              </label>
              <input
                id="pl-best-before"
                type="date"
                value={form.bestBefore}
                onChange={(e) => setField("bestBefore", e.target.value)}
                className="input-industrial"
                data-ocid="packing-log.best_before.input"
              />
              {errors.bestBefore && (
                <p className="text-destructive text-xs mt-1">
                  {errors.bestBefore}
                </p>
              )}
            </div>
          </div>

          {/* Row 4: MRP, Case Code */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="pl-mrp"
                className="block font-display text-xs uppercase tracking-widest text-muted-foreground mb-1"
              >
                MRP
              </label>
              <input
                id="pl-mrp"
                type="text"
                placeholder="₹250"
                value={form.mrp}
                onChange={(e) => setField("mrp", e.target.value)}
                className="input-industrial"
                data-ocid="packing-log.mrp.input"
              />
              {errors.mrp && (
                <p className="text-destructive text-xs mt-1">{errors.mrp}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="pl-case-code"
                className="block font-display text-xs uppercase tracking-widest text-muted-foreground mb-1"
              >
                Case Code
              </label>
              <input
                id="pl-case-code"
                type="text"
                placeholder="CC-001"
                value={form.caseCode}
                onChange={(e) => setField("caseCode", e.target.value)}
                className="input-industrial"
                data-ocid="packing-log.case_code.input"
              />
            </div>
          </div>

          {/* Row 5: Bulk Bag */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="pl-bulk-supplier"
                className="block font-display text-xs uppercase tracking-widest text-muted-foreground mb-1"
              >
                Bulk Bag Supplier
              </label>
              <input
                id="pl-bulk-supplier"
                type="text"
                placeholder="Supplier name"
                value={form.bulkBagSupplier}
                onChange={(e) => setField("bulkBagSupplier", e.target.value)}
                className="input-industrial"
                data-ocid="packing-log.bulk_bag_supplier.input"
              />
            </div>
            <div>
              <label
                htmlFor="pl-bulk-lot"
                className="block font-display text-xs uppercase tracking-widest text-muted-foreground mb-1"
              >
                Bulk Bag Lot No.
              </label>
              <input
                id="pl-bulk-lot"
                type="text"
                placeholder="LOT-2024-BB-001"
                value={form.bulkBagLotNo}
                onChange={(e) => setField("bulkBagLotNo", e.target.value)}
                className="input-industrial"
                data-ocid="packing-log.bulk_bag_lot_no.input"
              />
            </div>
          </div>

          {/* Row 6: Case/Partition */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="pl-cp-supplier"
                className="block font-display text-xs uppercase tracking-widest text-muted-foreground mb-1"
              >
                Case/Partition Supplier
              </label>
              <input
                id="pl-cp-supplier"
                type="text"
                placeholder="Supplier name"
                value={form.casePartitionSupplier}
                onChange={(e) =>
                  setField("casePartitionSupplier", e.target.value)
                }
                className="input-industrial"
                data-ocid="packing-log.case_partition_supplier.input"
              />
            </div>
            <div>
              <label
                htmlFor="pl-cp-lot"
                className="block font-display text-xs uppercase tracking-widest text-muted-foreground mb-1"
              >
                Case/Partition Lot No.
              </label>
              <input
                id="pl-cp-lot"
                type="text"
                placeholder="LOT-2024-CP-001"
                value={form.casePartitionLotNo}
                onChange={(e) => setField("casePartitionLotNo", e.target.value)}
                className="input-industrial"
                data-ocid="packing-log.case_partition_lot_no.input"
              />
            </div>
          </div>

          {/* Food Tank Numbers (join keys) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">
                Food Tank Numbers
                <span className="ml-2 text-accent">
                  (join key for traceability)
                </span>
              </span>
              <button
                type="button"
                onClick={addTank}
                className="btn-ghost py-1 px-3 text-xs"
                data-ocid="packing-log.add_tank_button"
              >
                <Plus size={12} /> Add Tank
              </button>
            </div>
            <div className="space-y-2">
              {form.tankBatchCodes.map((tank, i) => (
                <div key={`tank-row-${tank}`} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={`Food Tank No. ${i + 1}`}
                    value={tank}
                    onChange={(e) => setTank(i, e.target.value)}
                    className="input-industrial flex-1"
                    data-ocid={`packing-log.tank_no.${i + 1}`}
                  />
                  {form.tankBatchCodes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTank(i)}
                      className="px-3 border-2 border-border hover:border-destructive hover:text-destructive transition-smooth text-muted-foreground"
                      aria-label={`Remove tank ${i + 1}`}
                      data-ocid={`packing-log.remove_tank_button.${i + 1}`}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
              data-ocid="packing-log.cancel_button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-accent"
              disabled={isPending}
              data-ocid="packing-log.submit_button"
            >
              {isPending ? "Saving…" : entry ? "Save Changes" : "Add Entry"}
            </button>
          </div>
        </form>
        {showQrBatchCode && (
          <QrScannerModal
            onClose={() => setShowQrBatchCode(false)}
            onScan={(val) => {
              setForm((f) => ({ ...f, batchCode: val }));
              setShowQrBatchCode(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────
function DeleteDialog({
  entry,
  onClose,
}: {
  entry: PackingLogEntry;
  onClose: () => void;
}) {
  const deleteMutation = useDeletePackingLog();

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(entry.id);
      toast.success("Entry deleted");
      onClose();
    } catch {
      toast.error("Failed to delete entry");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      data-ocid="packing-log.delete_dialog"
    >
      <div className="w-full max-w-md border-2 border-border bg-card shadow-2xl mx-4">
        <div className="section-header">
          <span className="font-display font-bold text-xs uppercase tracking-widest">
            Confirm Delete
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:opacity-70 transition-smooth"
            aria-label="Close"
            data-ocid="packing-log.delete_close_button"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-6">
          <div className="flex gap-3 mb-5">
            <AlertTriangle
              size={20}
              className="text-destructive mt-0.5 shrink-0"
            />
            <div>
              <p className="font-display font-semibold text-sm uppercase tracking-wide">
                Delete this entry?
              </p>
              <p className="font-body text-sm text-muted-foreground mt-1">
                Batch code{" "}
                <span className="font-display text-foreground">
                  {entry.batchCode}
                </span>{" "}
                will be permanently removed. This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
              data-ocid="packing-log.delete_cancel_button"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 font-display font-semibold text-sm uppercase tracking-wider border-2 transition-smooth"
              style={{
                background: "oklch(var(--destructive))",
                color: "oklch(var(--destructive-foreground))",
                borderColor: "oklch(var(--destructive))",
              }}
              data-ocid="packing-log.delete_confirm_button"
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete Entry"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PackingLogPage() {
  const { data: logs = [], isLoading } = usePackingLogs();
  const { role } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editEntry, setEditEntry] = useState<PackingLogEntry | null>(null);
  const [deleteEntry, setDeleteEntry] = useState<PackingLogEntry | null>(null);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const sortedLogs = useMemo(() => {
    const filtered =
      fromDate || toDate
        ? logs.filter((e) => {
            if (fromDate && e.date < fromDate) return false;
            if (toDate && e.date > toDate) return false;
            return true;
          })
        : logs;
    return [...filtered].sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [logs, sortField, sortDir, fromDate, toDate]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field)
      return <ChevronUp size={12} className="opacity-30" />;
    return sortDir === "asc" ? (
      <ChevronUp size={12} />
    ) : (
      <ChevronDown size={12} />
    );
  }

  return (
    <Layout>
      <div className="px-6 py-6" data-ocid="packing-log.page">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-smooth"
          data-ocid="packing-log.back_link"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        {/* Page Header */}
        <div className="mb-6 border-b-2 border-border pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package size={20} className="text-accent" />
            <div>
              <h1 className="font-display font-bold text-xl uppercase tracking-widest text-foreground">
                Packing Log
              </h1>
              <p className="font-body text-xs text-muted-foreground mt-0.5">
                Record batch codes, tank references, and lot numbers per packing
                run
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditEntry(null);
              setShowModal(true);
            }}
            className="btn-accent"
            data-ocid="packing-log.add_button"
          >
            <Plus size={14} /> Add Entry
          </button>
        </div>

        {/* Table Card */}
        <div className="border-2 border-border">
          <div className="section-header">
            <span className="font-display font-semibold text-xs uppercase tracking-widest">
              Log Entries
            </span>
            <span className="font-display text-xs text-primary-foreground/60">
              {logs.length} record{logs.length !== 1 ? "s" : ""}
            </span>
          </div>

          <DateRangeFilter
            onApply={(f, t) => {
              setFromDate(f);
              setToDate(t);
            }}
            onClear={() => {
              setFromDate("");
              setToDate("");
            }}
          />

          {isLoading ? (
            <div
              className="p-8 text-center font-display text-xs uppercase tracking-widest text-muted-foreground"
              data-ocid="packing-log.loading_state"
            >
              Loading entries&hellip;
            </div>
          ) : sortedLogs.length === 0 ? (
            <div
              className="p-12 text-center"
              data-ocid="packing-log.empty_state"
            >
              <Package
                size={36}
                className="mx-auto mb-3 text-muted-foreground"
              />
              <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">
                No packing log entries yet
              </p>
              <p className="font-body text-sm text-muted-foreground mt-1">
                Click{" "}
                <button
                  type="button"
                  onClick={() => {
                    setEditEntry(null);
                    setShowModal(true);
                  }}
                  className="underline hover:text-accent transition-smooth"
                >
                  Add Entry
                </button>{" "}
                to record the first packing run.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-industrial">
                <thead>
                  <tr>
                    <th>
                      <button
                        type="button"
                        onClick={() => toggleSort("date")}
                        className="flex items-center gap-1 hover:text-accent transition-smooth"
                        data-ocid="packing-log.sort_date.toggle"
                      >
                        Date <SortIcon field="date" />
                      </button>
                    </th>
                    <th>
                      <button
                        type="button"
                        onClick={() => toggleSort("batchCode")}
                        className="flex items-center gap-1 hover:text-accent transition-smooth"
                        data-ocid="packing-log.sort_batch.toggle"
                      >
                        Batch Code <SortIcon field="batchCode" />
                      </button>
                    </th>
                    <th>Product</th>
                    <th>Variety</th>
                    <th>Machine</th>
                    <th>Crew</th>
                    <th>Food Tank Nos.</th>
                    <th>Bulk Bag Lot</th>
                    <th>Best Before</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLogs.map((log, i) => (
                    <tr
                      key={String(log.id)}
                      data-ocid={`packing-log.item.${i + 1}`}
                    >
                      <td className="whitespace-nowrap font-display text-xs">
                        {log.date}
                      </td>
                      <td className="whitespace-nowrap">
                        <span className="badge-accent">{log.batchCode}</span>
                      </td>
                      <td className="font-body">{log.productName}</td>
                      <td className="text-muted-foreground">{log.variety}</td>
                      <td className="font-display text-xs">{log.machineNo}</td>
                      <td className="font-display text-xs">{log.crew}</td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {log.tankBatchCodes.length > 0 ? (
                            log.tankBatchCodes.map((t) => (
                              <span key={t} className="badge-accent text-xs">
                                {t}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              —
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="font-display text-xs">
                        {log.bulkBagLotNo || "—"}
                      </td>
                      <td className="whitespace-nowrap font-display text-xs">
                        {log.bestBefore || "—"}
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-2">
                          {role === "supervisor" && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditEntry(log);
                                  setShowModal(true);
                                }}
                                className="p-1.5 border border-border hover:border-accent hover:text-accent transition-smooth"
                                aria-label={`Edit ${log.batchCode}`}
                                data-ocid={`packing-log.edit_button.${i + 1}`}
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteEntry(log)}
                                className="p-1.5 border border-border hover:border-destructive hover:text-destructive transition-smooth"
                                aria-label={`Delete ${log.batchCode}`}
                                data-ocid={`packing-log.delete_button.${i + 1}`}
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <EntryModal
          entry={editEntry}
          onClose={() => {
            setShowModal(false);
            setEditEntry(null);
          }}
        />
      )}
      {deleteEntry && (
        <DeleteDialog
          entry={deleteEntry}
          onClose={() => setDeleteEntry(null)}
        />
      )}
    </Layout>
  );
}
