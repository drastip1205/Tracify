import { Layout } from "@/components/Layout";
import { QrScannerModal } from "@/components/QrScannerModal";
import { useBackwardTrace } from "@/lib/backend-client";
import { ChevronRight, FlaskConical, QrCode, Search } from "lucide-react";
import { useState } from "react";

function LoadingSkeleton() {
  return (
    <div
      className="space-y-6 animate-pulse"
      data-ocid="backward-trace.loading_state"
    >
      <div className="border-2 border-border">
        <div className="section-header">
          <div className="h-4 bg-primary-foreground/20 rounded w-48" />
          <div className="h-3 bg-primary-foreground/10 rounded w-16" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 bg-muted rounded w-24" />
              <div className="h-4 bg-muted rounded w-32" />
              <div className="h-4 bg-muted rounded w-20" />
            </div>
          ))}
        </div>
      </div>
      <div className="border-2 border-border">
        <div className="section-header">
          <div className="h-4 bg-primary-foreground/20 rounded w-56" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 bg-muted rounded w-40" />
              <div className="h-4 bg-muted rounded w-28" />
              <div className="h-4 bg-muted rounded w-16" />
              <div className="h-4 bg-muted rounded w-24" />
              <div className="h-4 bg-muted rounded w-20" />
              <div className="h-4 bg-muted rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BackwardTracePage() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [showQr, setShowQr] = useState(false);

  const { data, isLoading, isFetching } = useBackwardTrace(query);

  const handleSearch = () => {
    setQuery(input.trim());
  };

  const loading = isLoading || isFetching;

  return (
    <Layout>
      <div className="px-6 py-6" data-ocid="backward-trace.page">
        {/* Page header */}
        <div className="mb-6 border-b-2 border-border pb-4">
          <h1 className="font-display font-bold text-xl uppercase tracking-widest text-foreground">
            ← Backward Traceability
          </h1>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Enter a <strong>batch code</strong> from the packing log to trace
            backward to raw material lot numbers.
          </p>
        </div>

        {/* Search bar */}
        <div className="flex gap-0 mb-8 max-w-xl border-2 border-border focus-within:border-accent transition-smooth no-print">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter Batch Code — e.g. BC-2024-001"
            className="flex-1 px-4 py-3 font-display text-sm bg-background text-foreground outline-none border-0"
            data-ocid="backward-trace.search_input"
          />
          <button
            type="button"
            onClick={() => setShowQr(true)}
            className="btn-ghost px-3 border-0 border-l-2 border-border"
            aria-label="Scan QR code"
            data-ocid="backward-trace.qr_scan_button"
          >
            <QrCode size={16} />
          </button>
          <button
            type="button"
            onClick={handleSearch}
            className="btn-accent px-5 border-0"
            data-ocid="backward-trace.search_button"
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
          data.tanks.length === 0 &&
          data.muesliLogs.length === 0 && (
            <div
              className="border-2 border-border p-12 text-center"
              data-ocid="backward-trace.error_state"
            >
              <FlaskConical
                size={32}
                className="mx-auto mb-3 opacity-30"
                style={{ color: "oklch(var(--muted-foreground))" }}
              />
              <p className="font-display text-sm uppercase tracking-widest text-muted-foreground">
                No traceability records found for this batch code
              </p>
              <p className="font-body text-sm text-muted-foreground mt-2">
                Batch code{" "}
                <span
                  className="font-display"
                  style={{ color: "oklch(var(--accent))" }}
                >
                  {query}
                </span>{" "}
                was not found in the packing log. Please verify the batch code
                and try again.
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
            {/* Batch code result header */}
            <div className="px-6 py-4 border-b-2 border-border bg-card flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">
                  Traceability Report
                </span>
                <ChevronRight size={12} className="text-muted-foreground" />
                <span
                  className="font-display font-bold text-lg"
                  style={{ color: "oklch(var(--accent))" }}
                >
                  {data.batchCode}
                </span>
              </div>
              <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">
                {data.tanks.length} tank{data.tanks.length !== 1 ? "s" : ""} •{" "}
                {data.muesliLogs.reduce(
                  (acc, l) => acc + l.ingredients.length,
                  0,
                )}{" "}
                ingredients
              </span>
            </div>

            {/* Step 1: Tanks */}
            <div className="border-b-2 border-border">
              <div className="section-header">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-xs uppercase tracking-widest">
                    Step 1
                  </span>
                  <ChevronRight size={12} />
                  <span className="font-display text-xs uppercase tracking-widest">
                    Food Tanks Used
                  </span>
                </div>
                <span
                  className="font-display text-xs"
                  style={{ color: "oklch(var(--primary-foreground) / 0.6)" }}
                >
                  {data.tanks.length} tank{data.tanks.length !== 1 ? "s" : ""}
                </span>
              </div>
              {data.tanks.length === 0 ? (
                <p
                  className="p-4 font-body text-sm text-muted-foreground"
                  data-ocid="backward-trace.tanks.empty_state"
                >
                  No tanks found for this batch code.
                </p>
              ) : (
                <table className="table-industrial">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Food Tank No.</th>
                      <th>Date Filled</th>
                      <th>Shift</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.tanks.map((tank, i) => (
                      <tr
                        key={`${tank.foodTankNo}-${i}`}
                        data-ocid={`backward-trace.tank.item.${i + 1}`}
                      >
                        <td className="font-display text-xs text-muted-foreground w-10">
                          {i + 1}
                        </td>
                        <td
                          className="font-display font-bold text-sm"
                          style={{ color: "oklch(var(--accent))" }}
                        >
                          {tank.foodTankNo}
                        </td>
                        <td className="font-display text-sm">{tank.date}</td>
                        <td className="font-body text-sm">{tank.shift}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Step 2: Muesli process log ingredients */}
            <div>
              <div className="section-header">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-xs uppercase tracking-widest">
                    Step 2
                  </span>
                  <ChevronRight size={12} />
                  <span className="font-display text-xs uppercase tracking-widest">
                    Raw Materials &amp; Lot Numbers
                  </span>
                </div>
                <span
                  className="font-display text-xs"
                  style={{ color: "oklch(var(--primary-foreground) / 0.6)" }}
                >
                  {data.muesliLogs.length} processing log
                  {data.muesliLogs.length !== 1 ? "s" : ""}
                </span>
              </div>
              {data.muesliLogs.length === 0 ? (
                <p
                  className="p-4 font-body text-sm text-muted-foreground"
                  data-ocid="backward-trace.muesli.empty_state"
                >
                  No muesli process logs matched for these tanks.
                </p>
              ) : (
                data.muesliLogs.map((log, li) => (
                  <div
                    key={`${log.date}-${li}`}
                    className="border-t border-border last:border-b-0"
                  >
                    {/* Sub-header: date + shift + product + run */}
                    <div
                      className="px-4 py-2 flex items-center gap-4 flex-wrap"
                      style={{ background: "oklch(var(--muted))" }}
                    >
                      <span
                        className="font-display font-bold text-sm"
                        style={{ color: "oklch(var(--foreground))" }}
                      >
                        {log.date}
                      </span>
                      <span className="font-body text-xs text-muted-foreground">
                        Shift:{" "}
                        <span className="font-display text-foreground">
                          {log.shift}
                        </span>
                      </span>
                      <span className="font-body text-xs text-muted-foreground">
                        Product:{" "}
                        <span className="font-display text-foreground">
                          {log.product}
                        </span>
                      </span>
                      <span className="font-body text-xs text-muted-foreground">
                        Run:{" "}
                        <span className="font-display text-foreground">
                          {log.run}
                        </span>
                      </span>
                    </div>
                    <table className="table-industrial">
                      <thead>
                        <tr>
                          <th>Ingredient</th>
                          <th>Lot No.</th>
                          <th>Qty</th>
                          <th>Opening Stock</th>
                          <th>Issue from Stores</th>
                          <th>Closing Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {log.ingredients.map((ing, ii) => (
                          <tr
                            key={`${ing.ingredientName}-${ii}`}
                            data-ocid={`backward-trace.ingredient.${li + 1}.${ii + 1}`}
                          >
                            <td className="font-body font-semibold text-sm">
                              {ing.ingredientName}
                            </td>
                            <td>
                              <span className="badge-accent">{ing.lotNo}</span>
                            </td>
                            <td className="font-display text-sm text-right">
                              {ing.qty}
                            </td>
                            <td className="font-display text-sm text-right">
                              {ing.openingStock}
                            </td>
                            <td className="font-display text-sm text-right">
                              {ing.issueFromStores}
                            </td>
                            <td className="font-display text-sm text-right">
                              {ing.closingStock}
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
            data-ocid="backward-trace.empty_state"
          >
            <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">
              Enter a batch code above to start backward traceability
            </p>
            <p className="font-body text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              The system will find all food tanks used for that batch, match the
              fill dates to the muesli processing log, and return every raw
              material and lot number used.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
