import List "mo:core/List";
import Time "mo:core/Time";
import PackingTypes "../types/packing";
import CommonTypes "../types/common";
import PackingLib "../lib/packing";

mixin (
  packingStore : List.List<PackingTypes.PackingLogEntry>,
  packingState : { var nextId : Nat },
) {
  public shared ({ caller }) func addPackingLog(
    input : PackingTypes.PackingLogInput
  ) : async { #ok : PackingTypes.PackingLogEntry; #err : Text } {
    if (input.batchCode == "") {
      return #err("batchCode is required");
    };
    #ok(PackingLib.add(packingStore, packingState, input, caller.toText(), Time.now()));
  };

  public shared ({ caller }) func updatePackingLog(
    entry : PackingTypes.PackingLogEntry
  ) : async { #ok : Bool; #err : Text } {
    let ok = PackingLib.update(packingStore, entry, caller.toText(), Time.now());
    if (ok) { #ok(true) } else { #err("Entry not found: " # entry.id.toText()) };
  };

  public func deletePackingLog(id : Nat) : async Bool {
    PackingLib.delete(packingStore, id);
  };

  public query func getPackingLogs(
    dateRange : ?CommonTypes.DateRange
  ) : async [PackingTypes.PackingLogEntry] {
    PackingLib.getFiltered(packingStore, dateRange);
  };
};
