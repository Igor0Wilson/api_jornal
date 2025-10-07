import { Request, Response } from "express";
import { db } from "../models/bdModel";

export const createRegion = async (req: Request, res: Response) => {
  const { name } = req.body;
  try {
    const [result]: any = await db.query(
      "INSERT INTO regions (name) VALUES (?)",
      [name]
    );
    res.status(201).json({ message: "Região criada", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

export const getRegions = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query("SELECT * FROM regions");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

export const deleteRegion = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [result]: any = await db.query("DELETE FROM regions WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Região não encontrada" });
    }

    res.json({ message: "Região deletada com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
