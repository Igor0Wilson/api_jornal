import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import regionRoutes from "./routes/regionRoutes";
import cityRoutes from "./routes/cityRoutes";
import newsRoutes from "./routes/newsRoutes";
import userRoutes from "./routes/userRoutes";
import publicidadeRoutes from "./routes/adRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/publicidade", publicidadeRoutes);
app.use("/users", userRoutes);
app.use("/regions", regionRoutes);
app.use("/cities", cityRoutes);
app.use("/news", newsRoutes);

export default app;
