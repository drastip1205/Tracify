import { TankStatus } from "@/backend";
import type { TankRoomLogEntry, TankRoomLogInput } from "@/types";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

const EMPTY_FORM: TankRoomLogInput = {
  date: "",
  shift: "",
  productRun: "",
  batchCode: "",
  foodTankNo: "",
  cleaned: false,
  fillingTimeIn: "",
  fillingTimeOut: "",
  tankStatus: TankStatus.Food,
  permanentTankNumber: "",
  reasonForHold: "",
  correctiveAction: "",
  remark: "",
  createdAt: BigInt(0),
  createdBy: "",
};

type TankStatusKey = TankStatus;

function statusToKey(s: TankRoomLogEntry["tankStatus"]): TankStatusKey {
  return s as TankStatusKey;
}

function keyToStatus(k: TankStatusKey): TankRoomLogEntry["tankStatus"] {
  return k;
}

interface Props {
  initial?: TankRoomLogEntry | null;
  onSubmit: (data: TankRoomLogInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function TankRoomLogForm({
  initial,
  onSubmit,
  onCancel,
  isSubmitting,
}: Props) {
  const [form, setForm] = useState<TankRoomLogInput>(EMPTY_FORM);
  const [statusKey, setStatusKey] = useState<TankStatusKey>(TankStatus.Food);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof TankRoomLogInput, string>>
  >({});

  useEffect(() => {
    if (initial) {
      const {
        id: _id,
        createdAt,
        createdBy,
        updatedAt: _updatedAt,
        updatedBy: _updatedBy,
        ...rest
      } = initial;
      setForm({ ...rest, createdAt, createdBy });
      setStatusKey(statusToKey(initial.tankStatus));
    } else {
      setForm(EMPTY_FORM);
      setStatusKey(TankStatus.Food);
    }
    setFormErrors({});
  }, [initial]);

  const set = (
    field: keyof TankRoomLogInput,
    value: TankRoomLogInput[keyof TankRoomLogInput],
  ) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((e) => {
        const next = { ...e };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Partial<Record<keyof TankRoomLogInput, string>> = {};
    if (!form.date) errors.date = "Date is required";
    if (!form.shift) errors.shift = "Shift is required";
    if (!form.productRun) errors.productRun = "Product Run is required";
    if (!form.foodTankNo) errors.foodTankNo = "Food Tank No. is required";
    if (!form.fillingTimeIn)
      errors.fillingTimeIn = "Filling Time IN is required";
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    onSubmit({ ...form, tankStatus: keyToStatus(statusKey) });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)" }}
      data-ocid="tank-log.dialog"
      onClick={onCancel}
      onKeyDown={(e) => e.key === "Escape" && onCancel()}
      role="presentation"
    >
      <div
        className="bg-card border-2 border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="section-header">
          <span className="font-display font-bold text-sm uppercase tracking-widest">
            {initial ? "Edit Tank Room Entry" : "Add Tank Room Entry"}
          </span>
          <button
            type="button"
            onClick={onCancel}
            className="text-primary-foreground/60 hover:text-primary-foreground transition-smooth"
            aria-label="Close"
            data-ocid="tank-log.close_button"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Row 1 — Date + Shift */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="trl-date"
                className="block font-display text-xs uppercase tracking-wider text-muted-foreground mb-1"
              >
                Date <span className="text-destructive">*</span>
              </label>
              <input
                id="trl-date"
                type="date"
                className={`input-industrial ${formErrors.date ? "border-destructive" : ""}`}
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                data-ocid="tank-log.date_input"
              />
              {formErrors.date && (
                <p className="text-destructive text-xs mt-1">
                  {formErrors.date}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="trl-shift"
                className="block font-display text-xs uppercase tracking-wider text-muted-foreground mb-1"
              >
                Shift <span className="text-destructive">*</span>
              </label>
              <input
                id="trl-shift"
                type="text"
                className={`input-industrial ${formErrors.shift ? "border-destructive" : ""}`}
                placeholder="e.g. Morning"
                value={form.shift}
                onChange={(e) => set("shift", e.target.value)}
                data-ocid="tank-log.shift_input"
              />
              {formErrors.shift && (
                <p className="text-destructive text-xs mt-1">
                  {formErrors.shift}
                </p>
              )}
            </div>
          </div>

          {/* Row 2 — Food Tank No (prominent) + Permanent Tank Number */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="trl-food-tank"
                className="block font-display text-xs uppercase tracking-wider mb-1"
                style={{ color: "oklch(var(--accent))" }}
              >
                Food Tank No. <span className="text-destructive">*</span>
                <span
                  className="ml-2 text-muted-foreground font-body normal-case tracking-normal"
                  style={{ fontSize: "10px" }}
                >
                  (traceability join key)
                </span>
              </label>
              <input
                id="trl-food-tank"
                type="text"
                className={`input-industrial font-display font-semibold ${formErrors.foodTankNo ? "border-destructive" : ""}`}
                style={
                  formErrors.foodTankNo
                    ? {}
                    : { borderColor: "oklch(var(--accent))" }
                }
                placeholder="e.g. FT-01"
                value={form.foodTankNo}
                onChange={(e) => set("foodTankNo", e.target.value)}
                data-ocid="tank-log.food_tank_no_input"
              />
              {formErrors.foodTankNo && (
                <p className="text-destructive text-xs mt-1">
                  {formErrors.foodTankNo}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="trl-perm-tank"
                className="block font-display text-xs uppercase tracking-wider text-muted-foreground mb-1"
              >
                Permanent Tank Number
              </label>
              <input
                id="trl-perm-tank"
                type="text"
                className="input-industrial"
                placeholder="e.g. PT-001"
                value={form.permanentTankNumber}
                onChange={(e) => set("permanentTankNumber", e.target.value)}
                data-ocid="tank-log.permanent_tank_input"
              />
            </div>
          </div>

          {/* Row 3 — Product Run */}
          <div>
            <label
              htmlFor="trl-product-run"
              className="block font-display text-xs uppercase tracking-wider text-muted-foreground mb-1"
            >
              Product Run <span className="text-destructive">*</span>
            </label>
            <input
              id="trl-product-run"
              type="text"
              className={`input-industrial ${formErrors.productRun ? "border-destructive" : ""}`}
              placeholder="e.g. Run 4"
              value={form.productRun}
              onChange={(e) => set("productRun", e.target.value)}
              data-ocid="tank-log.product_run_input"
            />
            {formErrors.productRun && (
              <p className="text-destructive text-xs mt-1">
                {formErrors.productRun}
              </p>
            )}
          </div>

          {/* Row 4 — Fill Time IN + OUT */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="trl-fill-in"
                className="block font-display text-xs uppercase tracking-wider text-muted-foreground mb-1"
              >
                Filling Time IN <span className="text-destructive">*</span>
              </label>
              <input
                id="trl-fill-in"
                type="time"
                className={`input-industrial ${formErrors.fillingTimeIn ? "border-destructive" : ""}`}
                value={form.fillingTimeIn}
                onChange={(e) => set("fillingTimeIn", e.target.value)}
                data-ocid="tank-log.fill_time_in_input"
              />
              {formErrors.fillingTimeIn && (
                <p className="text-destructive text-xs mt-1">
                  {formErrors.fillingTimeIn}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="trl-fill-out"
                className="block font-display text-xs uppercase tracking-wider text-muted-foreground mb-1"
              >
                Filling Time OUT
              </label>
              <input
                id="trl-fill-out"
                type="time"
                className="input-industrial"
                value={form.fillingTimeOut}
                onChange={(e) => set("fillingTimeOut", e.target.value)}
                data-ocid="tank-log.fill_time_out_input"
              />
            </div>
          </div>

          {/* Row 5 — Tank Status + Cleaned */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="trl-tank-status"
                className="block font-display text-xs uppercase tracking-wider text-muted-foreground mb-1"
              >
                Tank Status
              </label>
              <select
                id="trl-tank-status"
                className="input-industrial"
                value={statusKey}
                onChange={(e) => setStatusKey(e.target.value as TankStatusKey)}
                data-ocid="tank-log.status_select"
              >
                <option value="Food">Food</option>
                <option value="Hold">Hold</option>
                <option value="Feed">Feed</option>
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-accent"
                  checked={form.cleaned}
                  onChange={(e) => set("cleaned", e.target.checked)}
                  data-ocid="tank-log.cleaned_checkbox"
                />
                <span className="font-display text-xs uppercase tracking-wider text-foreground">
                  Cleaned
                </span>
              </label>
            </div>
          </div>

          {/* Reason for Hold/Feed */}
          {(statusKey === TankStatus.Hold || statusKey === TankStatus.Feed) && (
            <div>
              <label
                htmlFor="trl-reason"
                className="block font-display text-xs uppercase tracking-wider text-muted-foreground mb-1"
              >
                Reason for {statusKey === TankStatus.Hold ? "Hold" : "Feed"}
              </label>
              <input
                id="trl-reason"
                type="text"
                className="input-industrial"
                placeholder="Describe the reason"
                value={form.reasonForHold}
                onChange={(e) => set("reasonForHold", e.target.value)}
                data-ocid="tank-log.reason_input"
              />
            </div>
          )}

          {/* Corrective Action */}
          <div>
            <label
              htmlFor="trl-corrective"
              className="block font-display text-xs uppercase tracking-wider text-muted-foreground mb-1"
            >
              Corrective Action
            </label>
            <input
              id="trl-corrective"
              type="text"
              className="input-industrial"
              placeholder="Actions taken, if any"
              value={form.correctiveAction}
              onChange={(e) => set("correctiveAction", e.target.value)}
              data-ocid="tank-log.corrective_action_input"
            />
          </div>

          {/* Remark */}
          <div>
            <label
              htmlFor="trl-remark"
              className="block font-display text-xs uppercase tracking-wider text-muted-foreground mb-1"
            >
              Remark
            </label>
            <textarea
              id="trl-remark"
              className="input-industrial resize-none"
              rows={2}
              placeholder="Additional notes"
              value={form.remark}
              onChange={(e) => set("remark", e.target.value)}
              data-ocid="tank-log.remark_textarea"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onCancel}
              className="btn-ghost"
              data-ocid="tank-log.cancel_button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-accent"
              disabled={isSubmitting}
              data-ocid="tank-log.submit_button"
            >
              {isSubmitting
                ? "Saving…"
                : initial
                  ? "Update Entry"
                  : "Add Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
