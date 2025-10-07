import { Request, Response } from "express";
import { db } from "../models/bdModel";
import cloudinary from "../middleware/cloudinary";

// Criar publicidade
export const createAd = async (req: Request, res: Response) => {
  const { title, link, priority, user_id } = req.body;
  const file = req.file;

  if (!title || !link || !file) {
    return res.status(400).json({ error: "Preencha título, link e imagem" });
  }

  try {
    // Upload da imagem para Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "ads" },
        (error: any, result: any) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      (file as any).stream?.pipe(stream) || stream.end(file.buffer);
    });

    const image_url = uploadResult.secure_url;

    const [result]: any = await db.query(
      "INSERT INTO ads (title, image_url, link, priority, user_id, active) VALUES (?, ?, ?, ?, ?, ?)",
      [title, image_url, link, priority ?? 0, user_id ?? null, 1]
    );

    res.status(201).json({
      message: "Publicidade criada com sucesso",
      id: result.insertId,
      image_url,
    });
  } catch (err) {
    console.error("Erro ao criar publicidade:", err);
    res.status(500).json({ error: "Erro ao criar publicidade" });
  }
};

// Listar todas as publicidades
export const getAds = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query(
      `
      SELECT 
        id, 
        title, 
        link, 
        priority, 
        created_at, 
        image_url
      FROM ads
      ORDER BY priority DESC, created_at DESC
      `
    );

    // se quiser garantir formato consistente:
    const ads = rows.map((ad: any) => ({
      id: ad.id,
      title: ad.title,
      link: ad.link,
      priority: ad.priority,
      created_at: ad.created_at,
      image: ad.image_url ? ad.image_url : null, // Cloudinary URL
    }));

    res.json(ads);
  } catch (err) {
    console.error("Erro ao buscar publicidades:", err);
    res.status(500).json({ error: "Erro ao buscar publicidades" });
  }
};

// Atualizar publicidade
export const updateAd = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, link, priority, active } = req.body;
  const file = req.file;

  try {
    let query =
      "UPDATE ads SET title = ?, link = ?, priority = ?, active = ? WHERE id = ?";
    const params: any[] = [title, link, priority ?? 0, active ?? 1, id];

    if (file) {
      // Upload da nova imagem para Cloudinary
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "ads" },
          (error: any, result: any) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        (file as any).stream?.pipe(stream) || stream.end(file.buffer);
      });

      const image_url = uploadResult.secure_url;

      query =
        "UPDATE ads SET title = ?, link = ?, priority = ?, active = ?, image_url = ? WHERE id = ?";
      params.splice(4, 0, image_url);
    }

    const [result]: any = await db.query(query, params);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Publicidade não encontrada" });

    res.json({ message: "Publicidade atualizada com sucesso" });
  } catch (err) {
    console.error("Erro ao atualizar publicidade:", err);
    res.status(500).json({ error: "Erro ao atualizar publicidade" });
  }
};

// Deletar publicidade
export const deleteAd = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [result]: any = await db.query("DELETE FROM ads WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Publicidade não encontrada" });
    }
    res.json({ message: "Publicidade deletada com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar publicidade:", err);
    res.status(500).json({ error: "Erro ao deletar publicidade" });
  }
};
