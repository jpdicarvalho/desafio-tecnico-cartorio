// src/services/paymentType.service.ts
import { AppDataSource } from "../data-source";
import { PaymentType } from "../entities/PaymentType";

const paymentTypeRepository = AppDataSource.getRepository(PaymentType);

export class PaymentTypeService {
  static async ensureNameIsUnique(name: string) {
    const existing = await paymentTypeRepository.findOne({ where: { name } });

    if (existing) {
      const error: any = new Error("Já existe um tipo de pagamento com esse nome.");
      error.statusCode = 400;
      throw error;
    }
  }

  static async listAll() {
    return paymentTypeRepository.find({
      order: { name: "ASC" }
    });
  }

  static async create(name: string) {
    await this.ensureNameIsUnique(name);

    const paymentType = paymentTypeRepository.create({ name });
    await paymentTypeRepository.save(paymentType);

    return paymentType;
  }
}