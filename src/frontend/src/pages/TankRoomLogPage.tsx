import { TankStatus } from "@/backend";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { Layout } from "@/components/Layout";
import { TankRoomLogForm } from "@/components/TankRoomLogForm";
import { useAuth } from "@/hooks/useAuth";
import {
  useAddTankRoomLog,
  useDeleteTankRoomLog,
  useTankRoomLogs,
  useUpdateTankRoomLog,
} from "@/lib/backend-client";
import type { TankRoomLogEntry, TankRoomLogInput } from "@/types";
import { tankStatusLabel } from "@/types";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowUpDown,
  ClipboardList,
  Pencil,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type SortKey = "date" | "foodTankNo";
type SortDir = "asc" | "desc";

function TankStatusBadge({
  status,
}: { status: TankRoomLogEntry["tankStatus"] }) {
  // status is a plain enum string from the backend
  const label =
    status === TankStatus.Food
      ? "Food"
      : status === TankStatus.Hold
        ? "Hold"
        : status === TankStatus.Feed
          ? "Feed"
          : String(status);
  const styleMap: Record<string, React.CSSProperties> = {
    Food: {},
    Hold: {
      color: "oklch(0.6 0.15 85)",
      backgroundColor: "oklch(0.97 0.05 85)",
      borderColor: "oklch(0.75 0.12 85)",
    },
    Feed: {
      color: "oklch(0.5 0.15 240)",
      backgroundColor: "oklch(0.97 0.04 240)",
      borderColor: "oklch(0.75 0.1 240)",
    },
  };
  return (
    <span className="badge-accent" style={styleMap[label] ?? {}}>
      {label}
    </span>
  );
}

