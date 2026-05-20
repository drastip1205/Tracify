import type { ReactNode } from "react";
import { NavBar } from "./NavBar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      <main className="flex-1 overflow-auto" data-ocid="main.content">
        {children}
      </main>
      <footer className="border-t-2 border-border bg-card px-6 py-3 flex items-center justify-between">
        <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">
          Tracify &mdash; Production Traceability System
        </span>
        <span className="font-body text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-smooth"
          >
            Built with caffeine.ai
          </a>
        </span>
      </footer>
    </div>
  );
}
