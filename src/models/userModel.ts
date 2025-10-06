import { createPool } from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const db = createPool({
  host: process.env.DB_HOST, // interchange.proxy.rlwy.net
  port: Number(process.env.DB_PORT), // 27807
  user: process.env.DB_USER, // root
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
