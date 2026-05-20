import MuesliTypes "./muesli";
import PackingTypes "./packing";
import TankTypes "./tankroom";

module {
  /// One tank used in a batch (food tank number + date filled)
  public type TankUsage = {
    foodTankNo : Text;
    date : Text;
    shift : Text;
  };

  /// Ingredients found for a specific date in the Muesli Process Log
  public type DateIngredients = {
    date : Text;
    shift : Text;
    product : Text;
    run : Text;
    ingredients : [MuesliTypes.IngredientRow];
  };

  /// Result of backward traceability: for a batch code, tanks used + raw materials
  public type BackwardTraceResult = {
    batchCode : Text;
    tanks : [TankUsage];
    muesliLogs : [DateIngredients];
  };

  /// For forward traceability: a Packing Log entry that used the lot
  public type PackingReference = {
    batchCode : Text;
    date : Text;
    productName : Text;
    foodTankNos : [Text];
  };

  /// Result of forward traceability: for a lot number, all batch codes that used it
  public type ForwardTraceResult = {
    lotNo : Text;
    muesliDates : [Text];
    packingEntries : [PackingReference];
  };

  /// A flagged record: tank entry on Hold/Feed with linked packing batch codes and raw material lot numbers
  public type FlaggedRecord = {
    tankEntry : TankTypes.TankRoomLogEntry;
    linkedBatchCodes : [Text];
    linkedLotNumbers : [Text];
  };

  /// A shift report: all packing, tank, and raw material entries for a given date and shift
  public type ShiftReport = {
    date : Text;
    shift : Text;
    packingEntries : [PackingTypes.PackingLogEntry];
    tankEntries : [TankTypes.TankRoomLogEntry];
    rawMaterialEntries : [MuesliTypes.MuesliProcessLogEntry];
  };
};
