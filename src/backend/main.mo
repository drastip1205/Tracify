import List "mo:core/List";
import PackingTypes "types/packing";
import TankTypes "types/tankroom";
import MuesliTypes "types/muesli";
import PackingLib "lib/packing";
import TankLib "lib/tankroom";
import MuesliLib "lib/muesli";
import PackingApi "mixins/packing-api";
import TankApi "mixins/tankroom-api";
import MuesliApi "mixins/muesli-api";
import TraceApi "mixins/traceability-api";



actor {
  // --- Stable state ---
  var packingStore = List.empty<PackingTypes.PackingLogEntry>();
  var tankStore = List.empty<TankTypes.TankRoomLogEntry>();
  var muesliStore = List.empty<MuesliTypes.MuesliProcessLogEntry>();

  var packingNextId : Nat = 1;
  var tankNextId : Nat = 1;
  var muesliNextId : Nat = 1;
  let packingState = { var nextId : Nat = packingNextId };
  let tankState = { var nextId : Nat = tankNextId };
  let muesliState = { var nextId : Nat = muesliNextId };

  // --- Mixin composition ---
  include PackingApi(packingStore, packingState);
  include TankApi(tankStore, tankState);
  include MuesliApi(muesliStore, muesliState);
  include TraceApi(packingStore, tankStore, muesliStore);
};
