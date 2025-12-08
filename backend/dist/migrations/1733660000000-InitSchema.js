"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitSchema1733660000000 = void 0;
const typeorm_1 = require("typeorm");
class InitSchema1733660000000 {
    async up(queryRunner) {
        // Tabela payment_types
        await queryRunner.createTable(new typeorm_1.Table({
            name: "payment_types",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "name",
                    type: "varchar",
                    length: "255",
                    isUnique: true,
                    isNullable: false
                },
                {
                    name: "created_at",
                    type: "datetime",
                    default: "CURRENT_TIMESTAMP"
                },
                {
                    name: "updated_at",
                    type: "datetime",
                    default: "CURRENT_TIMESTAMP",
                    onUpdate: "CURRENT_TIMESTAMP"
                }
            ]
        }), true);
        // Tabela payments
        await queryRunner.createTable(new typeorm_1.Table({
            name: "payments",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "date",
                    type: "date",
                    isNullable: false
                },
                {
                    name: "payment_type_id",
                    type: "int",
                    isNullable: false
                },
                {
                    name: "description",
                    type: "varchar",
                    length: "255",
                    isNullable: false
                },
                {
                    name: "amount",
                    type: "decimal",
                    precision: 15,
                    scale: 2,
                    isNullable: false
                },
                {
                    name: "created_at",
                    type: "datetime",
                    default: "CURRENT_TIMESTAMP"
                },
                {
                    name: "updated_at",
                    type: "datetime",
                    default: "CURRENT_TIMESTAMP",
                    onUpdate: "CURRENT_TIMESTAMP"
                }
            ]
        }), true);
        // FK payments.payment_type_id -> payment_types.id
        await queryRunner.createForeignKey("payments", new typeorm_1.TableForeignKey({
            columnNames: ["payment_type_id"],
            referencedTableName: "payment_types",
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT",
            onUpdate: "CASCADE"
        }));
    }
    async down(queryRunner) {
        // Remover FK primeiro
        const table = await queryRunner.getTable("payments");
        const foreignKey = table?.foreignKeys.find((fk) => fk.columnNames.indexOf("payment_type_id") !== -1);
        if (foreignKey) {
            await queryRunner.dropForeignKey("payments", foreignKey);
        }
        await queryRunner.dropTable("payments");
        await queryRunner.dropTable("payment_types");
    }
}
exports.InitSchema1733660000000 = InitSchema1733660000000;
