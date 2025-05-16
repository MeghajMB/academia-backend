import { Router } from "express";
import { verifyToken } from "../../middleware/verify-token";
import { verifyUser } from "../../middleware/verify-user";
import { container } from "../../container";
import { ICoinController } from "../../controllers/coin/coin.interface";
import { Types } from "../../container/types";

const router = Router();

const coinController = container.get<ICoinController>(Types.CoinController);

// Routes

//get all packages
router.get(
  "/packages",
  verifyToken,
  verifyUser("instructor", "student", "admin"),
  coinController.getPackages.bind(coinController)
);
//get coin configuration
router.get(
  "/config",
  verifyToken,
  verifyUser("admin"),
  coinController.getCoinConfig.bind(coinController)
);
//update ratios
router.put(
  "/config/ratios",
  verifyToken,
  verifyUser("admin"),
  coinController.updateCoinRatio.bind(coinController)
);
//create package
router.post(
  "/package",
  verifyToken,
  verifyUser("admin"),
  coinController.createCoinPackage.bind(coinController)
);
//delete package
router
  .route("/package/:packageId")
  .all(verifyToken, verifyUser("admin"))
  .put(coinController.updateCoinPackage.bind(coinController))
  .delete(coinController.deleteCoinPackage.bind(coinController))


export default router;
