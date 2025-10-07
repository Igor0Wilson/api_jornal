import { Request, Response } from "express";
import { db } from "../models/bdModel";
import cloudinary from "../middleware/cloudinary";

// Criar notícia
export const createNews = async (req: Request, res: Response) => {
  const { title, content, city_id, category, reading_time } = req.body; // ✅ novo campo
  const files = req.files as Express.Multer.File[];

  try {
    // Inserir notícia no banco (com tempo de leitura)
    const [result]: any = await db.query(
      "INSERT INTO news (title, content, city_id, category, reading_time) VALUES (?, ?, ?, ?, ?)",
      [title, content, city_id, category, reading_time]
    );
    const newsId = result.insertId;

    if (files && files.length > 0) {
      const imageUrls: string[] = [];

      for (const file of files) {
        // Upload para Cloudinary usando buffer
        const uploadResult = await new Promise<any>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "jornal" },
            (error: any, result: any) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          (file as any).stream?.pipe(stream) || stream.end(file.buffer);
        });

        imageUrls.push(uploadResult.secure_url);
      }

      // Inserir URLs no banco
      const imageInserts = imageUrls.map((url) => [newsId, url]);
      await db.query("INSERT INTO news_images (news_id, image_url) VALUES ?", [
        imageInserts,
      ]);
    }

    res.status(201).json({ message: "Notícia criada com sucesso", id: newsId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar notícia" });
  }
};

// Listar notícias
export const getNews = async (req: Request, res: Response) => {
  try {
    const { busca, region_id, city_id, dataInicio, dataFim } = req.query;

    let query = `
      SELECT 
        n.*, 
        r.name AS region, 
        c.name AS city, 
        JSON_ARRAYAGG(ni.image_url) AS images
      FROM news n
      LEFT JOIN news_images ni ON n.id = ni.news_id
      LEFT JOIN cities c ON n.city_id = c.id
      LEFT JOIN regions r ON c.region_id = r.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (busca) {
      query += ` AND (LOWER(n.title) LIKE ? OR LOWER(n.category) LIKE ?)`;
      params.push(`%${(busca as string).toLowerCase()}%`);
      params.push(`%${(busca as string).toLowerCase()}%`);
    }

    if (region_id) {
      query += ` AND r.id = ?`;
      params.push(region_id);
    }

    if (city_id) {
      query += ` AND c.id = ?`;
      params.push(city_id);
    }

    if (dataInicio) {
      query += ` AND DATE(n.created_at) >= ?`;
      params.push(dataInicio);
    }

    if (dataFim) {
      query += ` AND DATE(n.created_at) <= ?`;
      params.push(dataFim);
    }

    query += ` GROUP BY n.id ORDER BY n.created_at DESC`;

    const [rows]: any = await db.query(query, params);

    // Garante que 'images' seja array válido
    const formatted = rows.map((row: any) => ({
      ...row,
      images: Array.isArray(row.images)
        ? row.images.filter((i: any) => i !== null)
        : [],
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Erro ao buscar notícias:", err);
    res.status(500).json({ error: "Erro ao buscar notícias" });
  }
};

// Buscar notícia por ID
export const getNewsById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [rows]: any = await db.query(
      `
      SELECT 
        n.id,
        n.title,
        n.content,
        n.category,
        n.reading_time,
        n.city_id,
        c.name AS city_name,
        n.created_at,
        (
          SELECT JSON_ARRAYAGG(image_url)
          FROM news_images
          WHERE news_id = n.id
        ) AS images
      FROM news n
      LEFT JOIN cities c ON c.id = n.city_id
      WHERE n.id = ?
      `,
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Notícia não encontrada" });

    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao buscar notícia:", err);
    res.status(500).json({ error: "Erro ao buscar notícia" });
  }
};
// Deletar notícia
export const deleteNews = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Remove imagens relacionadas
    await db.query("DELETE FROM news_images WHERE news_id = ?", [id]);
    // Remove notícia
    const [result]: any = await db.query("DELETE FROM news WHERE id = ?", [id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Notícia não encontrada" });

    res.json({ message: "Notícia deletada com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar notícia:", err);
    res.status(500).json({ error: "Erro ao deletar notícia" });
  }
};

// Atualizar notícia
export const updateNews = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content, category, city_id, reading_time } = req.body;
  const files = req.files as Express.Multer.File[];

  try {
    // Atualiza dados da notícia
    await db.query(
      `
      UPDATE news 
      SET title = ?, content = ?, category = ?, city_id = ?, reading_time = ?
      WHERE id = ?
      `,
      [title, content, category, city_id, reading_time, id]
    );

    // Se houver novas imagens, envia para o Cloudinary e substitui
    if (files && files.length > 0) {
      const imageUrls: string[] = [];

      for (const file of files) {
        const uploadResult = await new Promise<any>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "jornal" },
            (error: any, result: any) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          (file as any).stream?.pipe(stream) || stream.end(file.buffer);
        });

        imageUrls.push(uploadResult.secure_url);
      }

      // Remove imagens antigas e insere novas
      await db.query("DELETE FROM news_images WHERE news_id = ?", [id]);
      const imageInserts = imageUrls.map((url) => [id, url]);
      await db.query("INSERT INTO news_images (news_id, image_url) VALUES ?", [
        imageInserts,
      ]);
    }

    res.json({ message: "Notícia atualizada com sucesso" });
  } catch (err) {
    console.error("Erro ao atualizar notícia:", err);
    res.status(500).json({ error: "Erro ao atualizar notícia" });
  }
};
