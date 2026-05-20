import { Layout } from "@/components/Layout";
import {
  useDashboardStats,
  useMuesliProcessLogs,
  usePackingLogs,
  useTankRoomLogs,
} from "@/lib/backend-client";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  FlaskConical,
  Package,
} from "lucide-react";
import { Fragment } from "react";

export default function DashboardPage() {
  const { data: packingLogs = [], isLoading: plLoading } = usePackingLogs();
  const { data: tankLogs = [], isLoading: tlLoading } = useTankRoomLogs();
  const { data: muesliLogs = [], isLoading: mlLoading } =
    useMuesliProcessLogs();
  const { data: dashStats, isLoading: statsLoading } = useDashboardStats();

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Layout>
      <div className="px-6 py-6" data-ocid="dashboard.page">
        {/* Page header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-3 border-b-2 border-border pb-5">
          <div>
            <h1 className="font-display font-bold text-2xl uppercase tracking-widest text-foreground">
              Dashboard
            </h1>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Production traceability overview &mdash; log books, tank tracking,
              and lot-to-batch linking.
            </p>
          </div>
          <div
            className="flex items-center gap-2 shrink-0"
            data-ocid="dashboard.date"
          >
            <CalendarDays size={14} className="text-accent" />
            <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">
              {today}
            </span>
          </div>
        </div>

        {/* Weekly Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div
            className="border-2 border-blue-200 bg-blue-50 p-4 flex flex-col gap-2"
            data-ocid="dashboard.stats.batches.card"
          >
            <div className="flex items-center gap-2">
              <Package size={16} className="text-blue-600 shrink-0" />
              <span className="font-display text-xs uppercase tracking-widest text-blue-700 leading-tight">
                Total Batches This Week
              </span>
            </div>
            {statsLoading ? (
              <div className="h-10 w-20 bg-blue-100 animate-pulse rounded" />
            ) : (
              <span className="font-mono font-bold text-4xl tabular-nums text-blue-800">
                {dashStats ? dashStats.totalBatchesThisWeek.toString() : "0"}
              </span>
            )}
          </div>
          <div
            className="border-2 border-orange-200 bg-orange-50 p-4 flex flex-col gap-2"
            data-ocid="dashboard.stats.holds.card"
          >
            <div className="flex items-center gap-2">
              <ClipboardList size={16} className="text-orange-600 shrink-0" />
              <span className="font-display text-xs uppercase tracking-widest text-orange-700 leading-tight">
                Tank Holds Active
              </span>
            </div>
            {statsLoading ? (
              <div className="h-10 w-20 bg-orange-100 animate-pulse rounded" />
            ) : (
              <span className="font-mono font-bold text-4xl tabular-nums text-orange-800">
                {dashStats ? dashStats.holdsCount.toString() : "0"}
              </span>
            )}
          </div>
          <div
            className="border-2 border-green-200 bg-green-50 p-4 flex flex-col gap-2"
            data-ocid="dashboard.stats.materials.card"
          >
            <div className="flex items-center gap-2">
              <FlaskConical size={16} className="text-green-600 shrink-0" />
              <span className="font-display text-xs uppercase tracking-widest text-green-700 leading-tight">
                Raw Materials Used This Week
              </span>
            </div>
            {statsLoading ? (
              <div className="h-10 w-20 bg-green-100 animate-pulse rounded" />
            ) : (
              <span className="font-mono font-bold text-4xl tabular-nums text-green-800">
                {dashStats
                  ? dashStats.rawMaterialsConsumedThisWeek.toString()
                  : "0"}
              </span>
            )}
          </div>
        </div>

        {/* Stat cards — live counts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            {
              label: "Total Packing Log Entries",
              icon: Package,
              count: packingLogs.length,
              loading: plLoading,
              to: "/packing-log",
              ocid: "dashboard.packing.card",
            },
            {
              label: "Total Tank Room Log Entries",
              icon: ClipboardList,
              count: tankLogs.length,
              loading: tlLoading,
              to: "/tank-room-log",
              ocid: "dashboard.tank.card",
            },
            {
              label: "Total Raw Materials Entries",
              icon: FlaskConical,
              count: muesliLogs.length,
              loading: mlLoading,
              to: "/muesli-process-log",
              ocid: "dashboard.muesli.card",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.to}
                to={stat.to}
                className="group border-2 border-border bg-card p-5 flex flex-col gap-4 hover:border-accent transition-smooth"
                data-ocid={stat.ocid}
              >
                <div className="flex items-center justify-between">
                  <Icon size={16} className="text-accent" />
                  <span className="text-[0.6rem] font-display uppercase tracking-widest text-muted-foreground group-hover:text-accent transition-smooth">
                    VIEW LOG
                  </span>
                </div>
                <div>
                  {stat.loading ? (
                    <div className="h-10 w-16 bg-muted animate-pulse" />
                  ) : (
                    <span
                      className="font-mono font-bold text-4xl tabular-nums text-foreground"
                      style={{ fontFamily: "var(--font-mono), monospace" }}
                    >
                      {stat.count.toString().padStart(3, "0")}
                    </span>
                  )}
                </div>
                <span className="font-display text-xs uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-smooth leading-snug">
                  {stat.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Traceability search shortcuts */}
        <div className="mb-10">
          <div className="border-2 border-border">
            <div className="section-header">
              <h2 className="font-display font-semibold text-xs uppercase tracking-widest">
                Traceability Search
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Backward traceability */}
              <Link
                to="/traceability/backward"
                className="group p-6 border-b-2 md:border-b-0 md:border-r-2 border-border hover:bg-muted transition-smooth"
                data-ocid="dashboard.backward.card"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="shrink-0 w-10 h-10 flex items-center justify-center border-2 transition-smooth"
                    style={{
                      borderColor: "oklch(var(--accent))",
                      background: "oklch(var(--accent) / 0.1)",
                    }}
                  >
                    <ArrowLeft size={18} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-bold text-sm uppercase tracking-widest text-foreground">
                        Backward Traceability
                      </h3>
                      <span className="badge-accent">Batch → Materials</span>
                    </div>
                    <p className="font-body text-xs text-muted-foreground mb-3">
                      Enter a batch code to trace all raw materials and lot
                      numbers used in that production batch.
                    </p>
                    <div className="flex flex-wrap gap-x-2 gap-y-1 items-center">
                      {[
                        "Batch Code",
                        "Food Tank Numbers",
                        "Fill Dates",
                        "Raw Materials + Lot Numbers",
                      ].map((step, i, arr) => (
                        <Fragment key={step}>
                          <span className="font-display text-[0.6rem] uppercase tracking-widest text-accent">
                            {step}
                          </span>
                          {i < arr.length - 1 && (
                            <ChevronRight
                              size={10}
                              className="text-muted-foreground"
                            />
                          )}
                        </Fragment>
                      ))}
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    className="shrink-0 text-muted-foreground group-hover:text-accent transition-smooth mt-1"
                  />
                </div>
              </Link>

              {/* Forward traceability */}
              <Link
                to="/traceability/forward"
                className="group p-6 hover:bg-muted transition-smooth"
                data-ocid="dashboard.forward.card"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="shrink-0 w-10 h-10 flex items-center justify-center border-2 transition-smooth"
                    style={{
                      borderColor: "oklch(var(--accent))",
                      background: "oklch(var(--accent) / 0.1)",
                    }}
                  >
                    <ArrowRight size={18} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-bold text-sm uppercase tracking-widest text-foreground">
                        Forward Traceability
                      </h3>
                      <span className="badge-accent">Lot → Batches</span>
                    </div>
                    <p className="font-body text-xs text-muted-foreground mb-3">
                      Enter a raw material lot number to see every batch code it
                      was used in.
                    </p>
                    <div className="flex flex-wrap gap-x-2 gap-y-1 items-center">
                      {["Lot Number", "Dates Used", "Tanks", "Batch Codes"].map(
                        (step, i, arr) => (
                          <Fragment key={step}>
                            <span className="font-display text-[0.6rem] uppercase tracking-widest text-accent">
                              {step}
                            </span>
                            {i < arr.length - 1 && (
                              <ChevronRight
                                size={10}
                                className="text-muted-foreground"
                              />
                            )}
                          </Fragment>
                        ),
                      )}
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    className="shrink-0 text-muted-foreground group-hover:text-accent transition-smooth mt-1"
                  />
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick log book links */}
        <div className="border-2 border-border">
          <div className="section-header">
            <h2 className="font-display font-semibold text-xs uppercase tracking-widest">
              Log Books
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {[
              {
                to: "/packing-log",
                label: "Packing Log",
                icon: Package,
                desc: "Batch codes, tank refs, bulk bag lot numbers per run",
                ocid: "dashboard.nav.packing",
              },
              {
                to: "/tank-room-log",
                label: "Tank Room Log",
                icon: ClipboardList,
                desc: "Food tank fill dates, shifts, and batch code per tank",
                ocid: "dashboard.nav.tank",
              },
              {
                to: "/muesli-process-log",
                label: "Raw Materials",
                icon: FlaskConical,
                desc: "Ingredient lot numbers, quantities, and processing dates",
                ocid: "dashboard.nav.muesli",
              },
            ].map((item, i, arr) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`group px-5 py-4 flex items-center gap-3 hover:bg-muted transition-smooth ${
                    i < arr.length - 1
                      ? "border-b-2 md:border-b-0 md:border-r-2 border-border"
                      : ""
                  }`}
                  data-ocid={item.ocid}
                >
                  <Icon
                    size={16}
                    className="shrink-0 text-muted-foreground group-hover:text-accent transition-smooth"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-display font-semibold text-xs uppercase tracking-wide text-foreground block">
                      {item.label}
                    </span>
                    <span className="font-body text-xs text-muted-foreground">
                      {item.desc}
                    </span>
                  </div>
                  <ArrowRight
                    size={14}
                    className="shrink-0 text-muted-foreground group-hover:text-accent transition-smooth"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
