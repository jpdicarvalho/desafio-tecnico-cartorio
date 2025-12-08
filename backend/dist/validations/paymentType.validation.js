"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentTypeBodySchema = void 0;
// src/validations/paymentType.validation.ts
const celebrate_1 = require("celebrate");
exports.paymentTypeBodySchema = celebrate_1.Joi.object({
    name: celebrate_1.Joi.string().trim().min(2).max(255).required()
});
