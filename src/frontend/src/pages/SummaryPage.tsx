import { createActor } from "@/backend";
import type {
  MuesliProcessLogEntry,
  PackingLogEntry,
  TankRoomLogEntry,
} from "@/backend";
import { Layout } from "@/components/Layout";
import {
  useMuesliProcessLogs,
  usePackingLogs,
  useTankRoomLogs,
} from "@/lib/backend-client";
import { useActor } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ClipboardList, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function TableContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto border border-border rounded-md">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="bg-muted/50 text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap">
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: { children: React.ReactNode; className?: string }) {
  return (
    <td
      className={`px-4 py-3 text-foreground border-t border-border text-sm ${className ?? ""}`}
    >
      {children}
    </td>
  );
}

function SectionHeading({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-display font-bold text-base uppercase tracking-widest text-foreground">
        {title}
      </h2>
      <span className="text-xs text-muted-foreground font-body">
        {count} {count === 1 ? "record" : "records"}
      </span>
    </div>
  );
}

function EmptyRow({ cols }: { cols: number }) {
  return (
    <tr>
      <td
        colSpan={cols}
        className="px-4 py-8 text-center text-muted-foreground text-sm italic border-t border-border"
        data-ocid="summary.empty_state"
      >
        No records yet.
      </td>
    </tr>
  );
}

