import { Request, Response } from "express";
import { db } from "../models/bdModel";
import cloudinary from "../middleware/cloudinary";

// Criar parceiro
export const createPartner = async (req: Request, res: Response) => {
  const { company_name, description, link } = req.body;
  const file = req.file;

  if (!company_name || !description || !link || !file) {
    return res
      .status(400)
      .json({ error: "Preencha nome, descrição, link e imagem" });
  }

  try {
    // Upload da imagem para Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "partners" },
        (error: any, result: any) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      (file as any).stream?.pipe(stream) || stream.end(file.buffer);
    });

    const image_url = uploadResult.secure_url;

    const [result]: any = await db.query(
      "INSERT INTO partners (company_name, description, link, image_url) VALUES (?, ?, ?, ?)",
      [company_name, description, link, image_url]
    );

    res.status(201).json({
      message: "Parceiro criado com sucesso",
      id: result.insertId,
      image_url,
    });
  } catch (err) {
    console.error("Erro ao criar parceiro:", err);
    res.status(500).json({ error: "Erro ao criar parceiro" });
  }
};

// Listar todos os parceiros
export const getPartners = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query(
      `
      SELECT 
        id,
        company_name,
        description,
        link,
        image_url,
        created_at
      FROM partners
      ORDER BY created_at DESC
      `
    );

    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar parceiros:", err);
    res.status(500).json({ error: "Erro ao buscar parceiros" });
  }
};

// Atualizar parceiro
export const updatePartner = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { company_name, description, link } = req.body;
  const file = req.file;

  try {
    let query =
      "UPDATE partners SET company_name = ?, description = ?, link = ? WHERE id = ?";
    const params: any[] = [company_name, description, link, id];

    if (file) {
      // Upload da nova imagem para Cloudinary
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "partners" },
          (error: any, result: any) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        (file as any).stream?.pipe(stream) || stream.end(file.buffer);
      });

      const image_url = uploadResult.secure_url;

      query =
        "UPDATE partners SET company_name = ?, description = ?, link = ?, image_url = ? WHERE id = ?";
      params.splice(3, 0, image_url);
    }

    const [result]: any = await db.query(query, params);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Parceiro não encontrado" });

    res.json({ message: "Parceiro atualizado com sucesso" });
  } catch (err) {
    console.error("Erro ao atualizar parceiro:", err);
    res.status(500).json({ error: "Erro ao atualizar parceiro" });
  }
};

// Deletar parceiro
export const deletePartner = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [result]: any = await db.query("DELETE FROM partners WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Parceiro não encontrado" });
    }

    res.json({ message: "Parceiro deletado com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar parceiro:", err);
    res.status(500).json({ error: "Erro ao deletar parceiro" });
  }
};
