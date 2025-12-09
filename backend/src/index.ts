import "reflect-metadata";
import express from "express";
import cors from "cors";
import { errors as celebrateErrors } from "celebrate";
import { AppDataSource } from "./data-source";
import paymentTypeRoutes from "./routes/paymentType.routes";
import paymentRoutes from "./routes/payment.routes";
import path from "path";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: `Servidor rodando na porta ${port}` });
});

// Rotas de tipos de pagamento
app.use("/payment-types", paymentTypeRoutes);
app.use("/payments", paymentRoutes);

const uploadsRoot = path.resolve(__dirname, "..", "uploads");
app.use("/uploads", express.static(uploadsRoot));

// Middleware de erros do celebrate (deve vir DEPOIS das rotas)
app.use(celebrateErrors());

// Fallback de erros
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

async function logTableStatus() {
  const queryRunner = AppDataSource.createQueryRunner();

  // Definição das tabelas e colunas esperadas
  const dbName = process.env.DB_NAME || "cartorio_db";

  const tablesToCheck: {
    name: string;
    expectedColumns?: string[];
  }[] = [
    {
      name: "payment_types",
      expectedColumns: [
        "id",
        "name",
        "created_at",
        "updated_at",
      ],
    },
    {
      name: "payments",
      expectedColumns: [
        "id",
        "date",
        "payment_type_id",
        "description",
        "amount",
        "receipt_path",
        "created_at",
        "updated_at",
      ],
    },
  ];

  try {
    await queryRunner.connect();
    console.log("🔍 Verificando status das tabelas e colunas...\n");

    for (const table of tablesToCheck) {
      const { name: tableName, expectedColumns } = table;

      // 1) Verifica se a tabela existe
      const tableResult = await queryRunner.query(
        `SELECT TABLE_NAME 
           FROM information_schema.TABLES 
          WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = ?`,
        [dbName, tableName]
      );

      if (tableResult.length === 0) {
        console.warn(`⚠️  Tabela '${tableName}' NÃO encontrada no banco.`);
        continue;
      }

      console.log(`✅ Tabela '${tableName}' existe.`);

      // 2) Se não definimos colunas esperadas, segue pra próxima
      if (!expectedColumns || expectedColumns.length === 0) {
        continue;
      }

      // 3) Buscar colunas reais da tabela
      const columnsResult = await queryRunner.query(
        `SELECT COLUMN_NAME 
           FROM information_schema.COLUMNS 
          WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = ?`,
        [dbName, tableName]
      );

      const existingColumns = columnsResult.map(
        (row: any) => row.COLUMN_NAME as string
      );

      // 4) Verificar colunas que deveriam existir e não existem
      const missingColumns = expectedColumns.filter(
        (col: any) => !existingColumns.includes(col)
      );

      // 5) (Opcional) colunas “extras” não previstas
      const extraColumns = existingColumns.filter(
        (col: any) => !expectedColumns.includes(col)
      );

      if (missingColumns.length === 0) {
        console.log(
          `   ✅ Todas as colunas esperadas existem em '${tableName}'.`
        );
      } else {
        console.warn(
          `   ⚠️  Colunas faltando em '${tableName}': ${missingColumns.join(
            ", "
          )}`
        );
      }

      if (extraColumns.length > 0) {
        console.log(
          `   ℹ️  Colunas adicionais encontradas em '${tableName}': ${extraColumns.join(
            ", "
          )}`
        );
      }

      console.log(""); // linha em branco pra separar
    }

    console.log("🔎 Verificação de schema concluída.\n");
  } catch (error) {
    console.error("❌ Erro ao verificar tabelas/colunas:", error);
  } finally {
    await queryRunner.release();
  }
}

async function startServer() {
  const maxRetries = 10;
  const retryDelayMs = 3000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Tentando conectar ao banco (tentativa ${attempt}/${maxRetries})...`);
      await AppDataSource.initialize();
      console.log("📦 Conectado ao banco de dados com TypeORM");

      // Verifica se as tabelas existem
      await logTableStatus();

      app.listen(port, () => {
        console.log(`🚀 Servidor rodando na porta ${port}`);
      });

      return;
    } catch (error) {
      console.error("❌ Erro ao inicializar DataSource", error);

      if (attempt === maxRetries) {
        console.error("❌ Não foi possível conectar ao banco após múltiplas tentativas. Encerrando.");
        process.exit(1);
      }

      console.log(`⏳ Aguardando ${retryDelayMs / 1000}s para tentar novamente...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
}

startServer();