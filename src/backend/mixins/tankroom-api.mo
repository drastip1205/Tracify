import List "mo:core/List";
import Time "mo:core/Time";
import TankTypes "../types/tankroom";
import CommonTypes "../types/common";
import TankLib "../lib/tankroom";

mixin (
  tankStore : List.List<TankTypes.TankRoomLogEntry>,
  tankState : { var nextId : Nat },
) {
  public shared ({ caller }) func addTankRoomLog(
    input : TankTypes.TankRoomLogInput
  ) : async { #ok : TankTypes.TankRoomLogEntry; #err : Text } {
    if (input.foodTankNo == "") {
      return #err("foodTankNo is required");
    };
    #ok(TankLib.add(tankStore, tankState, input, caller.toText(), Time.now()));
  };

  public shared ({ caller }) func updateTankRoomLog(
    entry : TankTypes.TankRoomLogEntry
  ) : async { #ok : Bool; #err : Text } {
    let ok = TankLib.update(tankStore, entry, caller.toText(), Time.now());
    if (ok) { #ok(true) } else { #err("Entry not found: " # entry.id.toText()) };
  };

  public func deleteTankRoomLog(id : Nat) : async Bool {
    TankLib.delete(tankStore, id);
  };

  public query func getTankRoomLogs(
    dateRange : ?CommonTypes.DateRange
  ) : async [TankTypes.TankRoomLogEntry] {
    TankLib.getFiltered(tankStore, dateRange);
  };
};
