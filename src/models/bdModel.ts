import { createPool } from "mysql2/promise";

export const db = createPool({
  host: "interchange.proxy.rlwy.net",
  user: "root",
  password: "HTvpKTvVhreWsPWYOTlmqLNoTvbXydZv",
  database: "railway",
  port: 27807,
});
