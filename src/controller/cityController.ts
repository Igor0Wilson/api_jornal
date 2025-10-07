import { Request, Response } from "express";
import { db } from "../models/bdModel";

export const createCity = async (req: Request, res: Response) => {
  const { name, region_id } = req.body;
  try {
    const [result]: any = await db.query(
      "INSERT INTO cities (name, region_id) VALUES (?, ?)",
      [name, region_id]
    );
    res.status(201).json({ message: "Cidade criada", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

export const getCities = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query("SELECT * FROM cities");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

export const deleteCity = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [result]: any = await db.query("DELETE FROM cities WHERE id = ?", [
      id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cidade não encontrada" });
    }
    res.json({ message: "Cidade deletada" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
