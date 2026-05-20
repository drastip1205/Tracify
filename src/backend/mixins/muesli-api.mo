import List "mo:core/List";
import Time "mo:core/Time";
import MuesliTypes "../types/muesli";
import CommonTypes "../types/common";
import MuesliLib "../lib/muesli";

mixin (
  muesliStore : List.List<MuesliTypes.MuesliProcessLogEntry>,
  muesliState : { var nextId : Nat },
) {
  public shared ({ caller }) func addMuesliProcessLog(
    input : MuesliTypes.MuesliProcessLogInput
  ) : async { #ok : MuesliTypes.MuesliProcessLogEntry; #err : Text } {
    if (input.date == "") {
      return #err("date is required");
    };
    #ok(MuesliLib.add(muesliStore, muesliState, input, caller.toText(), Time.now()));
  };

  public shared ({ caller }) func updateMuesliProcessLog(
    entry : MuesliTypes.MuesliProcessLogEntry
  ) : async { #ok : Bool; #err : Text } {
    let ok = MuesliLib.update(muesliStore, entry, caller.toText(), Time.now());
    if (ok) { #ok(true) } else { #err("Entry not found: " # entry.id.toText()) };
  };

  public func deleteMuesliProcessLog(id : Nat) : async Bool {
    MuesliLib.delete(muesliStore, id);
  };

  public query func getMuesliProcessLogs(
    dateRange : ?CommonTypes.DateRange
  ) : async [MuesliTypes.MuesliProcessLogEntry] {
    MuesliLib.getFiltered(muesliStore, dateRange);
  };
};
