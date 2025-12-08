"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const data_source_1 = require("../data-source");
const Payment_1 = require("../entities/Payment");
const PaymentType_1 = require("../entities/PaymentType");
const paymentRepository = data_source_1.AppDataSource.getRepository(Payment_1.Payment);
const paymentTypeRepository = data_source_1.AppDataSource.getRepository(PaymentType_1.PaymentType);
class PaymentService {
    static async ensurePaymentTypeExists(paymentTypeId) {
        const paymentType = await paymentTypeRepository.findOne({
            where: { id: paymentTypeId }
        });
        if (!paymentType) {
            const error = new Error("Tipo de pagamento não encontrado.");
            error.statusCode = 400;
            throw error;
        }
        return paymentType;
    }
    static async ensureNotDuplicatePayment(params) {
        const { date, paymentTypeId, description, amount, ignoreId } = params;
        const qb = paymentRepository
            .createQueryBuilder("payment")
            .where("payment.date = :date", { date })
            .andWhere("payment.paymentTypeId = :paymentTypeId", { paymentTypeId })
            .andWhere("payment.description = :description", { description })
            .andWhere("payment.amount = :amount", { amount });
        if (ignoreId) {
            qb.andWhere("payment.id != :ignoreId", { ignoreId });
        }
        const existing = await qb.getOne();
        if (existing) {
            const error = new Error("Pagamento duplicado: já existe um pagamento com mesma data, tipo, valor e descrição.");
            error.statusCode = 400;
            throw error;
        }
    }
}
exports.PaymentService = PaymentService;
