// src/app.ts
import express from "express";
import cors from "cors";
import { errors as celebrateErrors } from "celebrate";
import paymentTypeRoutes from "./routes/paymentType.routes";
import paymentRoutes from "./routes/payment.routes";
import path from "path";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Servidor rodando" });
});

// Rotas de tipos de pagamento
app.use("/payment-types", paymentTypeRoutes);
app.use("/payments", paymentRoutes);

// Serve uploads (mesma lógica que você já tinha)
const uploadsRoot = path.resolve(__dirname, "..", "uploads");
app.use("/uploads", express.static(uploadsRoot));

// Middleware de erros do celebrate (deve vir DEPOIS das rotas)
app.use(celebrateErrors());

// Fallback de erros (mantém exatamente sua lógica)
app.use(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);

    const status =
      err?.statusCode && Number(err.statusCode) >= 400
        ? Number(err.statusCode)
        : 500;

    const message =
      status === 500
        ? "Erro interno do servidor."
        : err?.message || "Erro na requisição.";

    return res.status(status).json({ message });
  }
);

export default app;