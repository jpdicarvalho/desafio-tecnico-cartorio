// src/routes/paymentType.routes.ts
import { Router } from "express";
import { celebrate, Segments } from "celebrate";
import { PaymentTypeService } from "../services/paymentType.service";
import { paymentTypeBodySchema } from "../validations/paymentType.validation";

const router = Router();

// GET /payment-types - listar todos
router.get("/", async (_req, res, next) => {
  try {
    const types = await PaymentTypeService.listAll();
    return res.json(types);
  } catch (error) {
    return next(error);
  }
});

// POST /payment-types - criar novo tipo
router.post(
  "/",
  celebrate({
    [Segments.BODY]: paymentTypeBodySchema
  }),
  async (req, res, next) => {
    try {
      const { name } = req.body;

      const paymentType = await PaymentTypeService.create(name);

      return res.status(201).json(paymentType);
    } catch (error) {
      return next(error);
    }
  }
);

export default router;