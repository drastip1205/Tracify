import List "mo:core/List";
import PackingTypes "../types/packing";
import CommonTypes "../types/common";

module {
  public type PackingLogEntry = PackingTypes.PackingLogEntry;
  public type PackingLogInput = PackingTypes.PackingLogInput;
  public type DateRange = CommonTypes.DateRange;

  public func getAll(store : List.List<PackingLogEntry>) : [PackingLogEntry] {
    store.toArray();
  };

  /// Returns all packing entries, optionally filtered by an inclusive date range.
  public func getFiltered(
    store : List.List<PackingLogEntry>,
    dateRange : ?DateRange,
  ) : [PackingLogEntry] {
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
    store : List.List<PackingLogEntry>,
    state : { var nextId : Nat },
    input : PackingLogInput,
    callerText : Text,
    now : Int,
  ) : PackingLogEntry {
    let entry : PackingLogEntry = {
      id = state.nextId;
      date = input.date;
      crew = input.crew;
      machineNo = input.machineNo;
      productName = input.productName;
      netWeight = input.netWeight;
      variety = input.variety;
      mfgDate = input.mfgDate;
      batchCode = input.batchCode;
      mrp = input.mrp;
      bestBefore = input.bestBefore;
      caseCode = input.caseCode;
      bulkBagSupplier = input.bulkBagSupplier;
      bulkBagLotNo = input.bulkBagLotNo;
      casePartitionSupplier = input.casePartitionSupplier;
      casePartitionLotNo = input.casePartitionLotNo;
      tankBatchCodes = input.tankBatchCodes;
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
    store : List.List<PackingLogEntry>,
    entry : PackingLogEntry,
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
    store : List.List<PackingLogEntry>,
    id : Nat,
  ) : Bool {
    let before = store.size();
    let kept = store.filter(func(e) { e.id != id });
    store.clear();
    store.append(kept);
    store.size() < before;
  };

  /// Returns all packing entries whose tankBatchCodes contain the given foodTankNo
  public func findByFoodTankNo(
    store : List.List<PackingLogEntry>,
    foodTankNo : Text,
  ) : [PackingLogEntry] {
    store.filter(func(e) {
      e.tankBatchCodes.find(func(t) { t == foodTankNo }) != null
    }).toArray();
  };

};
