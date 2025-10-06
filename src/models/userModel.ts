import { createPool } from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const db = createPool({
  host: process.env.DB_HOST, // api_jornal.railway.internal
  user: process.env.DB_USER, // root
  password: process.env.DB_PASSWORD, // senha
  database: process.env.DB_NAME, // railway
  port: Number(process.env.DB_PORT), // 3306
});
