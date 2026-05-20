import { Layout } from "@/components/Layout";
import { useShiftReport } from "@/lib/backend-client";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, FileText, Printer } from "lucide-react";
import { useState } from "react";

const todayStr = new Date().toISOString().slice(0, 10);

export default function ShiftReportPage() {
  const [date, setDate] = useState(todayStr);
  const [shift, setShift] = useState("All");
  const [query, setQuery] = useState<{ date: string; shift: string } | null>(
    null,
  );

  const { data: report, isLoading } = useShiftReport(
    query?.date ?? "",
    query?.shift ?? "",
  );

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setQuery({ date, shift });
  }

  const hasReport = !isLoading && report && query;

  return (
    <Layout>
      <div className="px-4 sm:px-6 py-6" data-ocid="shift-report.page">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-border pb-5">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center justify-center w-8 h-8 border-2 border-border hover:border-accent text-muted-foreground hover:text-accent transition-smooth"
              aria-label="Back to dashboard"
              data-ocid="shift-report.back.link"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="font-display font-bold text-2xl uppercase tracking-widest text-foreground">
                Shift Report
              </h1>
              <p className="font-body text-xs text-muted-foreground mt-0.5">
                Generate a report of all log entries for a given shift and date.
              </p>
            </div>
          </div>
          {hasReport && (
            <button
              type="button"
              onClick={() => window.print()}
              className="no-print flex items-center gap-2 px-4 py-2 border-2 border-border font-display text-xs uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent transition-smooth"
              data-ocid="shift-report.print.button"
            >
              <Printer size={14} />
              Print Report
            </button>
          )}
        </div>

        {/* Filter Form */}
        <form
          onSubmit={handleGenerate}
          className="mb-8 border-2 border-border bg-card p-5"
          data-ocid="shift-report.form"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="report-date"
                className="font-display text-xs uppercase tracking-widest text-muted-foreground"
              >
                Date
              </label>
              <input
                id="report-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border-2 border-border bg-background px-3 py-2 font-body text-sm text-foreground focus:outline-none focus:border-accent transition-smooth"
                required
                data-ocid="shift-report.date.input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="report-shift"
                className="font-display text-xs uppercase tracking-widest text-muted-foreground"
              >
                Shift
              </label>
              <select
                id="report-shift"
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="border-2 border-border bg-background px-3 py-2 font-body text-sm text-foreground focus:outline-none focus:border-accent transition-smooth"
                data-ocid="shift-report.shift.select"
              >
                <option value="All">All Shifts</option>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Night">Night</option>
              </select>
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-accent bg-accent/10 font-display text-xs uppercase tracking-widest text-accent hover:bg-accent/20 transition-smooth"
              data-ocid="shift-report.generate.button"
            >
              <FileText size={14} />
              Generate Report
            </button>
          </div>
        </form>

        {/* Report Output */}
        {isLoading && query && (
          <div
            className="flex items-center justify-center py-16"
            data-ocid="shift-report.loading_state"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">
                Generating report…
              </span>
            </div>
          </div>
        )}

        {hasReport && (
          <div className="flex flex-col gap-8">
            <ReportMeta date={report.date} shift={report.shift} />

            {/* 1. Packing Entries */}
            <ReportSection
              title="Packing Entries"
              count={report.packingEntries.length}
            >
              {report.packingEntries.length === 0 ? (
                <EmptyTableRow message="No packing entries for this shift." />
              ) : (
                <>
                  <thead>
                    <tr className="section-header">
                      <Th>Batch Code</Th>
                      <Th>Product</Th>
                      <Th>Date</Th>
                      <Th>Machine No</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.packingEntries.map((entry, i) => (
                      <tr
                        key={entry.batchCode || `pack-${i}`}
                        className="border-t border-border hover:bg-muted transition-smooth"
                        data-ocid={`shift-report.packing.item.${i + 1}`}
                      >
                        <Td mono>{entry.batchCode}</Td>
                        <Td>{entry.productName}</Td>
                        <Td>{entry.date}</Td>
                        <Td>{entry.machineNo}</Td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
            </ReportSection>

            {/* 2. Tank Entries */}
            <ReportSection
              title="Tank Entries"
              count={report.tankEntries.length}
            >
              {report.tankEntries.length === 0 ? (
                <EmptyTableRow message="No tank entries for this shift." />
              ) : (
                <>
                  <thead>
                    <tr className="section-header">
                      <Th>Food Tank No</Th>
                      <Th>Date</Th>
                      <Th>Status</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.tankEntries.map((entry, i) => (
                      <tr
                        key={entry.foodTankNo || `tank-${i}`}
                        className="border-t border-border hover:bg-muted transition-smooth"
                        data-ocid={`shift-report.tank.item.${i + 1}`}
                      >
                        <Td mono>{entry.foodTankNo}</Td>
                        <Td>{entry.date}</Td>
                        <Td>
                          <span
                            className={`inline-flex px-2 py-0.5 font-display text-xs uppercase tracking-widest border ${
                              entry.tankStatus === "Food"
                                ? "border-green-300 bg-green-50 text-green-700"
                                : "border-red-300 bg-red-50 text-red-700"
                            }`}
                          >
                            {entry.tankStatus}
                          </span>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
            </ReportSection>

            {/* 3. Raw Materials */}
            <ReportSection
              title="Raw Materials"
              count={report.rawMaterialEntries.reduce(
                (acc, e) => acc + e.ingredients.length,
                0,
              )}
            >
              {report.rawMaterialEntries.length === 0 ? (
                <EmptyTableRow message="No raw material entries for this shift." />
              ) : (
                <>
                  <thead>
                    <tr className="section-header">
                      <Th>Product</Th>
                      <Th>Ingredient</Th>
                      <Th>Lot No</Th>
                      <Th>Date</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.rawMaterialEntries.flatMap((entry, ei) =>
                      entry.ingredients.map((ing, ii) => (
                        <tr
                          key={`${entry.date}-${ing.ingredientName}-${ing.lotNo}-${ei}-${ii}`}
                          className="border-t border-border hover:bg-muted transition-smooth"
                          data-ocid={`shift-report.materials.item.${ei + 1}`}
                        >
                          <Td>{entry.product}</Td>
                          <Td>{ing.ingredientName}</Td>
                          <Td mono>{ing.lotNo}</Td>
                          <Td>{entry.date}</Td>
                        </tr>
                      )),
                    )}
                  </tbody>
                </>
              )}
            </ReportSection>
          </div>
        )}

        {!query && (
          <div
            className="flex flex-col items-center justify-center py-20 gap-3 border-2 border-dashed border-border"
            data-ocid="shift-report.empty_state"
          >
            <FileText size={40} className="text-muted-foreground/40" />
            <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">
              Select a date and shift, then generate a report.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

function ReportMeta({ date, shift }: { date: string; shift: string }) {
  return (
    <div className="flex flex-wrap gap-4 border-2 border-border bg-muted/30 px-5 py-3">
      <div>
        <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">
          Date:{" "}
        </span>
        <span className="font-mono text-sm text-foreground">{date}</span>
      </div>
      <div>
        <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">
          Shift:{" "}
        </span>
        <span className="font-mono text-sm text-foreground">{shift}</span>
      </div>
    </div>
  );
}

function ReportSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="border-2 border-border">
      <div className="section-header flex items-center justify-between">
        <h2 className="font-display font-semibold text-xs uppercase tracking-widest">
          {title}
        </h2>
        <span className="font-mono text-xs text-muted-foreground">
          {count} record{count !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">{children}</table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 font-display text-xs uppercase tracking-widest text-muted-foreground whitespace-nowrap">
      {children}
    </th>
  );
}

function Td({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <td
      className={`px-4 py-3 text-sm text-foreground whitespace-nowrap ${mono ? "font-mono" : "font-body"}`}
    >
      {children}
    </td>
  );
}

function EmptyTableRow({ message }: { message: string }) {
  return (
    <tbody>
      <tr>
        <td
          colSpan={5}
          className="px-4 py-8 text-center font-body text-xs text-muted-foreground"
        >
          {message}
        </td>
      </tr>
    </tbody>
  );
}
