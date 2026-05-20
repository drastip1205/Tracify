module {
  public type IngredientRow = {
    ingredientName : Text;
    qty : Text;
    lotNo : Text;
    openingStock : Text;
    issueFromStores : Text;
    closingStock : Text;
  };

  public type MuesliProcessLogEntry = {
    id : Nat;
    date : Text;
    shift : Text;
    product : Text;
    run : Text;
    ingredients : [IngredientRow];
    // Audit fields
    createdBy : Text;
    createdAt : Int;
    updatedBy : ?Text;
    updatedAt : ?Int;
  };

  /// Input type for creating a new MuesliProcessLogEntry — callers do not supply id or audit fields.
  public type MuesliProcessLogInput = {
    date : Text;
    shift : Text;
    product : Text;
    run : Text;
    ingredients : [IngredientRow];
  };
};