function DeleteDialog({
  entry,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  entry: TankRoomLogEntry;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)" }}
      data-ocid="tank-log.dialog"
    >
      <div className="bg-card border-2 border-border w-full max-w-sm shadow-lg">
        <div className="section-header">
          <span className="font-display font-bold text-sm uppercase tracking-widest">
            Confirm Delete
          </span>
        </div>
        <div className="p-5">
          <p className="font-body text-sm text-foreground mb-1">
            Delete tank room entry for tank {entry.foodTankNo}?
          </p>
          <p className="font-body text-xs text-muted-foreground">
            Food Tank No.{" "}
            <span className="font-display font-semibold">
              {entry.foodTankNo}
            </span>{" "}
            — {entry.date}
          </p>
          <p className="font-body text-xs text-destructive mt-2">
            This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 mt-5">
            <button
              type="button"
              className="btn-ghost"
              onClick={onCancel}
              data-ocid="tank-log.cancel_button"
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              style={{
                background: "oklch(var(--destructive))",
                borderColor: "oklch(var(--destructive))",
                color: "oklch(var(--destructive-foreground))",
              }}
              disabled={isDeleting}
              onClick={onConfirm}
              data-ocid="tank-log.confirm_button"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TankRoomLogPage() {
  const { data: logs = [], isLoading } = useTankRoomLogs();
  const addMut = useAddTankRoomLog();
  const updateMut = useUpdateTankRoomLog();
  const deleteMut = useDeleteTankRoomLog();
  const { role } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState<TankRoomLogEntry | null>(null);
  const [deleteEntry, setDeleteEntry] = useState<TankRoomLogEntry | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const sorted = useMemo(() => {
    const filtered = logs.filter((log) => {
      if (fromDate && log.date < fromDate) return false;
      if (toDate && log.date > toDate) return false;
      return true;
    });
    return filtered.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [logs, sortKey, sortDir, fromDate, toDate]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function openAdd() {
    setEditEntry(null);
    setShowForm(true);
  }
  function openEdit(e: TankRoomLogEntry) {
    setEditEntry(e);
    setShowForm(true);
  }
  function closeForm() {
    setShowForm(false);
    setEditEntry(null);
  }

  async function handleSubmit(data: TankRoomLogInput) {
    try {
      if (editEntry) {
        await updateMut.mutateAsync({ id: editEntry.id, input: data });
        toast.success("Entry updated");
      } else {
        await addMut.mutateAsync(data);
        toast.success("Entry added");
      }
      closeForm();
    } catch {
      toast.error("Failed to save entry");
    }
  }

  async function handleDelete() {
    if (!deleteEntry) return;
    try {
      await deleteMut.mutateAsync(deleteEntry.id);
      toast.success("Entry deleted");
      setDeleteEntry(null);
    } catch {
      toast.error("Failed to delete entry");
    }
  }

  const SortIcon = ({ col }: { col: SortKey }) => (
    <ArrowUpDown
      size={11}
      className={`ml-1 inline-block opacity-50 ${
        sortKey === col ? "opacity-100 text-accent" : ""
      }`}
    />
  );

  return (
    <Layout>
      {(showForm || editEntry !== null) && showForm && (
        <TankRoomLogForm
          initial={editEntry}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          isSubmitting={addMut.isPending || updateMut.isPending}
        />
      )}

      {deleteEntry && (
        <DeleteDialog
          entry={deleteEntry}
          onConfirm={handleDelete}
          onCancel={() => setDeleteEntry(null)}
          isDeleting={deleteMut.isPending}
        />
      )}

      <div className="px-6 py-6" data-ocid="tank-log.page">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          data-ocid="tank-log.back_link"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        {/* Page header */}
        <div className="mb-6 border-b-2 border-border pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList size={20} className="text-accent" />
            <div>
              <h1 className="font-display font-bold text-xl uppercase tracking-widest text-foreground">
                Tank Room Log
              </h1>
              <p className="font-body text-xs text-muted-foreground mt-0.5">
                Track food tank fill dates, shifts, batch codes, and tank status
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-accent"
            onClick={openAdd}
            data-ocid="tank-log.add_button"
          >
            + Add Entry
          </button>
        </div>

        {/* Table card */}
        <div className="border-2 border-border">
          <div className="section-header">
            <span className="font-display font-semibold text-xs uppercase tracking-widest">
              Log Entries
            </span>
            <span className="font-display text-xs text-primary-foreground/60">
              {sorted.length} of {logs.length} records
            </span>
          </div>

          {/* Date range filter */}
          <DateRangeFilter
            onApply={(from, to) => {
              setFromDate(from);
              setToDate(to);
            }}
            onClear={() => {
              setFromDate("");
              setToDate("");
            }}
          />

          {isLoading ? (
            <div
              className="p-8 text-center font-display text-xs uppercase tracking-widest text-muted-foreground"
              data-ocid="tank-log.loading_state"
            >
              Loading entries&hellip;
            </div>
          ) : sorted.length === 0 ? (
            <div className="p-12 text-center" data-ocid="tank-log.empty_state">
              <ClipboardList
                size={36}
                className="mx-auto mb-3 text-muted-foreground"
              />
              <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">
                {fromDate || toDate
                  ? "No entries match the selected date range"
                  : "No tank room log entries yet"}
              </p>
              <p className="font-body text-sm text-muted-foreground mt-1">
                {fromDate || toDate
                  ? "Try clearing the date filter."
                  : "Add the first entry to begin tracking tanks."}
              </p>
              {!fromDate && !toDate && (
                <button
                  type="button"
                  className="btn-accent mt-4"
                  onClick={openAdd}
                  data-ocid="tank-log.empty_add_button"
                >
                  + Add First Entry
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-industrial">
                <thead>
                  <tr>
                    <th>
                      <button
                        type="button"
                        className="cursor-pointer select-none flex items-center gap-1 hover:text-accent transition-smooth"
                        onClick={() => toggleSort("date")}
                        onKeyDown={(e) =>
                          e.key === "Enter" && toggleSort("date")
                        }
                        data-ocid="tank-log.sort_date"
                      >
                        Date <SortIcon col="date" />
                      </button>
                    </th>
                    <th>Shift</th>
                    <th style={{ color: "oklch(var(--accent))" }}>
                      <button
                        type="button"
                        className="cursor-pointer select-none flex items-center gap-1 hover:opacity-80 transition-smooth"
                        onClick={() => toggleSort("foodTankNo")}
                        onKeyDown={(e) =>
                          e.key === "Enter" && toggleSort("foodTankNo")
                        }
                        data-ocid="tank-log.sort_food_tank"
                      >
                        Food Tank No. <SortIcon col="foodTankNo" />
                        <span
                          className="ml-1 font-body normal-case tracking-normal"
                          style={{ fontSize: "9px", opacity: 0.7 }}
                        >
                          (join key)
                        </span>
                      </button>
                    </th>
                    <th>Product Run</th>
                    <th>Status</th>
                    <th>Cleaned</th>
                    <th>Fill IN</th>
                    <th>Fill OUT</th>
                    <th>Perm. Tank No.</th>
                    <th>Remark</th>
                    {role === "supervisor" && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((log, i) => (
                    <tr
                      key={String(log.id)}
                      data-ocid={`tank-log.item.${i + 1}`}
                    >
                      <td className="font-display text-xs whitespace-nowrap">
                        {log.date}
                      </td>
                      <td className="text-xs">{log.shift || "—"}</td>
                      <td
                        className="font-display font-semibold"
                        style={{ color: "oklch(var(--accent))" }}
                      >
                        {log.foodTankNo}
                      </td>
                      <td className="text-xs">{log.productRun || "—"}</td>
                      <td>
                        <TankStatusBadge status={log.tankStatus} />
                      </td>
                      <td className="text-center">
                        {log.cleaned ? (
                          <span
                            className="font-display font-bold text-xs"
                            style={{ color: "oklch(var(--accent))" }}
                          >
                            ✓
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="font-display text-xs">
                        {log.fillingTimeIn || "—"}
                      </td>
                      <td className="font-display text-xs">
                        {log.fillingTimeOut || "—"}
                      </td>
                      <td className="text-xs text-muted-foreground">
                        {log.permanentTankNumber || "—"}
                      </td>
                      <td className="max-w-[140px] truncate text-xs text-muted-foreground">
                        {log.remark || "—"}
                      </td>
                      {role === "supervisor" && (
                        <td>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(log)}
                              className="text-muted-foreground hover:text-accent transition-smooth p-1"
                              aria-label="Edit entry"
                              data-ocid={`tank-log.edit_button.${i + 1}`}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteEntry(log)}
                              className="text-muted-foreground hover:text-destructive transition-smooth p-1"
                              aria-label="Delete entry"
                              data-ocid={`tank-log.delete_button.${i + 1}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
