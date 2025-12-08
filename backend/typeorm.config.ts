import { DataSource } from "typeorm";
import { AppDataSource } from "./src/data-source";

export default new DataSource(AppDataSource.options);