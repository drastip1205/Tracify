import List "mo:core/List";
import TankTypes "../types/tankroom";
import CommonTypes "../types/common";

module {
  public type TankRoomLogEntry = TankTypes.TankRoomLogEntry;
  public type TankRoomLogInput = TankTypes.TankRoomLogInput;
  public type DateRange = CommonTypes.DateRange;

  public func getAll(store : List.List<TankRoomLogEntry>) : [TankRoomLogEntry] {
    store.toArray();
  };

  /// Returns all tank room entries, optionally filtered by an inclusive date range.
  public func getFiltered(
    store : List.List<TankRoomLogEntry>,
    dateRange : ?DateRange,
  ) : [TankRoomLogEntry] {
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
    store : List.List<TankRoomLogEntry>,
    state : { var nextId : Nat },
    input : TankRoomLogInput,
    callerText : Text,
    now : Int,
  ) : TankRoomLogEntry {
    let entry : TankRoomLogEntry = {
      id = state.nextId;
      date = input.date;
      shift = input.shift;
      productRun = input.productRun;
      batchCode = input.batchCode;
      foodTankNo = input.foodTankNo;
      cleaned = input.cleaned;
      fillingTimeIn = input.fillingTimeIn;
      fillingTimeOut = input.fillingTimeOut;
      tankStatus = input.tankStatus;
      permanentTankNumber = input.permanentTankNumber;
      reasonForHold = input.reasonForHold;
      correctiveAction = input.correctiveAction;
      remark = input.remark;
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
    store : List.List<TankRoomLogEntry>,
    entry : TankRoomLogEntry,
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
    store : List.List<TankRoomLogEntry>,
    id : Nat,
  ) : Bool {
    let before = store.size();
    let kept = store.filter(func(e) { e.id != id });
    store.clear();
    store.append(kept);
    store.size() < before;
  };

  /// Returns all tank room entries for a given Food Tank Number
  public func findByFoodTankNo(
    store : List.List<TankRoomLogEntry>,
    foodTankNo : Text,
  ) : [TankRoomLogEntry] {
    store.filter(func(e) { e.foodTankNo == foodTankNo }).toArray();
  };

  /// Returns all tank room entries matching a given date
  public func findByDate(
    store : List.List<TankRoomLogEntry>,
    date : Text,
  ) : [TankRoomLogEntry] {
    store.filter(func(e) { e.date == date }).toArray();
  };

};
