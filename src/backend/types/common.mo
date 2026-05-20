import Map "mo:core/Map";
import List "mo:core/List";

module {
  public type Id = Nat;
  public type DateText = Text; // ISO date string "YYYY-MM-DD"
  public type ShiftText = Text; // e.g. "Morning", "Afternoon", "Night"

  /// Audit metadata stamped on every log entry
  public type AuditInfo = {
    createdBy : Text;
    createdAt : Int;
    updatedBy : ?Text;
    updatedAt : ?Int;
  };

  /// Inclusive date range for filtering queries
  public type DateRange = {
    fromDate : DateText;
    toDate : DateText;
  };

  /// Dashboard statistics summary
  public type DashboardStats = {
    totalBatchesThisWeek : Nat;
    holdsCount : Nat;
    rawMaterialsConsumedThisWeek : Nat;
  };
};
