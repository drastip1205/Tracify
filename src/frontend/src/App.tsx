import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import BackwardTracePage from "./pages/BackwardTracePage";
import DashboardPage from "./pages/DashboardPage";
import FlaggedRecordsPage from "./pages/FlaggedRecordsPage";
import ForwardTracePage from "./pages/ForwardTracePage";
import MuesliProcessLogPage from "./pages/MuesliProcessLogPage";
import PackingLogPage from "./pages/PackingLogPage";
import ShiftReportPage from "./pages/ShiftReportPage";
import SummaryPage from "./pages/SummaryPage";
import TankRoomLogPage from "./pages/TankRoomLogPage";

const rootRoute = createRootRoute({ component: Outlet });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

const packingLogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/packing-log",
  component: PackingLogPage,
});

const tankRoomLogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tank-room-log",
  component: TankRoomLogPage,
});

const muesliProcessLogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/muesli-process-log",
  component: MuesliProcessLogPage,
});

const backwardTraceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/traceability/backward",
  component: BackwardTracePage,
});

const forwardTraceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/traceability/forward",
  component: ForwardTracePage,
});

const summaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/summary",
  component: SummaryPage,
});

const flaggedRecordsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/flagged-records",
  component: FlaggedRecordsPage,
});

const shiftReportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shift-report",
  component: ShiftReportPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  packingLogRoute,
  tankRoomLogRoute,
  muesliProcessLogRoute,
  backwardTraceRoute,
  forwardTraceRoute,
  summaryRoute,
  flaggedRecordsRoute,
  shiftReportRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
