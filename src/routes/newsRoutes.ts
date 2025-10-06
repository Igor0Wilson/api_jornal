import { Router } from "express";
import upload from "../middleware/upload"; // Multer em memória para Cloudinary
import {
  createNews,
  getNews,
  updateNews,
  deleteNews,
  getNewsById,
} from "../controller/newsController";

const router = Router();

// Rotas
router.post("/", upload.array("images", 10), createNews);
router.get("/", getNews);
router.get("/:id", getNewsById);
router.put("/:id", upload.array("images", 10), updateNews);
router.delete("/:id", deleteNews);

export default router;
