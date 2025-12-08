import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: `Servidor rodando na porta ${port}` });
});

async function logTableStatus() {
  const queryRunner = AppDataSource.createQueryRunner();
  try {
    await queryRunner.connect();

    const tablesToCheck = ["payment_types", "payments"];

    for (const tableName of tablesToCheck) {
      const result = await queryRunner.query(
        `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
        [process.env.DB_NAME || "cartorio_db", tableName]
      );

      if (result.length > 0) {
        console.log(`✅ Tabela '${tableName}' existente no banco.`);
      } else {
        console.warn(`⚠️ Tabela '${tableName}' NÃO encontrada no banco.`);
      }
    }
  } catch (error) {
    console.error("❌ Erro ao verificar tabelas:", error);
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