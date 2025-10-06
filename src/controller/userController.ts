import { Request, Response } from "express";
import { db } from "../models/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const createUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result]: any = await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );
    res.status(201).json({ message: "Usuário criado", id: result.insertId });
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY") {
      res.status(400).json({ error: "Email já cadastrado" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

const JWT_SECRET = "chavesecreta";

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 1️⃣ Validação básica
  if (!email || !password) {
    return res.status(400).json({ error: "Email e senha são obrigatórios" });
  }

  try {
    // 2️⃣ Buscar usuário pelo e-mail
    const [rows]: any = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // 3️⃣ Comparar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // 4️⃣ Gerar token JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 5️⃣ Retornar sucesso com token
    res.json({ message: "Login realizado com sucesso", token });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, created_at FROM users"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [rows]: any = await db.query(
      "SELECT id, name, email, created_at FROM users WHERE id = ?",
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Usuário não encontrado" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password } = req.body;
  try {
    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    const [result]: any = await db.query(
      "UPDATE users SET name = ?, email = ?, password = IFNULL(?, password) WHERE id = ?",
      [name, email, hashedPassword, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Usuário não encontrado" });

    res.json({ message: "Usuário atualizado" });
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY") {
      res.status(400).json({ error: "Email já cadastrado" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [result]: any = await db.query("DELETE FROM users WHERE id = ?", [
      id,
    ]);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Usuário não encontrado" });
    res.json({ message: "Usuário deletado" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
