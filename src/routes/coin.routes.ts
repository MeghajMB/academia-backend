import { Router } from "express";
import { verifyToken } from "../middleware/verify-token";
import { verifyUser } from "../middleware/verify-user";
import { CoinController } from "../controllers/coin/coin.controller";
import { CoinRepository } from "../repositories/coin/coin.repository";
import { CoinService } from "../services/coin/coin.service";

const router = Router();

// Dependency Injection
const coinRepository = new CoinRepository();
const coinService = new CoinService(coinRepository);
const coinController = new CoinController(coinService);

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
