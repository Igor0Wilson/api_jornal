import { Router } from "express";
import upload from "../middleware/upload"; // Multer em memória para Cloudinary
import {
  createAd,
  getAds,
  updateAd,
  deleteAd,
} from "../controller/adController";

const router = Router();

// Rotas de publicidade
router.post("/", upload.single("image"), createAd);
router.get("/", getAds);
router.put("/:id", upload.single("image"), updateAd);
router.delete("/:id", deleteAd);

export default router;
