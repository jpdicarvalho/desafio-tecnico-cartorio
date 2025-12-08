import "reflect-metadata";
import { DataSource } from "typeorm";
import { Payment } from "./entities/Payment";
import { PaymentType } from "./entities/PaymentType";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USER || "user",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "cartorio_db",
  synchronize: false,
  logging: false,
  entities: [PaymentType, Payment],
  migrations: ["dist/migrations/*.js"]
});