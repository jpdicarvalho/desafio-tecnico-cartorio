import { AppDataSource } from "../data-source";
import { Payment } from "../entities/Payment";
import { PaymentType } from "../entities/PaymentType";

const paymentRepository = AppDataSource.getRepository(Payment);
const paymentTypeRepository = AppDataSource.getRepository(PaymentType);

export class PaymentService {
  static async ensurePaymentTypeExists(paymentTypeId: number) {
    const paymentType = await paymentTypeRepository.findOne({
      where: { id: paymentTypeId }
    });

    if (!paymentType) {
      const error: any = new Error("Tipo de pagamento não encontrado.");
      error.statusCode = 400;
      throw error;
    }

    return paymentType;
  }

  static async ensureNotDuplicatePayment(params: {
    date: string;
    paymentTypeId: number;
    description: string;
    amount: number;
    ignoreId?: number;
  }) {
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
      const error: any = new Error(
        "Pagamento duplicado: já existe um pagamento com mesma data, tipo, valor e descrição."
      );
      error.statusCode = 400;
      throw error;
    }
  }
}