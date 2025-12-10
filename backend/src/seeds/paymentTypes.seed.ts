// src/seeds/paymentTypes.seed.ts
import { AppDataSource } from "../data-source";
import { PaymentType } from "../entities/PaymentType";

const DEFAULT_PAYMENT_TYPES = [
  "Folha de pagamento",
  "Combustível",
  "Estorno",
  "Manutenção predial",
  "Serviços",
  "Taxas",
  "Multa",
];

export async function seedPaymentTypes(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    console.warn("seedPaymentTypes: AppDataSource não inicializado. Abortando seed.");
    return;
  }

  const repo = AppDataSource.getRepository(PaymentType);

  for (const name of DEFAULT_PAYMENT_TYPES) {
    try {
      const existing = await repo.findOneBy({ name });
      if (!existing) {
        const entity = repo.create({ name });
        await repo.save(entity);
        console.log(`🟢 PaymentType seed criado: "${name}"`);
      } else {
        console.log(`ℹ️  PaymentType já existe: "${name}"`);
      }
    } catch (err) {
      console.error(`❌ Erro ao criar PaymentType "${name}":`, err);
    }
  }
}