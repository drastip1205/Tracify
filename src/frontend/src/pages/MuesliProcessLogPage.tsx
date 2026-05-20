import { createActor } from "@/backend";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { Layout } from "@/components/Layout";
import { QrScannerModal } from "@/components/QrScannerModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import {
  useAddMuesliProcessLog,
  useCheckDuplicateLotNumber,
  useDeleteMuesliProcessLog,
  useMuesliProcessLogs,
  useUpdateMuesliProcessLog,
} from "@/lib/backend-client";
import type {
  IngredientRow,
  MuesliProcessLogEntry,
  MuesliProcessLogInput,
} from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ChevronDown,
  Download,
  FlaskConical,
  Pencil,
  Plus,
  QrCode,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { useRef } from "react";
import { toast } from "sonner";

// ─── Empty ingredient ─────────────────────────────────────────────────────────
const emptyIngredient = (): IngredientRow => ({
  ingredientName: "",
  qty: "",
  lotNo: "",
  openingStock: "",
  issueFromStores: "",
  closingStock: "",
});

const emptyForm = (): MuesliProcessLogInput => ({
  date: "",
  shift: "",
  product: "",
  run: "",
  ingredients: [emptyIngredient()],
  createdAt: BigInt(0),
  createdBy: "",
});

// ─── Ingredient Form Row ──────────────────────────────────────────────────────
function _IngredientFormRow({
  ing,
  index,
  canRemove,
  onChange,
  onRemove,
}: {
  ing: IngredientRow;
  index: number;
  canRemove: boolean;
  onChange: (i: number, field: keyof IngredientRow, val: string) => void;
  onRemove: (i: number) => void;
}) {
  const fields: {
    key: keyof IngredientRow;
    label: string;
    placeholder: string;
  }[] = [
    { key: "ingredientName", label: "Ingredient", placeholder: "Rolled Oats" },
    { key: "qty", label: "Qty", placeholder: "25 kg" },
    { key: "lotNo", label: "Lot No.", placeholder: "LOT-001" },
    { key: "openingStock", label: "Opening", placeholder: "100 kg" },
    { key: "issueFromStores", label: "Issued", placeholder: "50 kg" },
    { key: "closingStock", label: "Closing", placeholder: "50 kg" },
  ];
  return (
    <div
      className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_auto] gap-2 mb-2 items-end"
      data-ocid={`muesli-log.ingredient-row.${index + 1}`}
    >
      {fields.map((f) => (
        <div key={f.key}>
          {index === 0 && (
            <label
              htmlFor={`ing-${index}-${f.key}`}
              className="block font-display text-xs uppercase tracking-widest text-muted-foreground mb-1"
            >
              {f.label}
            </label>
          )}
          <input
            id={`ing-${index}-${f.key}`}
            type="text"
            className="input-industrial"
            placeholder={f.placeholder}
            value={ing[f.key]}
            onChange={(e) => onChange(index, f.key, e.target.value)}
            data-ocid={`muesli-log.ingredient-row.${index + 1}.${f.key}`}
          />
        </div>
      ))}
      <div className={index === 0 ? "pt-5" : ""}>
        <button
          type="button"
          onClick={() => onRemove(index)}
          disabled={!canRemove}
          className="p-2 border-2 border-border transition-smooth hover:border-destructive hover:text-destructive disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Remove ingredient row"
          data-ocid={`muesli-log.ingredient-row.${index + 1}.delete_button`}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Ingredient Form Row with QR Scanner ─────────────────────────────────────
function IngredientFormRowWithQr({
  ing,
  index,
  canRemove,
  onChange,
  onRemove,
}: {
  ing: IngredientRow;
  index: number;
  canRemove: boolean;
  onChange: (i: number, field: keyof IngredientRow, val: string) => void;
  onRemove: (i: number) => void;
}) {
  const [showQr, setShowQr] = useState(false);

  const _nonLotFields: {
    key: keyof IngredientRow;
    label: string;
    placeholder: string;
  }[] = [
    { key: "ingredientName", label: "Ingredient", placeholder: "Rolled Oats" },
    { key: "qty", label: "Qty", placeholder: "25 kg" },
    { key: "openingStock", label: "Opening", placeholder: "100 kg" },
    { key: "issueFromStores", label: "Issued", placeholder: "50 kg" },
    { key: "closingStock", label: "Closing", placeholder: "50 kg" },
  ];

  return (
    <div
      className="grid grid-cols-[1fr_1fr_1.4fr_1fr_1fr_1fr_auto] gap-2 mb-2 items-end"
      data-ocid={`muesli-log.ingredient-row.${index + 1}`}
    >
      {/* ingredientName */}
      <div>
        {index === 0 && (
          <label
            htmlFor={`ing-name-${index}`}
            className="block font-display text-xs uppercase tracking-widest text-muted-foreground mb-1"
          >
            Ingredient
          </label>
        )}
        <input
          id={`ing-name-${index}`}
          type="text"
          className="input-industrial"
          placeholder="Rolled Oats"
          value={ing.ingredientName}
          onChange={(e) => onChange(index, "ingredientName", e.target.value)}
          data-ocid={`muesli-log.ingredient-row.${index + 1}.ingredientName`}
        />
      </div>

      {/* qty */}
      <div>
        {index === 0 && (
          <label
            htmlFor={`ing-qty-${index}`}
            className="block font-display text-xs uppercase tracking-widest text-muted-foreground mb-1"
          >
            Qty
          </label>
        )}
        <input
          id={`ing-qty-${index}`}
          type="text"
          className="input-industrial"
          placeholder="25 kg"
          value={ing.qty}
          onChange={(e) => onChange(index, "qty", e.target.value)}
          data-ocid={`muesli-log.ingredient-row.${index + 1}.qty`}
        />
      </div>

      {/* Lot No with QR button */}
      <div>
        {index === 0 && (
          <label
            htmlFor={`ing-lot-${index}`}
            className="block font-display text-xs uppercase tracking-widest text-muted-foreground mb-1"
          >
            Lot No.
          </label>
        )}
        <div className="flex gap-1">
          <input
            id={`ing-lot-${index}`}
            type="text"
            className="input-industrial flex-1 min-w-0"
            placeholder="LOT-001"
            value={ing.lotNo}
            onChange={(e) => onChange(index, "lotNo", e.target.value)}
            data-ocid={`muesli-log.ingredient-row.${index + 1}.lotNo`}
          />
          <button
            type="button"
            onClick={() => setShowQr(true)}
            className="p-2 border-2 border-border hover:border-accent hover:text-accent transition-smooth flex-shrink-0"
            aria-label="Scan QR for Lot No"
            data-ocid={`muesli-log.ingredient-row.${index + 1}.qr_button`}
          >
            <QrCode size={14} />
          </button>
        </div>
      </div>

      {/* openingStock */}
      <div>
        {index === 0 && (
          <label
            htmlFor={`ing-opening-${index}`}
            className="block font-display text-xs uppercase tracking-widest text-muted-foreground mb-1"
          >
            Opening
          </label>
        )}
        <input
          id={`ing-opening-${index}`}
          type="text"
          className="input-industrial"
          placeholder="100 kg"
          value={ing.openingStock}
          onChange={(e) => onChange(index, "openingStock", e.target.value)}
          data-ocid={`muesli-log.ingredient-row.${index + 1}.openingStock`}
        />
      </div>

      {/* issueFromStores */}
      <div>
        {index === 0 && (
          <label
            htmlFor={`ing-issued-${index}`}
            className="block font-display text-xs uppercase tracking-widest text-muted-foreground mb-1"
          >
            Issued
          </label>
        )}
        <input
          id={`ing-issued-${index}`}
          type="text"
          className="input-industrial"
          placeholder="50 kg"
          value={ing.issueFromStores}
          onChange={(e) => onChange(index, "issueFromStores", e.target.value)}
          data-ocid={`muesli-log.ingredient-row.${index + 1}.issueFromStores`}
        />
      </div>

      {/* closingStock */}
      <div>
        {index === 0 && (
          <label
            htmlFor={`ing-closing-${index}`}
            className="block font-display text-xs uppercase tracking-widest text-muted-foreground mb-1"
          >
            Closing
          </label>
        )}
        <input
          id={`ing-closing-${index}`}
          type="text"
          className="input-industrial"
          placeholder="50 kg"
          value={ing.closingStock}
          onChange={(e) => onChange(index, "closingStock", e.target.value)}
          data-ocid={`muesli-log.ingredient-row.${index + 1}.closingStock`}
        />
      </div>

      {/* Remove button */}
      <div className={index === 0 ? "pt-5" : ""}>
        <button
          type="button"
          onClick={() => onRemove(index)}
          disabled={!canRemove}
          className="p-2 border-2 border-border transition-smooth hover:border-destructive hover:text-destructive disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Remove ingredient row"
          data-ocid={`muesli-log.ingredient-row.${index + 1}.delete_button`}
        >
          <X size={14} />
        </button>
      </div>

      {/* QR Scanner Modal */}
      {showQr && (
        <QrScannerModal
          onClose={() => setShowQr(false)}
          onScan={(value) => {
            onChange(index, "lotNo", value);
            setShowQr(false);
          }}
        />
      )}
    </div>
  );
}

// ─── Entry Form Modal ─────────────────────────────────────────────────────────
function EntryFormModal({
  open,
  onClose,
  initial,
  editId,
}: {
  open: boolean;
  onClose: () => void;
  initial: MuesliProcessLogInput;
  editId: bigint | null;
}) {
  const [form, setForm] = useState<MuesliProcessLogInput>(initial);
  const addMutation = useAddMuesliProcessLog();
  const updateMutation = useUpdateMuesliProcessLog();
  const checkDuplicateLotNumber = useCheckDuplicateLotNumber();
  const isPending = addMutation.isPending || updateMutation.isPending;

  // Validation error state
  const [errors, setErrors] = useState<{
    date?: string;
    shift?: string;
    product?: string;
    ingredients?: string;
  }>({});

  // Duplicate lot number warning
  const [dupWarning, setDupWarning] = useState<string | null>(null);
  const pendingFormRef = useRef<MuesliProcessLogInput | null>(null);

  // Reset form when modal opens with new initial
  const handleOpen = () => {
    setForm(initial);
    setErrors({});
    setDupWarning(null);
    pendingFormRef.current = null;
  };

  const setField = (field: keyof MuesliProcessLogInput, val: string) =>
    setForm((f) => ({ ...f, [field]: val }));

  const handleIngChange = (
    i: number,
    field: keyof IngredientRow,
    val: string,
  ) =>
    setForm((f) => {
      const ings = [...f.ingredients];
      ings[i] = { ...ings[i], [field]: val };
      return { ...f, ingredients: ings };
    });

  const addIngRow = () =>
    setForm((f) => ({
      ...f,
      ingredients: [...f.ingredients, emptyIngredient()],
    }));

  const removeIngRow = (i: number) =>
    setForm((f) => ({
      ...f,
      ingredients: f.ingredients.filter((_, idx) => idx !== i),
    }));

  const doSubmit = async (data: MuesliProcessLogInput) => {
    try {
      if (editId !== null) {
        await updateMutation.mutateAsync({ id: editId, input: data });
        toast.success("Entry updated successfully.");
      } else {
        await addMutation.mutateAsync(data);
        toast.success("Entry added successfully.");
      }
      setDupWarning(null);
      pendingFormRef.current = null;
      onClose();
    } catch {
      toast.error("Failed to save entry. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const newErrors: typeof errors = {};
    if (!form.date.trim()) newErrors.date = "Field is required";
    if (!form.shift.trim()) newErrors.shift = "Field is required";
    if (!form.product.trim()) newErrors.product = "Field is required";
    const hasValidIngredient = form.ingredients.some(
      (ing) => ing.ingredientName.trim() !== "" && ing.lotNo.trim() !== "",
    );
    if (!hasValidIngredient)
      newErrors.ingredients =
        "At least one ingredient must have a name and lot number.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    // Duplicate lot number detection (first ingredient with a lot number)
    const firstLotNo = form.ingredients
      .find((ing) => ing.lotNo.trim() !== "")
      ?.lotNo.trim();
    if (firstLotNo && editId === null) {
      const isDuplicate = await checkDuplicateLotNumber(
        firstLotNo,
        "rawMaterials",
      );
      if (isDuplicate) {
        pendingFormRef.current = form;
        setDupWarning(firstLotNo);
        return;
      }
    }

    await doSubmit(form);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
        else handleOpen();
      }}
    >
      <DialogContent
        className="max-w-5xl w-full max-h-[90vh] overflow-y-auto bg-card border-2 border-border rounded-none p-0"
        data-ocid="muesli-log.dialog"
      >
        <DialogHeader className="px-6 py-4 border-b-2 border-border bg-primary">
          <DialogTitle className="font-display font-bold text-sm uppercase tracking-widest text-primary-foreground">
            {editId !== null
              ? "Edit Raw Materials Entry"
              : "Add Raw Materials Entry"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          {/* Duplicate lot number warning banner */}
          {dupWarning && (
            <div
              className="mb-4 border-2 border-yellow-400 bg-yellow-50 p-4 rounded-none"
              style={{
                background: "oklch(0.97 0.08 90 / 0.4)",
                borderColor: "oklch(0.8 0.15 90)",
              }}
              data-ocid="muesli-log.dup_warning"
            >
              <p
                className="font-body text-sm font-semibold mb-3"
                style={{ color: "oklch(0.45 0.15 90)" }}
              >
                ⚠ Lot number{" "}
                <span className="font-mono font-bold">{dupWarning}</span>{" "}
                already exists in Raw Materials. Do you still want to save this
                entry?
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (pendingFormRef.current)
                      doSubmit(pendingFormRef.current);
                  }}
                  className="btn-accent text-xs px-4 py-2"
                  data-ocid="muesli-log.dup_confirm_button"
                >
                  Yes, Save Anyway
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDupWarning(null);
                    pendingFormRef.current = null;
                  }}
                  className="btn-ghost text-xs px-4 py-2"
                  data-ocid="muesli-log.dup_cancel_button"
                >
                  No, Cancel
                </button>
              </div>
            </div>
          )}

          {/* Header fields */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              {
                key: "date" as const,
                label: "Date",
                placeholder: "2024-01-15",
                type: "date",
              },
              { key: "shift" as const, label: "Shift", placeholder: "Morning" },
              {
                key: "product" as const,
                label: "Product",
                placeholder: "Classic Muesli 500g",
              },
              { key: "run" as const, label: "Run", placeholder: "Run 1" },
            ].map((f) => (
              <div key={f.key}>
                <label
                  htmlFor={`mpl-${f.key}`}
                  className="block font-display text-xs uppercase tracking-widest text-muted-foreground mb-1"
                >
                  {f.label}
                  {(f.key === "date" ||
                    f.key === "shift" ||
                    f.key === "product") && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </label>
                <input
                  id={`mpl-${f.key}`}
                  type={f.type ?? "text"}
                  className={`input-industrial ${
                    errors[f.key as keyof typeof errors]
                      ? "border-destructive"
                      : ""
                  }`}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={(e) => setField(f.key, e.target.value)}
                  data-ocid={`muesli-log.${f.key}_input`}
                />
                {errors[f.key as keyof typeof errors] && (
                  <p className="text-destructive text-xs mt-1">
                    {errors[f.key as keyof typeof errors]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Ingredients */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">
                Ingredients ({form.ingredients.length})
                <span className="text-destructive ml-1">*</span>
              </span>
              <button
                type="button"
                onClick={addIngRow}
                className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1"
                data-ocid="muesli-log.add_ingredient_button"
              >
                <Plus size={12} /> Add Row
              </button>
            </div>

            {errors.ingredients && (
              <p className="text-destructive text-xs mb-2">
                {errors.ingredients}
              </p>
            )}

            <div className="border-2 border-border p-3 bg-muted/30">
              {form.ingredients.map((ing, i) => (
                <IngredientFormRowWithQr
                  key={
                    ing.ingredientName
                      ? `${ing.ingredientName}-${i}`
                      : `ing-row-${i}`
                  }
                  ing={ing}
                  index={i}
                  canRemove={form.ingredients.length > 1}
                  onChange={handleIngChange}
                  onRemove={removeIngRow}
                />
              ))}
            </div>
          </div>

          {/* Submit actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border mt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
              data-ocid="muesli-log.cancel_button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn-accent"
              data-ocid="muesli-log.submit_button"
            >
              {isPending
                ? "Saving…"
                : editId !== null
                  ? "Update Entry"
                  : "Add Entry"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Expanded ingredient sub-table ───────────────────────────────────────────
function IngredientSubTable({
  logIndex,
  ingredients,
}: {
  logIndex: number;
  ingredients: IngredientRow[];
}) {
  return (
    <div className="px-4 pb-4 pt-2">
      <div
        className="border border-border overflow-hidden"
        style={{ background: "oklch(var(--muted) / 0.5)" }}
      >
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr style={{ background: "oklch(var(--primary) / 0.85)" }}>
              {[
                "Ingredient Name",
                "Qty",
                "Lot No.",
                "Opening Stock",
                "Issue from Stores",
                "Closing Stock",
              ].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2 font-display font-semibold uppercase tracking-widest text-primary-foreground text-left border-b border-border whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ing, j) => (
              <tr
                key={`${logIndex}-${ing.ingredientName}-${j}`}
                className="border-b border-border last:border-b-0 hover:bg-muted/70 transition-smooth"
                data-ocid={`muesli-log.ingredient.${logIndex + 1}.${j + 1}`}
              >
                <td className="px-3 py-2 font-semibold font-body text-foreground">
                  {ing.ingredientName}
                </td>
                <td className="px-3 py-2 font-body text-foreground">
                  {ing.qty}
                </td>
                <td className="px-3 py-2">
                  <span className="badge-accent">{ing.lotNo}</span>
                </td>
                <td className="px-3 py-2 font-body text-muted-foreground">
                  {ing.openingStock}
                </td>
                <td className="px-3 py-2 font-body text-muted-foreground">
                  {ing.issueFromStores}
                </td>
                <td className="px-3 py-2 font-body text-muted-foreground">
                  {ing.closingStock}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MuesliProcessLogPage() {
  const { data: rawLogs = [], isLoading } = useMuesliProcessLogs();
  const deleteMutation = useDeleteMuesliProcessLog();
  const { role } = useAuth();
  const { actor } = useActor(createActor);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<MuesliProcessLogEntry | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] =
    useState<MuesliProcessLogEntry | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [exporting, setExporting] = useState(false);

  // Sort and filter by date
  const logs = [...rawLogs]
    .filter(
      (entry) =>
        (fromDate === "" || entry.date >= fromDate) &&
        (toDate === "" || entry.date <= toDate),
    )
    .sort((a, b) => {
      const cmp = a.date.localeCompare(b.date);
      return sortDir === "asc" ? cmp : -cmp;
    });

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const openAdd = () => {
    setEditEntry(null);
    setModalOpen(true);
  };

  const openEdit = (entry: MuesliProcessLogEntry) => {
    setEditEntry(entry);
    setModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Entry deleted.");
    } catch {
      toast.error("Failed to delete entry.");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleExportCsv = async () => {
    if (!actor) {
      toast.error("Not connected. Please wait and try again.");
      return;
    }
    setExporting(true);
    try {
      const allLogs = await actor.getMuesliProcessLogs(null);
      const rows: string[] = [
        [
          "Date",
          "Shift",
          "Product",
          "Run",
          "Ingredient",
          "Qty",
          "Lot No",
          "Opening Stock",
          "Issue from Stores",
          "Closing Stock",
          "Created At",
          "Created By",
          "Updated By",
        ].join(","),
      ];
      for (const log of allLogs) {
        for (const ing of log.ingredients) {
          const createdAt = new Date(
            Number(log.createdAt) / 1_000_000,
          ).toISOString();
          rows.push(
            [
              log.date,
              log.shift,
              `"${log.product.replace(/"/g, '""')}"`,
              log.run,
              `"${ing.ingredientName.replace(/"/g, '""')}"`,
              ing.qty,
              ing.lotNo,
              ing.openingStock,
              ing.issueFromStores,
              ing.closingStock,
              createdAt,
              log.createdBy,
              log.updatedBy ?? "",
            ].join(","),
          );
        }
      }
      const blob = new Blob([rows.join("\n")], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `raw-materials-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported successfully.");
    } catch {
      toast.error("Failed to export CSV.");
    } finally {
      setExporting(false);
    }
  };

  const formInitial: MuesliProcessLogInput = editEntry
    ? {
        date: editEntry.date,
        shift: editEntry.shift,
        product: editEntry.product,
        run: editEntry.run,
        ingredients: editEntry.ingredients.map((ing) => ({ ...ing })),
        createdAt: editEntry.createdAt,
        createdBy: editEntry.createdBy,
      }
    : emptyForm();

  return (
    <Layout>
      <div className="px-6 py-6" data-ocid="muesli-log.page">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-smooth"
          data-ocid="muesli-log.back_link"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        {/* Page Header */}
        <div className="mb-6 border-b-2 border-border pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FlaskConical size={20} className="text-accent" />
            <div>
              <h1 className="font-display font-bold text-xl uppercase tracking-widest text-foreground">
                Raw Materials
              </h1>
              <p className="font-body text-xs text-muted-foreground mt-0.5">
                Ingredient lot numbers, quantities, and processing shifts per
                date
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-ghost flex items-center gap-1.5 text-xs"
              onClick={handleExportCsv}
              disabled={exporting}
              data-ocid="muesli-log.export_csv_button"
            >
              <Download size={13} />
              {exporting ? "Exporting…" : "Export CSV"}
            </button>
            <button
              type="button"
              className="btn-accent"
              onClick={openAdd}
              data-ocid="muesli-log.add_button"
            >
              <Plus size={14} /> Add Entry
            </button>
          </div>
        </div>

        {/* Date Range Filter */}
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

        {/* Table Container */}
        <div className="border-2 border-border">
          {/* Section Header */}
          <div className="section-header">
            <span className="font-display font-semibold text-xs uppercase tracking-widest">
              Log Entries
            </span>
            <span
              className="font-display text-xs"
              style={{ color: "oklch(var(--primary-foreground) / 0.6)" }}
            >
              {logs.length} {logs.length === 1 ? "record" : "records"}
            </span>
          </div>

          {/* Column Headers */}
          {!isLoading && logs.length > 0 && (
            <div
              className="grid border-b-2 border-border"
              style={{
                gridTemplateColumns: "1.4fr 0.7fr 1.6fr 0.7fr 0.9fr 1fr",
                background: "oklch(var(--primary) / 0.06)",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                }
                className="flex items-center gap-1 px-4 py-3 font-display font-semibold text-xs uppercase tracking-widest text-muted-foreground hover:text-accent transition-smooth text-left"
                data-ocid="muesli-log.sort_date_button"
              >
                Date
                <ChevronDown
                  size={12}
                  className={`transition-smooth ${sortDir === "asc" ? "rotate-180" : ""}`}
                />
              </button>
              {["Shift", "Product", "Run", "Ingredients", "Actions"].map(
                (h) => (
                  <div
                    key={h}
                    className="px-4 py-3 font-display font-semibold text-xs uppercase tracking-widest text-muted-foreground"
                  >
                    {h}
                  </div>
                ),
              )}
            </div>
          )}

          {/* Body */}
          {isLoading ? (
            <div
              className="p-8 text-center font-display text-xs uppercase tracking-widest text-muted-foreground"
              data-ocid="muesli-log.loading_state"
            >
              Loading entries&hellip;
            </div>
          ) : logs.length === 0 ? (
            <div
              className="p-12 text-center"
              data-ocid="muesli-log.empty_state"
            >
              <FlaskConical
                size={36}
                className="mx-auto mb-3 text-muted-foreground"
              />
              <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">
                No raw materials entries yet
              </p>
              <p className="font-body text-sm text-muted-foreground mt-1">
                Add the first entry to begin recording ingredient lot numbers.
              </p>
              <button
                type="button"
                onClick={openAdd}
                className="btn-accent mt-4"
                data-ocid="muesli-log.empty_state_add_button"
              >
                <Plus size={14} /> Add First Entry
              </button>
            </div>
          ) : (
            <div>
              {logs.map((log, i) => {
                const key = String(log.id);
                const open = expanded.has(key);
                return (
                  <div
                    key={key}
                    className="border-b border-border last:border-b-0"
                    data-ocid={`muesli-log.item.${i + 1}`}
                  >
                    {/* Row */}
                    <div
                      className="grid items-center hover:bg-muted/40 transition-smooth"
                      style={{
                        gridTemplateColumns:
                          "1.4fr 0.7fr 1.6fr 0.7fr 0.9fr 1fr",
                      }}
                    >
                      {/* Date — clickable to expand */}
                      <button
                        type="button"
                        onClick={() => toggle(key)}
                        className="flex items-center gap-2 px-4 py-3 text-left w-full h-full"
                        data-ocid={`muesli-log.toggle.${i + 1}`}
                      >
                        <ChevronDown
                          size={13}
                          className={`text-muted-foreground flex-shrink-0 transition-smooth ${open ? "rotate-180" : ""}`}
                        />
                        <span className="font-display font-semibold text-sm text-foreground">
                          {log.date}
                        </span>
                      </button>

                      <div className="px-4 py-3 font-body text-sm text-foreground">
                        {log.shift}
                      </div>
                      <div
                        className="px-4 py-3 font-body text-sm text-foreground truncate"
                        title={log.product}
                      >
                        {log.product}
                      </div>
                      <div className="px-4 py-3 font-body text-sm text-muted-foreground">
                        {log.run}
                      </div>

                      <div className="px-4 py-3">
                        <span className="badge-accent">
                          {log.ingredients.length}{" "}
                          {log.ingredients.length === 1
                            ? "ingredient"
                            : "ingredients"}
                        </span>
                      </div>

                      <div className="px-4 py-3 flex items-center gap-2">
                        {role === "supervisor" && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEdit(log)}
                              className="p-1.5 border-2 border-border hover:border-accent hover:text-accent transition-smooth"
                              aria-label="Edit entry"
                              data-ocid={`muesli-log.edit_button.${i + 1}`}
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(log)}
                              className="p-1.5 border-2 border-border hover:border-destructive hover:text-destructive transition-smooth"
                              aria-label="Delete entry"
                              data-ocid={`muesli-log.delete_button.${i + 1}`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Expanded ingredient sub-table */}
                    {open && (
                      <IngredientSubTable
                        logIndex={i}
                        ingredients={log.ingredients}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <EntryFormModal
        key={editEntry ? String(editEntry.id) : "new"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={formInitial}
        editId={editEntry ? editEntry.id : null}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent
          className="bg-card border-2 border-border rounded-none"
          data-ocid="muesli-log.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-bold uppercase tracking-widest">
              Delete Entry
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body text-muted-foreground">
              Delete the entry for{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget?.product}
              </span>{" "}
              on{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget?.date}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="btn-ghost rounded-none border-2"
              data-ocid="muesli-log.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="btn-accent rounded-none border-2"
              style={{
                background: "oklch(var(--destructive))",
                borderColor: "oklch(var(--destructive))",
                color: "oklch(var(--destructive-foreground))",
              }}
              data-ocid="muesli-log.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
