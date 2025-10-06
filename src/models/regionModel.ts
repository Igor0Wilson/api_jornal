import { createPool } from "mysql2/promise";

export const db = createPool({
  host: "interchange.proxy.rlwy.net", // host privado do banco na Railway
  user: "root", // usuário do banco
  password: "HTvpKTvVhreWsPWYOTlmqLNoTvbXydZv", // senha do banco
  database: "railway", // nome do banco
  port: 27807, // porta do banco
});
