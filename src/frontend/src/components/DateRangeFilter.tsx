import { useState } from "react";

interface DateRangeFilterProps {
  onApply: (from: string, to: string) => void;
  onClear: () => void;
}

export function DateRangeFilter({ onApply, onClear }: DateRangeFilterProps) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function handleApply() {
    if (from || to) {
      onApply(from, to);
    }
  }

  function handleClear() {
    setFrom("");
    setTo("");
    onClear();
  }

  return (
    <div
      className="flex flex-wrap items-end gap-3 px-4 py-3 bg-card border-b-2 border-border no-print"
      data-ocid="date-range-filter"
    >
      <div className="flex flex-col gap-1">
        <label
          htmlFor="date-from"
          className="font-display text-xs uppercase tracking-widest text-muted-foreground"
        >
          From
        </label>
        <input
          id="date-from"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="input-industrial text-sm w-38"
          data-ocid="date-range-filter.from_input"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="date-to"
          className="font-display text-xs uppercase tracking-widest text-muted-foreground"
        >
          To
        </label>
        <input
          id="date-to"
          type="date"
          value={to}
          min={from || undefined}
          onChange={(e) => setTo(e.target.value)}
          className="input-industrial text-sm w-38"
          data-ocid="date-range-filter.to_input"
        />
      </div>

      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={handleApply}
          disabled={!from && !to}
          className="btn-primary text-xs py-1.5 px-3 disabled:opacity-40 disabled:cursor-not-allowed"
          data-ocid="date-range-filter.apply_button"
        >
          Apply
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="btn-ghost text-xs py-1.5 px-3"
          data-ocid="date-range-filter.clear_button"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
