import { Router } from "express";
import { celebrate, Joi, Segments } from "celebrate";
import { paymentBodySchema, paymentQueryListSchema } from "../validations/payment.validation";
import { AppDataSource } from "../data-source";
import { Payment } from "../entities/Payment";
import { PaymentType } from "../entities/PaymentType";
import { PaymentService } from "../services/payment.service";

const router = Router();

const paymentRepository = AppDataSource.getRepository(Payment);
const paymentTypeRepository = AppDataSource.getRepository(PaymentType);

// --------- Helpers ---------
async function ensurePaymentTypeExists(paymentTypeId: number) {
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

async function ensureNotDuplicatePayment(params: {
  date: string;
  paymentTypeId: number;
  description: string;
  amount: number;
  ignoreId?: number; // para PUT
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

// --------- Rotas ---------

// POST /payments - criar pagamento
router.post(
  "/",
  celebrate({
    [Segments.BODY]: paymentBodySchema
  }),
  async (req, res, next) => {
    try {
      let { date, paymentTypeId, description, amount } = req.body;

      // Normalizar para apenas "YYYY-MM-DD" se vier em formato ISO completo
      if (date.includes("T")) {
        date = date.split("T")[0];
      }

      await PaymentService.ensurePaymentTypeExists(paymentTypeId);
      await PaymentService.ensureNotDuplicatePayment({ date, paymentTypeId, description, amount });

      const payment = paymentRepository.create({
        date,
        paymentTypeId,
        description,
        amount
      });

      await paymentRepository.save(payment);

      const paymentWithType = await paymentRepository.findOne({
        where: { id: payment.id },
        relations: ["paymentType"]
      });

      return res.status(201).json(paymentWithType ?? payment);
    } catch (error) {
      return next(error);
    }
  }
);

// GET /payments - listar com filtros
router.get(
  "/",
  celebrate({
    [Segments.QUERY]: paymentQueryListSchema
  }),
  async (req, res, next) => {
    try {
      const { paymentTypeId, startDate, endDate } = req.query as {
        paymentTypeId?: string;
        startDate?: string;
        endDate?: string;
      };

      const qb = paymentRepository
        .createQueryBuilder("payment")
        .leftJoinAndSelect("payment.paymentType", "paymentType")
        .orderBy("payment.date", "DESC")
        .addOrderBy("payment.id", "DESC");

      if (paymentTypeId) {
        qb.andWhere("payment.paymentTypeId = :paymentTypeId", {
          paymentTypeId: Number(paymentTypeId)
        });
      }

      if (startDate) {
        qb.andWhere("payment.date >= :startDate", { startDate });
      }

      if (endDate) {
        qb.andWhere("payment.date <= :endDate", { endDate });
      }

      const payments = await qb.getMany();
      return res.json(payments);
    } catch (error) {
      return next(error);
    }
  }
);

// GET /payments/:id - detalhes
router.get(
  "/:id",
  celebrate({
    [Segments.PARAMS]: Joi.object({
      id: Joi.number().integer().positive().required()
    })
  }),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);

      const payment = await paymentRepository.findOne({
        where: { id },
        relations: ["paymentType"]
      });

      if (!payment) {
        return res.status(404).json({
          message: "Pagamento não encontrado."
        });
      }

      return res.json(payment);
    } catch (error) {
      return next(error);
    }
  }
);

// PUT /payments/:id - atualizar
router.put(
  "/:id",
  celebrate({
    [Segments.PARAMS]: Joi.object({
      id: Joi.number().integer().positive().required()
    }),
    [Segments.BODY]: paymentBodySchema
  }),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      let { date, paymentTypeId, description, amount } = req.body;

      if (date.includes("T")) {
        date = date.split("T")[0];
      }

      const payment = await paymentRepository.findOne({ where: { id } });
      if (!payment) {
        return res.status(404).json({
          message: "Pagamento não encontrado."
        });
      }

      await PaymentService.ensurePaymentTypeExists(paymentTypeId);
      await PaymentService.ensureNotDuplicatePayment({
        date,
        paymentTypeId,
        description,
        amount,
        ignoreId: id
      });

      payment.date = date;
      payment.paymentTypeId = paymentTypeId;
      payment.description = description;
      payment.amount = amount;

      await paymentRepository.save(payment);

      const updated = await paymentRepository.findOne({
        where: { id },
        relations: ["paymentType"]
      });

      return res.json(updated ?? payment);
    } catch (error) {
      return next(error);
    }
  }
);

// DELETE /payments/:id - remover
router.delete(
  "/:id",
  celebrate({
    [Segments.PARAMS]: Joi.object({
      id: Joi.number().integer().positive().required()
    })
  }),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);

      const payment = await paymentRepository.findOne({ where: { id } });
      if (!payment) {
        return res.status(404).json({
          message: "Pagamento não encontrado."
        });
      }

      await paymentRepository.remove(payment);

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }
);

export default router;