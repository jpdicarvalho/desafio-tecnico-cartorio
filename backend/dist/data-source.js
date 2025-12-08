"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const Payment_1 = require("./entities/Payment");
const PaymentType_1 = require("./entities/PaymentType");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    username: process.env.DB_USER || "user",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "cartorio_db",
    synchronize: false,
    logging: false,
    entities: [PaymentType_1.PaymentType, Payment_1.Payment],
    migrations: ["dist/migrations/*.js"]
});
