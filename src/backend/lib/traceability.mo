import List "mo:core/List";
import Set "mo:core/Set";
import PackingTypes "../types/packing";
import TankTypes "../types/tankroom";
import MuesliTypes "../types/muesli";
import TraceTypes "../types/traceability";
import CommonTypes "../types/common";
import Time "mo:core/Time";

module {
  /// Backward traceability: given a batch code, find all tanks used and then
  /// for each tank's fill date find the muesli process log entries (raw materials + lot numbers).
  public func backward(
    packingStore : List.List<PackingTypes.PackingLogEntry>,
    tankStore : List.List<TankTypes.TankRoomLogEntry>,
    muesliStore : List.List<MuesliTypes.MuesliProcessLogEntry>,
    batchCode : Text,
  ) : TraceTypes.BackwardTraceResult {
    // Step 1: find all packing entries with this batchCode
    let packingEntries = packingStore.filter(func(p) { p.batchCode == batchCode });

    // Step 2: collect all foodTankNos from their tankBatchCodes
    let allTankNos = List.empty<Text>();
    packingEntries.forEach(func(p) {
      for (t in p.tankBatchCodes.values()) {
        allTankNos.add(t);
      };
    });

    // Step 3: for each foodTankNo find matching tank room entries
    let tankUsages = List.empty<TraceTypes.TankUsage>();
    let datesSet = List.empty<Text>();

    allTankNos.forEach(func(foodTankNo) {
      let tankEntries = tankStore.filter(func(t) { t.foodTankNo == foodTankNo });
      tankEntries.forEach(func(t) {
        tankUsages.add({ foodTankNo = t.foodTankNo; date = t.date; shift = t.shift });
        // collect unique dates
        if (datesSet.find(func(d) { d == t.date }) == null) {
          datesSet.add(t.date);
        };
      });
    });

    // Step 4: for each date find matching muesli process log entries
    let muesliLogs = List.empty<TraceTypes.DateIngredients>();
    datesSet.forEach(func(date) {
      let muesliEntries = muesliStore.filter(func(m) { m.date == date });
      muesliEntries.forEach(func(m) {
        muesliLogs.add({
          date = m.date;
          shift = m.shift;
          product = m.product;
          run = m.run;
          ingredients = m.ingredients;
        });
      });
    });

    {
      batchCode;
      tanks = tankUsages.toArray();
      muesliLogs = muesliLogs.toArray();
    };
  };

  /// Returns ISO week number (1-53) for a given Int timestamp in nanoseconds.
  /// Week 1 is the week containing the first Thursday of the year (ISO 8601).
  /// We approximate using date text comparison: compute current week bounds from now.
  func isoWeekBounds(nowNs : Int) : (Text, Text) {
    // Convert nanoseconds to seconds
    let nowSec : Int = nowNs / 1_000_000_000;
    // Days since epoch (1970-01-01 was a Thursday)
    let daysSinceEpoch : Int = nowSec / 86400;
    // Day of week: 0=Monday ... 6=Sunday (ISO week starts Monday)
    // 1970-01-01 was Thursday = day 3 in Mon-based (0=Mon)
    let dow : Int = ((daysSinceEpoch + 3) % 7 + 7) % 7; // 0=Mon..6=Sun
    let weekStartDay : Int = daysSinceEpoch - dow;
    let weekEndDay : Int = weekStartDay + 6;
    let weekStartSec : Int = weekStartDay * 86400;
    let weekEndSec : Int = (weekEndDay + 1) * 86400 - 1;
    // Convert back to date text YYYY-MM-DD
    func toDateText(epochSec : Int) : Text {
      var s = epochSec;
      var y : Int = 1970;
      label yearLoop loop {
        let daysInYear : Int = if ((y % 400 == 0) or (y % 4 == 0 and y % 100 != 0)) 366 else 365;
        if (s < daysInYear * 86400) { break yearLoop };
        s := s - daysInYear * 86400;
        y := y + 1;
      };
      let dayOfYear : Int = s / 86400;
      let monthDays : [Int] = [
        31,
        if ((y % 400 == 0) or (y % 4 == 0 and y % 100 != 0)) 29 else 28,
        31, 30, 31, 30, 31, 31, 30, 31, 30, 31
      ];
      var remaining : Int = dayOfYear;
      var month : Int = 1;
      label monthLoop for (days in monthDays.values()) {
        if (remaining < days) { break monthLoop };
        remaining := remaining - days;
        month := month + 1;
      };
      let day : Int = remaining + 1;
      let yy = y.toText();
      let mm = if (month < 10) "0" # month.toText() else month.toText();
      let dd = if (day < 10) "0" # day.toText() else day.toText();
      yy # "-" # mm # "-" # dd;
    };
    (toDateText(weekStartSec), toDateText(weekEndSec));
  };

  /// Dashboard statistics
  public func getDashboardStats(
    packingStore : List.List<PackingTypes.PackingLogEntry>,
    tankStore : List.List<TankTypes.TankRoomLogEntry>,
    muesliStore : List.List<MuesliTypes.MuesliProcessLogEntry>,
    now : Int,
  ) : CommonTypes.DashboardStats {
    let (weekStart, weekEnd) = isoWeekBounds(now);
    // Count packing entries in current ISO week
    let totalBatchesThisWeek = packingStore.filter(func(p) {
      p.date >= weekStart and p.date <= weekEnd
    }).size();
    // Count tank entries with Hold or Feed status
    let holdsCount = tankStore.filter(func(t) {
      switch (t.tankStatus) {
        case (#Hold or #Feed) { true };
        case _ { false };
      };
    }).size();
    // Count distinct raw material lot numbers used this week
    let lotSet = Set.empty<Text>();
    muesliStore.filter(func(m) {
      m.date >= weekStart and m.date <= weekEnd
    }).forEach(func(m) {
      for (ing in m.ingredients.values()) {
        lotSet.add(ing.lotNo);
      };
    });
    let rawMaterialsConsumedThisWeek = lotSet.size();
    { totalBatchesThisWeek; holdsCount; rawMaterialsConsumedThisWeek };
  };

  /// Check if a batch code already exists in the packing store
  public func checkDuplicateBatchCode(
    packingStore : List.List<PackingTypes.PackingLogEntry>,
    batchCode : Text,
  ) : Bool {
    packingStore.find(func(p) { p.batchCode == batchCode }) != null;
  };

  /// Check if a lot number already exists in the specified log book
  public func checkDuplicateLotNumber(
    packingStore : List.List<PackingTypes.PackingLogEntry>,
    muesliStore : List.List<MuesliTypes.MuesliProcessLogEntry>,
    lotNumber : Text,
    logBook : Text,
  ) : Bool {
    if (logBook == "rawMaterials") {
      muesliStore.find(func(m) {
        m.ingredients.find(func(i) { i.lotNo == lotNumber }) != null
      }) != null;
    } else {
      // packing log: check bulkBagLotNo and casePartitionLotNo
      packingStore.find(func(p) {
        p.bulkBagLotNo == lotNumber or p.casePartitionLotNo == lotNumber
      }) != null;
    };
  };

  /// Get all flagged records (tanks with Hold or Feed status) joined with packing + raw materials
  public func getFlaggedRecords(
    packingStore : List.List<PackingTypes.PackingLogEntry>,
    tankStore : List.List<TankTypes.TankRoomLogEntry>,
    muesliStore : List.List<MuesliTypes.MuesliProcessLogEntry>,
  ) : [TraceTypes.FlaggedRecord] {
    let flagged = tankStore.filter(func(t) {
      switch (t.tankStatus) {
        case (#Hold or #Feed) { true };
        case _ { false };
      };
    });
    flagged.map<TankTypes.TankRoomLogEntry, TraceTypes.FlaggedRecord>(func(tankEntry) {
      // Find packing entries that used this food tank
      let linkedBatchCodes = packingStore.filter(func(p) {
        p.tankBatchCodes.find(func(t) { t == tankEntry.foodTankNo }) != null
      }).map(func(p) { p.batchCode }).toArray();
      // Find raw material lot numbers from muesli entries on the same date
      let lotSet = Set.empty<Text>();
      muesliStore.filter(func(m) { m.date == tankEntry.date }).forEach(func(m) {
        for (ing in m.ingredients.values()) {
          lotSet.add(ing.lotNo);
        };
      });
      let linkedLotNumbers = lotSet.toArray();
      { tankEntry; linkedBatchCodes; linkedLotNumbers };
    }).toArray();
  };

  /// Get shift report for a given date and shift
  public func getShiftReport(
    packingStore : List.List<PackingTypes.PackingLogEntry>,
    tankStore : List.List<TankTypes.TankRoomLogEntry>,
    muesliStore : List.List<MuesliTypes.MuesliProcessLogEntry>,
    date : Text,
    shift : Text,
  ) : TraceTypes.ShiftReport {
    let packingEntries = packingStore.filter(func(p) {
      p.date == date
    }).toArray();
    let tankEntries = tankStore.filter(func(t) {
      t.date == date and t.shift == shift
    }).toArray();
    let rawMaterialEntries = muesliStore.filter(func(m) {
      m.date == date and m.shift == shift
    }).toArray();
    { date; shift; packingEntries; tankEntries; rawMaterialEntries };
  };

  /// Forward traceability: given a raw material lot number, find all muesli process log dates
  /// it was used on, then for each date find the tank room entries, then find all packing batch codes
  /// linked via Food Tank Number.
  public func forward(
    packingStore : List.List<PackingTypes.PackingLogEntry>,
    tankStore : List.List<TankTypes.TankRoomLogEntry>,
    muesliStore : List.List<MuesliTypes.MuesliProcessLogEntry>,
    lotNo : Text,
  ) : TraceTypes.ForwardTraceResult {
    // Step 1: find muesli entries containing that lotNo
    let muesliEntries = muesliStore.filter(func(m) {
      m.ingredients.find(func(i) { i.lotNo == lotNo }) != null
    });

    // Step 2: collect unique dates
    let datesSet = List.empty<Text>();
    muesliEntries.forEach(func(m) {
      if (datesSet.find(func(d) { d == m.date }) == null) {
        datesSet.add(m.date);
      };
    });

    // Step 3: for each date find tank room entries
    let allTankNos = List.empty<Text>();
    datesSet.forEach(func(date) {
      let tankEntries = tankStore.filter(func(t) { t.date == date });
      tankEntries.forEach(func(t) {
        if (allTankNos.find(func(n) { n == t.foodTankNo }) == null) {
          allTankNos.add(t.foodTankNo);
        };
      });
    });

    // Step 4: find packing entries whose tankBatchCodes contain any of those foodTankNos
    let matchedPacking = packingStore.filter(func(p) {
      p.tankBatchCodes.find(func(t) {
        allTankNos.find(func(n) { n == t }) != null
      }) != null
    });

    let packingEntries = matchedPacking.map<PackingTypes.PackingLogEntry, TraceTypes.PackingReference>(func(p) {
      {
        batchCode = p.batchCode;
        date = p.date;
        productName = p.productName;
        foodTankNos = p.tankBatchCodes;
      };
    }).toArray();

    {
      lotNo;
      muesliDates = datesSet.toArray();
      packingEntries;
    };
  };
};
