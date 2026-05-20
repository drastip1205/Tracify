import { Layout } from "@/components/Layout";
import { useFlaggedRecords } from "@/lib/backend-client";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, CheckCircle, Printer } from "lucide-react";

export default function FlaggedRecordsPage() {
  const { data: flagged = [], isLoading } = useFlaggedRecords();

  return (
    <Layout>
      <div className="px-4 sm:px-6 py-6" data-ocid="flagged-records.page">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-border pb-5">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center justify-center w-8 h-8 border-2 border-border hover:border-accent text-muted-foreground hover:text-accent transition-smooth"
              aria-label="Back to dashboard"
              data-ocid="flagged-records.back.link"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="font-display font-bold text-2xl uppercase tracking-widest text-foreground">
                Flagged Records
              </h1>
              <p className="font-body text-xs text-muted-foreground mt-0.5">
                Tank entries with HOLD or FEED status and their linked batch
                codes and lot numbers.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="no-print flex items-center gap-2 px-4 py-2 border-2 border-border font-display text-xs uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent transition-smooth"
            data-ocid="flagged-records.print.button"
          >
            <Printer size={14} />
            Print
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div
            className="flex items-center justify-center py-20"
            data-ocid="flagged-records.loading_state"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">
                Loading flagged records…
              </span>
            </div>
          </div>
        ) : flagged.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 gap-4"
            data-ocid="flagged-records.empty_state"
          >
            <CheckCircle size={48} className="text-green-500" />
            <div className="text-center">
              <p className="font-display font-semibold text-sm uppercase tracking-widest text-foreground">
                No flagged records found
              </p>
              <p className="font-body text-xs text-muted-foreground mt-1">
                All batches are clear — no HOLD or FEED statuses detected.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto border-2 border-border">
            <table
              className="w-full text-left"
              data-ocid="flagged-records.table"
            >
              <thead>
                <tr className="section-header">
                  <th className="px-4 py-3 font-display text-xs uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                    Food Tank No
                  </th>
                  <th className="px-4 py-3 font-display text-xs uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                    Date
                  </th>
                  <th className="px-4 py-3 font-display text-xs uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-4 py-3 font-display text-xs uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                    Linked Batch Codes
                  </th>
                  <th className="px-4 py-3 font-display text-xs uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                    Linked Lot Numbers
                  </th>
                </tr>
              </thead>
              <tbody>
                {flagged.map((record, i) => (
                  <tr
                    key={record.tankEntry.id?.toString() || `flagged-${i}`}
                    className="border-t border-border hover:bg-muted transition-smooth"
                    data-ocid={`flagged-records.item.${i + 1}`}
                  >
                    <td className="px-4 py-3 font-mono text-sm text-foreground whitespace-nowrap">
                      {record.tankEntry.foodTankNo}
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-muted-foreground whitespace-nowrap">
                      {record.tankEntry.date}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 border font-display text-xs uppercase tracking-widest border-red-300 bg-red-50 text-red-700"
                        data-ocid={`flagged-records.status.${i + 1}`}
                      >
                        <AlertTriangle size={10} />
                        {record.tankEntry.tankStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-muted-foreground max-w-xs">
                      {record.linkedBatchCodes.length > 0 ? (
                        record.linkedBatchCodes.join(", ")
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-muted-foreground max-w-xs">
                      {record.linkedLotNumbers.length > 0 ? (
                        record.linkedLotNumbers.join(", ")
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
