import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

// Routes
import regionRoutes from "./routes/regionRoutes";
import cityRoutes from "./routes/cityRoutes";
import newsRoutes from "./routes/newsRoutes";
import userRoutes from "./routes/userRoutes";
import publicidadeRoutes from "./routes/adRoutes";

dotenv.config();

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.options("*", (req, res) => {
  res.sendStatus(200);
});

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/publicidade", publicidadeRoutes);
app.use("/regions", regionRoutes);
app.use("/cities", cityRoutes);
app.use("/news", newsRoutes);
app.use("/users", userRoutes);

export const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(
    token,
    process.env.JWT_SECRET || "secret",
    (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    }
  );
};

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;