function PackingLogSection({ entries }: { entries: PackingLogEntry[] }) {
  return (
    <section data-ocid="summary.packing_log.section">
      <SectionHeading title="Packing Log" count={entries.length} />
      <TableContainer>
        <thead>
          <tr>
            <Th>Date</Th>
            <Th>Product</Th>
            <Th>Batch No.</Th>
            <Th>Machine No.</Th>
            <Th>MFG Date</Th>
            <Th>Best Before</Th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <EmptyRow cols={6} />
          ) : (
            entries.map((entry, i) => (
              <tr
                key={String(entry.id)}
                data-ocid={`summary.packing_log.item.${i + 1}`}
              >
                <Td>{entry.date}</Td>
                <Td>{entry.productName}</Td>
                <Td className="font-display font-semibold">
                  {entry.batchCode}
                  {entry.createdBy && entry.createdBy !== "legacy" && (
                    <span className="text-xs text-muted-foreground block">
                      Added:{" "}
                      {new Date(
                        Number(entry.createdAt) / 1_000_000,
                      ).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </Td>
                <Td>{entry.machineNo}</Td>
                <Td>{entry.mfgDate}</Td>
                <Td>{entry.bestBefore}</Td>
              </tr>
            ))
          )}
        </tbody>
      </TableContainer>
    </section>
  );
}

function TankRoomLogSection({ entries }: { entries: TankRoomLogEntry[] }) {
  return (
    <section data-ocid="summary.tank_room_log.section">
      <SectionHeading title="Tank Room Log" count={entries.length} />
      <TableContainer>
        <thead>
          <tr>
            <Th>Date</Th>
            <Th>Shift</Th>
            <Th>Product Run</Th>
            <Th>Food Tank No.</Th>
            <Th>Tank Status</Th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <EmptyRow cols={5} />
          ) : (
            entries.map((entry, i) => (
              <tr
                key={String(entry.id)}
                data-ocid={`summary.tank_room_log.item.${i + 1}`}
              >
                <Td>{entry.date}</Td>
                <Td>{entry.shift || "—"}</Td>
                <Td>{entry.productRun || "—"}</Td>
                <Td className="font-display font-semibold">
                  {entry.foodTankNo}
                  {entry.createdBy && entry.createdBy !== "legacy" && (
                    <span className="text-xs text-muted-foreground block">
                      Added:{" "}
                      {new Date(
                        Number(entry.createdAt) / 1_000_000,
                      ).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </Td>
                <Td>{String(entry.tankStatus)}</Td>
              </tr>
            ))
          )}
        </tbody>
      </TableContainer>
    </section>
  );
}

function RawMaterialsSection({
  entries,
}: { entries: MuesliProcessLogEntry[] }) {
  const rows = entries.flatMap((entry) =>
    entry.ingredients.map((ing, j) => ({
      key: `${String(entry.id)}-${j}`,
      date: entry.date,
      product: entry.product,
      ingredientName: ing.ingredientName,
      lotNo: ing.lotNo,
      qty: ing.qty,
      createdAt: entry.createdAt,
      createdBy: entry.createdBy,
    })),
  );

  return (
    <section data-ocid="summary.raw_materials.section">
      <SectionHeading title="Raw Materials" count={rows.length} />
      <TableContainer>
        <thead>
          <tr>
            <Th>Date</Th>
            <Th>Product</Th>
            <Th>Ingredient Name</Th>
            <Th>Lot No.</Th>
            <Th>Qty</Th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <EmptyRow cols={5} />
          ) : (
            rows.map((row, i) => (
              <tr
                key={row.key}
                data-ocid={`summary.raw_materials.item.${i + 1}`}
              >
                <Td>{row.date}</Td>
                <Td>{row.product}</Td>
                <Td className="font-medium">
                  {row.ingredientName}
                  {row.createdBy && row.createdBy !== "legacy" && (
                    <span className="text-xs text-muted-foreground block">
                      Added:{" "}
                      {new Date(
                        Number(row.createdAt) / 1_000_000,
                      ).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </Td>
                <Td className="font-display font-semibold">{row.lotNo}</Td>
                <Td>{row.qty}</Td>
              </tr>
            ))
          )}
        </tbody>
      </TableContainer>
    </section>
  );
}

export default function SummaryPage() {
  const { data: packingLogs = [], isLoading: loadingPacking } =
    usePackingLogs();
  const { data: tankRoomLogs = [], isLoading: loadingTank } = useTankRoomLogs();
  const { data: muesliLogs = [], isLoading: loadingMuesli } =
    useMuesliProcessLogs();
  const { actor } = useActor(createActor);
  const [exporting, setExporting] = useState(false);

  const isLoading = loadingPacking || loadingTank || loadingMuesli;

  function nanosToDateStr(ns: bigint): string {
    try {
      return new Date(Number(ns) / 1_000_000).toISOString().split("T")[0];
    } catch {
      return "";
    }
  }

  function escCsv(v: string | bigint | undefined | null): string {
    const s = v == null ? "" : String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  }

  async function handleExportCsv() {
    if (!actor) {
      toast.error("Actor not ready. Please try again.");
      return;
    }
    setExporting(true);
    try {
      const [pLogs, tLogs, mLogs] = await Promise.all([
        actor.getPackingLogs(null),
        actor.getTankRoomLogs(null),
        actor.getMuesliProcessLogs(null),
      ]);

      const lines: string[] = [];

      // Packing Log section
      lines.push("=== PACKING LOG ===");
      lines.push(
        [
          "Date",
          "Product",
          "Batch Code",
          "Machine No.",
          "Crew",
          "Variety",
          "Net Weight",
          "MFG Date",
          "Best Before",
          "MRP",
          "Case Code",
          "Bulk Bag Supplier",
          "Bulk Bag Lot No.",
          "Case/Partition Supplier",
          "Case/Partition Lot No.",
          "Food Tank Nos.",
          "Created By",
          "Created At",
          "Updated By",
          "Updated At",
        ].join(","),
      );
      for (const e of pLogs) {
        lines.push(
          [
            escCsv(e.date),
            escCsv(e.productName),
            escCsv(e.batchCode),
            escCsv(e.machineNo),
            escCsv(e.crew),
            escCsv(e.variety),
            escCsv(e.netWeight),
            escCsv(e.mfgDate),
            escCsv(e.bestBefore),
            escCsv(e.mrp),
            escCsv(e.caseCode),
            escCsv(e.bulkBagSupplier),
            escCsv(e.bulkBagLotNo),
            escCsv(e.casePartitionSupplier),
            escCsv(e.casePartitionLotNo),
            escCsv(e.tankBatchCodes.join(" | ")),
            escCsv(e.createdBy),
            escCsv(nanosToDateStr(e.createdAt)),
            escCsv(""),
            escCsv(""),
          ].join(","),
        );
      }
      lines.push("");

      // Tank Room Log section
      lines.push("=== TANK ROOM LOG ===");
      lines.push(
        [
          "Date",
          "Shift",
          "Product Run",
          "Food Tank No.",
          "Tank Status",
          "Cleaning Time In",
          "Cleaning Time Out",
          "Reason for Hold",
          "Corrective Action",
          "Remark",
          "Created By",
          "Created At",
        ].join(","),
      );
      for (const e of tLogs) {
        lines.push(
          [
            escCsv(e.date),
            escCsv(e.shift),
            escCsv(e.productRun),
            escCsv(e.foodTankNo),
            escCsv(String(e.tankStatus)),
            escCsv(e.fillingTimeIn ?? ""),
            escCsv(e.fillingTimeOut ?? ""),
            escCsv(e.reasonForHold ?? ""),
            escCsv(e.correctiveAction ?? ""),
            escCsv(e.remark ?? ""),
            escCsv(e.createdBy),
            escCsv(nanosToDateStr(e.createdAt)),
          ].join(","),
        );
      }
      lines.push("");

      // Raw Materials section
      lines.push("=== RAW MATERIALS (MUESLI PROCESS LOG) ===");
      lines.push(
        [
          "Date",
          "Shift",
          "Product",
          "Run",
          "Ingredient",
          "Qty",
          "Lot No.",
          "Opening Stock",
          "Issue from Stores",
          "Closing Stock",
          "Created By",
          "Created At",
        ].join(","),
      );
      for (const e of mLogs) {
        for (const ing of e.ingredients) {
          lines.push(
            [
              escCsv(e.date),
              escCsv(e.shift),
              escCsv(e.product),
              escCsv(e.run),
              escCsv(ing.ingredientName),
              escCsv(ing.qty),
              escCsv(ing.lotNo),
              escCsv(ing.openingStock),
              escCsv(ing.issueFromStores),
              escCsv(ing.closingStock),
              escCsv(e.createdBy),
              escCsv(nanosToDateStr(e.createdAt)),
            ].join(","),
          );
        }
      }

      const csv = lines.join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const today = new Date().toISOString().split("T")[0];
      a.href = url;
      a.download = `tracify-export-${today}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("CSV exported successfully!");
    } catch {
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8" data-ocid="summary.page">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-5"
          data-ocid="summary.back_link"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <div className="flex items-start justify-between mb-8 pb-4 border-b-2 border-border gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <ClipboardList size={22} className="text-accent" />
            <div>
              <h1 className="font-display font-bold text-2xl uppercase tracking-widest text-foreground">
                Summary
              </h1>
              <p className="font-body text-xs text-muted-foreground mt-0.5">
                View all data entries across Packing Log, Tank Room Log, and Raw
                Materials
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={exporting || isLoading}
            className="btn-accent flex items-center gap-2"
            data-ocid="summary.export_csv_button"
          >
            <Download size={14} />
            {exporting ? "Exporting…" : "Export All Data (CSV)"}
          </button>
        </div>

        {isLoading ? (
          <div
            className="py-20 text-center font-display text-xs uppercase tracking-widest text-muted-foreground"
            data-ocid="summary.loading_state"
          >
            Loading all data&hellip;
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            <PackingLogSection entries={packingLogs} />
            <TankRoomLogSection entries={tankRoomLogs} />
            <RawMaterialsSection entries={muesliLogs} />
          </div>
        )}
      </div>
    </Layout>
  );
}
