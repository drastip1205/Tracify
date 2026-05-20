module {
  /// A single entry in the Packing Log.
  /// tankBatchCodes holds the Food Tank Numbers used in this run — the join key to TankRoomLog.
  public type PackingLogEntry = {
    id : Nat;
    date : Text;
    crew : Text;
    machineNo : Text;
    productName : Text;
    netWeight : Text;
    variety : Text;
    mfgDate : Text;
    batchCode : Text;
    mrp : Text;
    bestBefore : Text;
    caseCode : Text;
    bulkBagSupplier : Text;
    bulkBagLotNo : Text;
    casePartitionSupplier : Text;
    casePartitionLotNo : Text;
    /// Food Tank Numbers (join key to TankRoomLog)
    tankBatchCodes : [Text];
    // Audit fields
    createdBy : Text;
    createdAt : Int;
    updatedBy : ?Text;
    updatedAt : ?Int;
  };

  /// Input type for creating a new PackingLogEntry — callers do not supply id or audit fields.
  public type PackingLogInput = {
    date : Text;
    crew : Text;
    machineNo : Text;
    productName : Text;
    netWeight : Text;
    variety : Text;
    mfgDate : Text;
    batchCode : Text;
    mrp : Text;
    bestBefore : Text;
    caseCode : Text;
    bulkBagSupplier : Text;
    bulkBagLotNo : Text;
    casePartitionSupplier : Text;
    casePartitionLotNo : Text;
    tankBatchCodes : [Text];
  };
};
