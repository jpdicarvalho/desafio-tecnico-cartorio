/**
 * src/__tests__/payment.integration.test.ts
 */

import request from "supertest";
import app from "../app";
import path from "path";
import fs from "fs";
import { AppDataSource } from "../data-source";
import { Payment } from "../entities/Payment";
import { PaymentType } from "../entities/PaymentType";

jest.setTimeout(30000); // aumenta timeout caso o DB demore a subir

const uploadedFiles: string[] = []; // para cleanup dos uploads gerados pelos testes

async function initDataSourceWithRetry(maxAttempts = 15, delayMs = 1000) {
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      return;
    } catch (err) {
      attempt++;
      if (attempt >= maxAttempts) throw err;
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
}

beforeAll(async () => {
  // Inicializa com retry (útil quando o MySQL está subindo via Docker)
  await initDataSourceWithRetry();

  const paymentRepo = AppDataSource.getRepository(Payment);
  const paymentTypeRepo = AppDataSource.getRepository(PaymentType);

  // Apaga a tabela filha primeiro usando QueryBuilder (aceita "sem critério")
  await paymentRepo.createQueryBuilder().delete().execute();

  // Depois apaga a tabela pai
  await paymentTypeRepo.createQueryBuilder().delete().execute();

  // Seed mínimo necessário
  await paymentTypeRepo.save(paymentTypeRepo.create({ name: "Teste" }));
});

afterAll(async () => {
  // Remover arquivos de upload criados pelos testes
  for (const rel of uploadedFiles) {
    try {
      const full = path.resolve(process.cwd(), rel);
      if (fs.existsSync(full)) {
        fs.unlinkSync(full);
      }
    } catch (err) {
      // Não falhar o teardown por causa de cleanup
      // eslint-disable-next-line no-console
      console.warn("Erro ao remover arquivo de teste:", err);
    }
  }

  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

/**
 * Helpers
 */
async function createTestPayment(overrides?: Partial<{ date: string; description: string; amount: number }>) {
  const paymentTypeRepo = AppDataSource.getRepository(PaymentType);
  const paymentType = await paymentTypeRepo.findOneByOrFail({ name: "Teste" });

  const payload = {
    date: overrides?.date ?? "2024-12-01",
    paymentTypeId: paymentType.id,
    description: overrides?.description ?? "Pagamento teste",
    amount: overrides?.amount ?? 100.0,
  };

  const res = await request(app).post("/payments").send(payload);
  return { res, payload, paymentType };
}

/**
 * Testes
 */

// Criação básica
describe("POST /payments", () => {
  it("deve criar um pagamento com sucesso", async () => {
    const { res } = await createTestPayment();
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.description).toBe("Pagamento teste");
  });

  it("deve retornar 400 quando payload estiver incompleto", async () => {
    // envio sem amount
    const paymentTypeRepo = AppDataSource.getRepository(PaymentType);
    const paymentType = await paymentTypeRepo.findOneByOrFail({ name: "Teste" });

    const res = await request(app)
      .post("/payments")
      .send({
        date: "2024-12-01",
        paymentTypeId: paymentType.id,
        description: "Pagamento inválido",
        // amount ausente
      });

    expect(res.status).toBe(400);
  });

  it("deve prevenir pagamento duplicado (mesma data, tipo, descrição e valor)", async () => {
    // cria um pagamento
    const create = await createTestPayment({ description: "Duplicado teste", amount: 123.45 });
    expect(create.res.status).toBe(201);

    // tenta criar duplicado
    const duplicate = await request(app).post("/payments").send({
      date: create.payload.date,
      paymentTypeId: create.payload.paymentTypeId,
      description: create.payload.description,
      amount: create.payload.amount,
    });

    expect(duplicate.status).toBeGreaterThanOrEqual(400);
    // idealmente 400 (bad request) — aceitamos >=400 como indicador de falha de validação/duplicidade
  });
});

// Listagem, detalhes, atualização e remoção
describe("GET/PUT/DELETE /payments", () => {
  it("deve listar pagamentos (GET /payments)", async () => {
    // garante pelo menos um pagamento exista
    await createTestPayment({ description: "List test", amount: 10 });

    const res = await request(app).get("/payments");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it("deve retornar detalhes do pagamento por id (GET /payments/:id)", async () => {
    const { res: createRes } = await createTestPayment({ description: "Details test" });
    const id = createRes.body.id;

    const res = await request(app).get(`/payments/${id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", id);
    expect(res.body).toHaveProperty("description", "Details test");
  });

  it("deve atualizar um pagamento (PUT /payments/:id)", async () => {
    const { res: createRes } = await createTestPayment({ description: "To update", amount: 77 });
    const id = createRes.body.id;

    const paymentTypeRepo = AppDataSource.getRepository(PaymentType);
    const paymentType = await paymentTypeRepo.findOneByOrFail({ name: "Teste" });

    const updateRes = await request(app)
      .put(`/payments/${id}`)
      .send({
        date: "2024-12-02",
        paymentTypeId: paymentType.id,
        description: "Updated description",
        amount: 999.99,
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body).toHaveProperty("id", id);
    expect(updateRes.body.description).toBe("Updated description");
    expect(Number(updateRes.body.amount)).toBe(999.99);
  });

  it("deve remover um pagamento (DELETE /payments/:id)", async () => {
    const { res: createRes } = await createTestPayment({ description: "To delete" });
    const id = createRes.body.id;

    const delRes = await request(app).delete(`/payments/${id}`);
    expect(delRes.status).toBe(204);

    const getRes = await request(app).get(`/payments/${id}`);
    expect(getRes.status).toBe(404);
  });
});

// Uploads
describe("POST /payments/:id/receipt", () => {
  it("deve fazer upload do recibo com sucesso", async () => {
    const { res: paymentRes } = await createTestPayment({ description: "Upload success", amount: 50 });
    const paymentId = paymentRes.body.id;

    const receiptPath = path.resolve(__dirname, "fixtures", "sample-receipt.pdf");

    const uploadResponse = await request(app)
      .post(`/payments/${paymentId}/receipt`)
      .attach("receipt", receiptPath);

    expect(uploadResponse.status).toBe(200);
    expect(uploadResponse.body).toHaveProperty("receiptPath");
    expect(typeof uploadResponse.body.receiptPath).toBe("string");

    // registrar para cleanup
    uploadedFiles.push(uploadResponse.body.receiptPath);
  });

  it("deve retornar 400 quando não enviar arquivo no upload", async () => {
    const { res: paymentRes } = await createTestPayment({ description: "Upload no file", amount: 20 });
    const paymentId = paymentRes.body.id;

    const uploadRes = await request(app).post(`/payments/${paymentId}/receipt`);
    expect(uploadRes.status).toBe(400);
  });
});