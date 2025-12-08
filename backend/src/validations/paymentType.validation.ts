// src/validations/paymentType.validation.ts
import { Joi } from "celebrate";

export const paymentTypeBodySchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).required()
});