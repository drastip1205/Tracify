import { Layout } from "@/components/Layout";
import { QrScannerModal } from "@/components/QrScannerModal";
import { useForwardTrace } from "@/lib/backend-client";
import { ChevronRight, PackageSearch, QrCode, Search } from "lucide-react";
import { useState } from "react";

function LoadingSkeleton() {
  return (
    <div
      className="space-y-6 animate-pulse"
      data-ocid="forward-trace.loading_state"
    >
      <div className="border-2 border-border">
        <div className="section-header">
          <div className="h-4 bg-primary-foreground/20 rounded w-48" />
          <div className="h-3 bg-primary-foreground/10 rounded w-12" />
        </div>
        <div className="p-4 flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-7 bg-muted rounded w-28" />
          ))}
        </div>
      </div>
      <div className="border-2 border-border">
        <div className="section-header">
          <div className="h-4 bg-primary-foreground/20 rounded w-56" />
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="border-t border-border p-4 space-y-3">
            <div className="h-4 bg-muted rounded w-32" />
            <div className="flex gap-3">
              <div className="h-6 bg-muted rounded w-24" />
              <div className="h-6 bg-muted rounded w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Group packing entries by date for cleaner audit display */
function groupByDate(
  entries: Array<{
    batchCode: string;
    date: string;
    productName: string;
    foodTankNos: string[];
  }>,
) {
  const map = new Map<
    string,
    Array<{ batchCode: string; productName: string; foodTankNos: string[] }>
  >();
  for (const entry of entries) {
    const existing = map.get(entry.date) ?? [];
    map.set(entry.date, [
      ...existing,
      {
        batchCode: entry.batchCode,
        productName: entry.productName,
        foodTankNos: entry.foodTankNos,
      },
    ]);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export default function ForwardTracePage() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [showQr, setShowQr] = useState(false);

  const { data, isLoading, isFetching } = useForwardTrace(query);

  const handleSearch = () => {
    setQuery(input.trim());
  };

  const loading = isLoading || isFetching;
  const groupedEntries = data ? groupByDate(data.packingEntries) : [];

  return (
    <Layout>
      <div className="px-6 py-6" data-ocid="forward-trace.page">
        {/* Page header */}
        <div className="mb-6 border-b-2 border-border pb-4">
          <h1 className="font-display font-bold text-xl uppercase tracking-widest text-foreground">
            → Forward Traceability
          </h1>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Enter a <strong>raw material lot number</strong> to find all batch
            codes where it was used.
          </p>
        </div>

        {/* Search bar */}
        <div className="flex gap-0 mb-8 max-w-xl border-2 border-border focus-within:border-accent transition-smooth no-print">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter Raw Material Lot Number — e.g. LOT-OAT-2024-12"
            className="flex-1 px-4 py-3 font-display text-sm bg-background text-foreground outline-none border-0"
            data-ocid="forward-trace.search_input"
          />
          <button
            type="button"
            onClick={() => setShowQr(true)}
            className="btn-ghost px-3 border-0 border-l-2 border-border"
            aria-label="Scan QR code"
            data-ocid="forward-trace.qr_scan_button"
          >
            <QrCode size={16} />
          </button>
          <button
            type="button"
            onClick={handleSearch}
            className="btn-accent px-5 border-0"
            data-ocid="forward-trace.search_button"
          >
            <Search size={16} />
            Search
          </button>
        </div>
        {showQr && (
          <QrScannerModal
            onScan={(text) => {
              setInput(text);
              setShowQr(false);
            }}
            onClose={() => setShowQr(false)}
          />
        )}

        {/* Loading */}
        {loading && <LoadingSkeleton />}

        {/* No results */}
        {!loading &&
          query &&
          data &&
          data.muesliDates.length === 0 &&
          data.packingEntries.length === 0 && (
            <div
              className="border-2 border-border p-12 text-center"
              data-ocid="forward-trace.error_state"
            >
              <PackageSearch
                size={32}
                className="mx-auto mb-3 opacity-30"
                style={{ color: "oklch(var(--muted-foreground))" }}
              />
              <p className="font-display text-sm uppercase tracking-widest text-muted-foreground">
                No traceability records found for this lot number
              </p>
              <p className="font-body text-sm text-muted-foreground mt-2">
                Lot number{" "}
                <span
                  className="font-display"
                  style={{ color: "oklch(var(--accent))" }}
                >
                  {query}
                </span>{" "}
                was not found in any muesli processing log. Please verify the
                lot number and try again.
              </p>
            </div>
          )}

        {/* Results */}
        {!loading && data && (
          <div className="space-y-0 border-2 border-border">
            {/* Print button */}
            <div className="no-print px-6 pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
              >
                Print Report
              </button>
            </div>
            {/* Lot number result header */}
            <div className="px-6 py-4 border-b-2 border-border bg-card flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">
                  Forward Traceability Report
                </span>
                <ChevronRight size={12} className="text-muted-foreground" />
                <span
                  className="font-display font-bold text-lg"
                  style={{ color: "oklch(var(--accent))" }}
                >
                  {data.lotNo}
                </span>
              </div>
              <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">
                {data.muesliDates.length} processing date
                {data.muesliDates.length !== 1 ? "s" : ""} •{" "}
                {data.packingEntries.length} batch code
                {data.packingEntries.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Step 1: Muesli processing dates */}
            <div className="border-b-2 border-border">
              <div className="section-header">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-xs uppercase tracking-widest">
                    Step 1
                  </span>
                  <ChevronRight size={12} />
                  <span className="font-display text-xs uppercase tracking-widest">
                    Muesli Processing Dates
                  </span>
                </div>
                <span
                  className="font-display text-xs"
                  style={{ color: "oklch(var(--primary-foreground) / 0.6)" }}
                >
                  {data.muesliDates.length} date
                  {data.muesliDates.length !== 1 ? "s" : ""}
                </span>
              </div>
              {data.muesliDates.length === 0 ? (
                <p className="p-4 font-body text-sm text-muted-foreground">
                  Lot number not found in any muesli processing log.
                </p>
              ) : (
                <div className="p-4 flex flex-wrap gap-2">
                  {data.muesliDates.map((d, i) => (
                    <span
                      key={`date-${d}`}
                      className="badge-accent px-3 py-1 font-display text-sm"
                      data-ocid={`forward-trace.date.${i + 1}`}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Affected batch codes grouped by date */}
            <div>
              <div className="section-header">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-xs uppercase tracking-widest">
                    Step 2
                  </span>
                  <ChevronRight size={12} />
                  <span className="font-display text-xs uppercase tracking-widest">
                    Affected Batch Codes
                  </span>
                </div>
                <span
                  className="font-display text-xs"
                  style={{ color: "oklch(var(--primary-foreground) / 0.6)" }}
                >
                  {data.packingEntries.length} batch code
                  {data.packingEntries.length !== 1 ? "s" : ""}
                </span>
              </div>
              {data.packingEntries.length === 0 ? (
                <p className="p-4 font-body text-sm text-muted-foreground">
                  No packing entries found for this lot number.
                </p>
              ) : (
                groupedEntries.map(([date, entries], di) => (
                  <div
                    key={date}
                    className="border-t border-border last:border-b-0"
                    data-ocid={`forward-trace.date-group.${di + 1}`}
                  >
                    {/* Date sub-header */}
                    <div
                      className="px-4 py-2 flex items-center gap-3"
                      style={{ background: "oklch(var(--muted))" }}
                    >
                      <span className="font-display font-bold text-sm text-foreground">
                        {date}
                      </span>
                      <span className="font-body text-xs text-muted-foreground">
                        {entries.length} batch code
                        {entries.length !== 1 ? "s" : ""} on this date
                      </span>
                    </div>
                    <table className="table-industrial">
                      <thead>
                        <tr>
                          <th>Batch Code</th>
                          <th>Product Name</th>
                          <th>Food Tanks Used</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entries.map((entry, ei) => (
                          <tr
                            key={`${entry.batchCode}-${ei}`}
                            data-ocid={`forward-trace.item.${di + 1}.${ei + 1}`}
                          >
                            <td>
                              <span className="badge-accent">
                                {entry.batchCode}
                              </span>
                            </td>
                            <td className="font-body text-sm">
                              {entry.productName}
                            </td>
                            <td>
                              <div className="flex flex-wrap gap-1">
                                {entry.foodTankNos.map((t, ti) => (
                                  <span
                                    key={`${t}-${entry.batchCode}-${ti}`}
                                    className="badge-accent text-xs"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Initial empty state */}
        {!query && !loading && (
          <div
            className="border-2 border-dashed border-border p-16 text-center"
            data-ocid="forward-trace.empty_state"
          >
            <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">
              Enter a raw material lot number above to start forward
              traceability
            </p>
            <p className="font-body text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              The system will find all muesli processing dates where the lot was
              used, then match the food tanks to all affected batch codes in the
              packing log.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
