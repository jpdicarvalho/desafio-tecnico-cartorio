"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentQueryListSchema = exports.paymentBodySchema = void 0;
const celebrate_1 = require("celebrate");
exports.paymentBodySchema = celebrate_1.Joi.object({
    date: celebrate_1.Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .required()
        .messages({
        "string.pattern.base": "O campo 'date' deve estar no formato YYYY-MM-DD."
    }),
    paymentTypeId: celebrate_1.Joi.number().integer().positive().required(),
    description: celebrate_1.Joi.string().trim().min(2).max(255).required(),
    amount: celebrate_1.Joi.number().precision(2).positive().required()
});
exports.paymentQueryListSchema = celebrate_1.Joi.object({
    paymentTypeId: celebrate_1.Joi.number().integer().positive(),
    startDate: celebrate_1.Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
    endDate: celebrate_1.Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/)
});
