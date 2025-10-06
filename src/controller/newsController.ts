import { Request, Response } from "express";
import { db } from "../models/newsModel";
import cloudinary from "../middleware/cloudinary";

// Criar notícia
export const createNews = async (req: Request, res: Response) => {
  const { title, content, city_id, category } = req.body;
  const files = req.files as Express.Multer.File[];

  try {
    // Inserir notícia no banco
    const [result]: any = await db.query(
      "INSERT INTO news (title, content, city_id, category) VALUES (?, ?, ?, ?)",
      [title, content, city_id, category]
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

    res.status(201).json({ message: "Notícia criada", id: newsId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

// Listar notícias
export const getNews = async (req: Request, res: Response) => {
  try {
    const { busca, region_id, city_id, dataInicio, dataFim } = req.query;

    let query = `
      SELECT n.*, r.name AS region, c.name AS city, GROUP_CONCAT(ni.image_url) AS images
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

    const [rows] = await db.query(query, params);

    const newsWithImages = (rows as any[]).map((row) => ({
      ...row,
      images: row.images ? row.images.split(",") : [],
    }));

    res.json(newsWithImages);
  } catch (err) {
    console.error("Erro ao buscar notícias:", err);
    res.status(500).json({ error: err });
  }
};

// Buscar notícia por ID
export const getNewsById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [rows]: any = await db.query(
      `
      SELECT n.*, GROUP_CONCAT(ni.image_url) AS images
      FROM news n
      LEFT JOIN news_images ni ON n.id = ni.news_id
      WHERE n.id = ?
      GROUP BY n.id
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Notícia não encontrada" });
    }

    const noticia = rows[0];
    noticia.images = noticia.images ? noticia.images.split(",") : [];

    res.json(noticia);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

// Deletar notícia
export const deleteNews = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [result]: any = await db.query("DELETE FROM news WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Notícia não encontrada" });
    }
    res.json({ message: "Notícia deletada com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

// Atualizar notícia
export const updateNews = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content, city_id, category } = req.body;
  const files = req.files as Express.Multer.File[];

  try {
    const [existing]: any = await db.query("SELECT * FROM news WHERE id = ?", [
      id,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Notícia não encontrada" });
    }

    await db.query(
      `UPDATE news SET title = ?, content = ?, city_id = ?, category = ? WHERE id = ?`,
      [title, content, city_id, category, id]
    );

    if (files && files.length > 0) {
      await db.query("DELETE FROM news_images WHERE news_id = ?", [id]);

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

      const imageInserts = imageUrls.map((url) => [id, url]);
      await db.query("INSERT INTO news_images (news_id, image_url) VALUES ?", [
        imageInserts,
      ]);
    }

    res.json({ message: "Notícia atualizada com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};
