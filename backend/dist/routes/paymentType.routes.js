"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/paymentType.routes.ts
const express_1 = require("express");
const celebrate_1 = require("celebrate");
const paymentType_service_1 = require("../services/paymentType.service");
const paymentType_validation_1 = require("../validations/paymentType.validation");
const router = (0, express_1.Router)();
// GET /payment-types - listar todos
router.get("/", async (_req, res, next) => {
    try {
        const types = await paymentType_service_1.PaymentTypeService.listAll();
        return res.json(types);
    }
    catch (error) {
        return next(error);
    }
});
// POST /payment-types - criar novo tipo
router.post("/", (0, celebrate_1.celebrate)({
    [celebrate_1.Segments.BODY]: paymentType_validation_1.paymentTypeBodySchema
}), async (req, res, next) => {
    try {
        const { name } = req.body;
        const paymentType = await paymentType_service_1.PaymentTypeService.create(name);
        return res.status(201).json(paymentType);
    }
    catch (error) {
        return next(error);
    }
});
exports.default = router;
