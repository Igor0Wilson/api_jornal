import { Router } from "express";
import upload from "../middleware/upload"; // usa o que você já tem
import {
  createAd,
  getAds,
  updateAd,
  deleteAd,
} from "../controller/adController";

const router = Router();

router.post("/", upload.single("image"), createAd);
router.get("/", getAds);
router.put("/:id", upload.single("image"), updateAd);
router.delete("/:id", deleteAd);

export default router;
