import List "mo:core/List";
import MuesliTypes "../types/muesli";
import CommonTypes "../types/common";

module {
  public type MuesliProcessLogEntry = MuesliTypes.MuesliProcessLogEntry;
  public type MuesliProcessLogInput = MuesliTypes.MuesliProcessLogInput;
  public type DateRange = CommonTypes.DateRange;

  public func getAll(store : List.List<MuesliProcessLogEntry>) : [MuesliProcessLogEntry] {
    store.toArray();
  };

  /// Returns all muesli process log entries, optionally filtered by an inclusive date range.
  public func getFiltered(
    store : List.List<MuesliProcessLogEntry>,
    dateRange : ?DateRange,
  ) : [MuesliProcessLogEntry] {
    switch (dateRange) {
      case (null) { store.toArray() };
      case (?range) {
        store.filter(func(e) {
          e.date >= range.fromDate and e.date <= range.toDate
        }).toArray();
      };
    };
  };

  public func add(
    store : List.List<MuesliProcessLogEntry>,
    state : { var nextId : Nat },
    input : MuesliProcessLogInput,
    callerText : Text,
    now : Int,
  ) : MuesliProcessLogEntry {
    let entry : MuesliProcessLogEntry = {
      id = state.nextId;
      date = input.date;
      shift = input.shift;
      product = input.product;
      run = input.run;
      ingredients = input.ingredients;
      createdBy = callerText;
      createdAt = now;
      updatedBy = null;
      updatedAt = null;
    };
    store.add(entry);
    state.nextId += 1;
    entry;
  };

  public func update(
    store : List.List<MuesliProcessLogEntry>,
    entry : MuesliProcessLogEntry,
    callerText : Text,
    now : Int,
  ) : Bool {
    var found = false;
    store.mapInPlace(func(e) {
      if (e.id == entry.id) {
        found := true;
        { entry with createdBy = e.createdBy; createdAt = e.createdAt; updatedBy = ?callerText; updatedAt = ?now };
      } else { e };
    });
    found;
  };

  public func delete(
    store : List.List<MuesliProcessLogEntry>,
    id : Nat,
  ) : Bool {
    let before = store.size();
    let kept = store.filter(func(e) { e.id != id });
    store.clear();
    store.append(kept);
    store.size() < before;
  };

  /// Returns all muesli process log entries for a given date
  public func findByDate(
    store : List.List<MuesliProcessLogEntry>,
    date : Text,
  ) : [MuesliProcessLogEntry] {
    store.filter(func(e) { e.date == date }).toArray();
  };

  /// Returns all muesli process log entries that contain a given lot number
  public func findByLotNo(
    store : List.List<MuesliProcessLogEntry>,
    lotNo : Text,
  ) : [MuesliProcessLogEntry] {
    store.filter(func(e) {
      e.ingredients.find(func(i) { i.lotNo == lotNo }) != null
    }).toArray();
  };

};
