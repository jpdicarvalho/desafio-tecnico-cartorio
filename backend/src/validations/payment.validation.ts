import { Joi } from "celebrate";

export const paymentBodySchema = Joi.object({
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base": "O campo 'date' deve estar no formato YYYY-MM-DD."
    }),
  paymentTypeId: Joi.number().integer().positive().required(),
  description: Joi.string().trim().min(2).max(255).required(),
  amount: Joi.number().precision(2).positive().required()
});

export const paymentQueryListSchema = Joi.object({
  paymentTypeId: Joi.number().integer().positive(),
  startDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
  endDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/)
});