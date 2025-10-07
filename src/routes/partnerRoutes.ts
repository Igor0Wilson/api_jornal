import { Router } from "express";
import upload from "../middleware/upload"; // Multer em memória para Cloudinary
import {
  createPartner,
  getPartners,
  deletePartner,
} from "../controller/partnerController";

const router = Router();

// Rotas de parceiros
router.post("/", upload.single("image"), createPartner);
router.get("/", getPartners);
router.delete("/:id", deletePartner);

export default router;
