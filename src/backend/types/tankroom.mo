module {
  public type TankStatus = { #Food; #Hold; #Feed };

  /// A single entry in the Tank Room Log.
  /// foodTankNo is the PRIMARY JOIN KEY for traceability — NOT permanentTankNumber.
  public type TankRoomLogEntry = {
    id : Nat;
    date : Text;
    shift : Text;
    productRun : Text;
    batchCode : Text;
    /// PRIMARY JOIN KEY for traceability between Packing Log and Muesli Process Log
    foodTankNo : Text;
    cleaned : Bool;
    fillingTimeIn : Text;
    fillingTimeOut : Text;
    tankStatus : TankStatus;
    permanentTankNumber : Text;
    reasonForHold : Text;
    correctiveAction : Text;
    remark : Text;
    // Audit fields
    createdBy : Text;
    createdAt : Int;
    updatedBy : ?Text;
    updatedAt : ?Int;
  };

  /// Input type for creating a new TankRoomLogEntry — callers do not supply id or audit fields.
  public type TankRoomLogInput = {
    date : Text;
    shift : Text;
    productRun : Text;
    batchCode : Text;
    foodTankNo : Text;
    cleaned : Bool;
    fillingTimeIn : Text;
    fillingTimeOut : Text;
    tankStatus : TankStatus;
    permanentTankNumber : Text;
    reasonForHold : Text;
    correctiveAction : Text;
    remark : Text;
  };
};
