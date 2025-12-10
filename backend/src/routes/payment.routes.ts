import { Router } from "express";
import { celebrate, Joi, Segments } from "celebrate";
import { paymentBodySchema, paymentQueryListSchema } from "../validations/payment.validation";
import { AppDataSource } from "../data-source";
import { Payment } from "../entities/Payment";
import { PaymentService } from "../services/payment.service";
import { upload } from "../config/multer";

const router = Router();

const paymentRepository = AppDataSource.getRepository(Payment);

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

// POST /payments/:id/receipt - upload/atualizar comprovante
router.post(
  "/:id/receipt",
  upload.single("receipt"),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);

      if (!id || Number.isNaN(id) || id <= 0) {
        const error: any = new Error("ID de pagamento inválido.");
        error.statusCode = 400;
        throw error;
      }

      const payment = await paymentRepository.findOne({ where: { id } });

      if (!payment) {
        const error: any = new Error("Pagamento não encontrado.");
        error.statusCode = 404;
        throw error;
      }

      if (!req.file) {
        const error: any = new Error("Nenhum arquivo enviado.");
        error.statusCode = 400;
        throw error;
      }

      // vamos guardar um caminho relativo simples, ex: "receipts/arquivo-123.pdf"
      const relativePath = `receipts/${req.file.filename}`;

      payment.receiptPath = relativePath;
      await paymentRepository.save(payment);

      return res.status(200).json({
        message: "Comprovante anexado com sucesso.",
        receiptPath: relativePath,
      });
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