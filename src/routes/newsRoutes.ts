import { Router } from "express";
import multer from "multer";
import {
  createNews,
  getNews,
  updateNews,
  deleteNews,
  getNewsById,
} from "../controller/newsController";

const router = Router();

// Configuração do multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // pasta onde serão salvas as imagens
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.post("/", upload.array("images", 10), createNews);
router.get("/", getNews);
router.get("/:id", getNewsById);
router.put("/:id", upload.array("images", 10), updateNews);

router.delete("/:id", deleteNews);

export default router;
