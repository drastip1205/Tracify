import List "mo:core/List";
import Time "mo:core/Time";
import PackingTypes "../types/packing";
import TankTypes "../types/tankroom";
import MuesliTypes "../types/muesli";
import TraceTypes "../types/traceability";
import CommonTypes "../types/common";
import TraceLib "../lib/traceability";

mixin (
  packingStore : List.List<PackingTypes.PackingLogEntry>,
  tankStore : List.List<TankTypes.TankRoomLogEntry>,
  muesliStore : List.List<MuesliTypes.MuesliProcessLogEntry>,
) {
  /// Backward traceability: batch code → tanks → raw materials + lot numbers
  /// Backward traceability: batch code → tanks → raw materials + lot numbers
  public query func backwardTraceability(
    batchCode : Text
  ) : async TraceTypes.BackwardTraceResult {
    TraceLib.backward(packingStore, tankStore, muesliStore, batchCode);
  };

  /// Forward traceability: raw material lot number → dates used → tank room entries → packing batch codes
  /// Forward traceability: raw material lot number → dates used → tank room entries → packing batch codes
  public query func forwardTraceability(
    lotNo : Text
  ) : async TraceTypes.ForwardTraceResult {
    TraceLib.forward(packingStore, tankStore, muesliStore, lotNo);
  };

  /// Dashboard statistics: batches this week, holds count, raw materials consumed this week
  public query func getDashboardStats() : async CommonTypes.DashboardStats {
    TraceLib.getDashboardStats(packingStore, tankStore, muesliStore, Time.now());
  };

  /// Check if a batch code already exists
  public query func checkDuplicateBatchCode(batchCode : Text) : async Bool {
    TraceLib.checkDuplicateBatchCode(packingStore, batchCode);
  };

  /// Check if a lot number already exists in the specified log book ("rawMaterials" or "packing")
  public query func checkDuplicateLotNumber(lotNumber : Text, logBook : Text) : async Bool {
    TraceLib.checkDuplicateLotNumber(packingStore, muesliStore, lotNumber, logBook);
  };

  /// Get all flagged records (tanks on Hold or Feed) with linked batch codes and lot numbers
  public query func getFlaggedRecords() : async [TraceTypes.FlaggedRecord] {
    TraceLib.getFlaggedRecords(packingStore, tankStore, muesliStore);
  };

  /// Get a shift report for a given date and shift
  public query func getShiftReport(date : Text, shift : Text) : async TraceTypes.ShiftReport {
    TraceLib.getShiftReport(packingStore, tankStore, muesliStore, date, shift);
  };
};
