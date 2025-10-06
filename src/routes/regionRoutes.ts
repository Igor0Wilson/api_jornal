import { Router } from "express";
import {
  createRegion,
  deleteRegion,
  getRegions,
} from "../controller/regionController";

const router = Router();
router.post("/", createRegion);
router.get("/", getRegions);
router.delete("/:id", deleteRegion);
export default router;
