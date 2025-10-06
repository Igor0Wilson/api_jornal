import { Router } from "express";
import {
  createCity,
  deleteCity,
  getCities,
} from "../controller/cityController";

const router = Router();
router.post("/", createCity);
router.get("/", getCities);
router.delete("/:id", deleteCity);
export default router;
