"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentTypeService = void 0;
// src/services/paymentType.service.ts
const data_source_1 = require("../data-source");
const PaymentType_1 = require("../entities/PaymentType");
const paymentTypeRepository = data_source_1.AppDataSource.getRepository(PaymentType_1.PaymentType);
class PaymentTypeService {
    static async ensureNameIsUnique(name) {
        const existing = await paymentTypeRepository.findOne({ where: { name } });
        if (existing) {
            const error = new Error("Já existe um tipo de pagamento com esse nome.");
            error.statusCode = 400;
            throw error;
        }
    }
    static async listAll() {
        return paymentTypeRepository.find({
            order: { name: "ASC" }
        });
    }
    static async create(name) {
        await this.ensureNameIsUnique(name);
        const paymentType = paymentTypeRepository.create({ name });
        await paymentTypeRepository.save(paymentType);
        return paymentType;
    }
}
exports.PaymentTypeService = PaymentTypeService;
