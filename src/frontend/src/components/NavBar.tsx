import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, FlaskConical, LogIn, LogOut } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { to: "/", label: "Dashboard", exact: true },
  { to: "/packing-log", label: "Packing Log", exact: false },
  { to: "/tank-room-log", label: "Tank Room Log", exact: false },
  { to: "/muesli-process-log", label: "Raw Materials", exact: false },
  { to: "/summary", label: "Summary", exact: false },
  { to: "/flagged-records", label: "Flagged Records", exact: false },
  { to: "/shift-report", label: "Shift Report", exact: false },
];

export function NavBar() {
  const [traceOpen, setTraceOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { location } = useRouterState();
  const path = location.pathname;
  const { identity, loginStatus, login, clear } = useInternetIdentity();
  const isAuthenticated = loginStatus === "success";
  const principal = isAuthenticated
    ? (identity?.getPrincipal()?.toText() ?? null)
    : null;

  const isTrace = path.startsWith("/traceability");

  return (
    <header className="bg-primary border-b-2 border-border" data-ocid="navbar">
      <div className="flex items-center justify-between h-14 px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <FlaskConical size={20} className="text-accent" />
          <span className="font-display font-bold text-lg tracking-widest uppercase text-primary-foreground">
            Tracify
          </span>
        </div>

        {/* Desktop Nav links */}
        <nav className="hidden md:flex items-center gap-1 no-print">
          {NAV_LINKS.map(({ to, label, exact }) => {
            const active = exact ? path === to : path.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={[
                  "px-3 py-1.5 font-display text-xs uppercase tracking-widest border transition-smooth",
                  active
                    ? "border-accent text-accent bg-accent/10"
                    : "border-transparent text-primary-foreground/70 hover:text-primary-foreground hover:border-primary-foreground/30",
                ].join(" ")}
                data-ocid={`nav.${label.toLowerCase().replace(/\s+/g, "-")}.link`}
              >
                {label}
              </Link>
            );
          })}

          {/* Traceability dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setTraceOpen((v) => !v)}
              className={[
                "flex items-center gap-1 px-3 py-1.5 font-display text-xs uppercase tracking-widest border transition-smooth",
                isTrace
                  ? "border-accent text-accent bg-accent/10"
                  : "border-transparent text-primary-foreground/70 hover:text-primary-foreground hover:border-primary-foreground/30",
              ].join(" ")}
              data-ocid="nav.traceability.toggle"
            >
              Traceability
              <ChevronDown
                size={12}
                className={`transition-smooth ${traceOpen ? "rotate-180" : ""}`}
              />
            </button>

            {traceOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-52 bg-card border-2 border-border z-50"
                onBlur={() => setTraceOpen(false)}
              >
                <Link
                  to="/traceability/backward"
                  onClick={() => setTraceOpen(false)}
                  className={[
                    "block px-4 py-2.5 font-display text-xs uppercase tracking-widest transition-smooth",
                    path === "/traceability/backward"
                      ? "text-accent bg-accent/10"
                      : "text-foreground hover:bg-muted hover:text-accent",
                  ].join(" ")}
                  data-ocid="nav.backward-trace.link"
                >
                  ← Backward Trace
                </Link>
                <Link
                  to="/traceability/forward"
                  onClick={() => setTraceOpen(false)}
                  className={[
                    "block px-4 py-2.5 font-display text-xs uppercase tracking-widest transition-smooth border-t border-border",
                    path === "/traceability/forward"
                      ? "text-accent bg-accent/10"
                      : "text-foreground hover:bg-muted hover:text-accent",
                  ].join(" ")}
                  data-ocid="nav.forward-trace.link"
                >
                  → Forward Trace
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Right side: auth + hamburger */}
        <div className="flex items-center gap-2 no-print">
          {/* Auth controls — desktop */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <span
                  className="font-mono text-xs text-primary-foreground/60 truncate max-w-[120px]"
                  title={principal ?? ""}
                >
                  {principal ? `${principal.slice(0, 8)}…` : ""}
                </span>
                <button
                  type="button"
                  onClick={() => clear()}
                  className="flex items-center gap-1.5 px-3 py-1.5 font-display text-xs uppercase tracking-widest border transition-smooth border-transparent text-primary-foreground/70 hover:text-primary-foreground hover:border-primary-foreground/30"
                  data-ocid="navbar.logout.button"
                >
                  <LogOut size={12} />
                  Logout
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => login()}
                className="flex items-center gap-1.5 px-3 py-1.5 font-display text-xs uppercase tracking-widest border transition-smooth border-accent text-accent bg-accent/10 hover:bg-accent/20"
                data-ocid="navbar.login.button"
              >
                <LogIn size={12} />
                Login
              </button>
            )}
          </div>

          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 border border-primary-foreground/30 hover:border-accent transition-smooth"
            aria-label="Toggle mobile menu"
            data-ocid="navbar.mobile_menu.toggle"
          >
            <span
              className={`block w-5 h-0.5 bg-primary-foreground transition-smooth ${mobileOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`block w-5 h-0.5 bg-primary-foreground transition-smooth ${mobileOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block w-5 h-0.5 bg-primary-foreground transition-smooth ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <nav
          className="md:hidden bg-card border-t-2 border-border flex flex-col no-print"
          data-ocid="navbar.mobile_menu"
        >
          {NAV_LINKS.map(({ to, label, exact }) => {
            const active = exact ? path === to : path.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={[
                  "w-full px-6 py-3 font-display text-xs uppercase tracking-widest border-b border-border transition-smooth text-left",
                  active
                    ? "text-accent bg-accent/10"
                    : "text-foreground hover:bg-muted hover:text-accent",
                ].join(" ")}
                data-ocid={`nav.mobile.${label.toLowerCase().replace(/\s+/g, "-")}.link`}
              >
                {label}
              </Link>
            );
          })}
          <Link
            to="/traceability/backward"
            onClick={() => setMobileOpen(false)}
            className={[
              "w-full px-6 py-3 font-display text-xs uppercase tracking-widest border-b border-border transition-smooth text-left",
              path === "/traceability/backward"
                ? "text-accent bg-accent/10"
                : "text-foreground hover:bg-muted hover:text-accent",
            ].join(" ")}
            data-ocid="nav.mobile.backward-trace.link"
          >
            ← Backward Trace
          </Link>
          <Link
            to="/traceability/forward"
            onClick={() => setMobileOpen(false)}
            className={[
              "w-full px-6 py-3 font-display text-xs uppercase tracking-widest border-b border-border transition-smooth text-left",
              path === "/traceability/forward"
                ? "text-accent bg-accent/10"
                : "text-foreground hover:bg-muted hover:text-accent",
            ].join(" ")}
            data-ocid="nav.mobile.forward-trace.link"
          >
            → Forward Trace
          </Link>
          {/* Auth — mobile */}
          <div className="px-6 py-3 border-t-2 border-border">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  clear();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-1.5 font-display text-xs uppercase tracking-widest text-primary-foreground/70 hover:text-primary-foreground transition-smooth"
                data-ocid="navbar.mobile.logout.button"
              >
                <LogOut size={12} /> Logout
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  login();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-1.5 font-display text-xs uppercase tracking-widest text-accent hover:text-accent/80 transition-smooth"
                data-ocid="navbar.mobile.login.button"
              >
                <LogIn size={12} /> Login
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
