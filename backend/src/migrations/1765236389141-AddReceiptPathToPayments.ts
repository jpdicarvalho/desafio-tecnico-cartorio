import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddReceiptPathToPayments1733695000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "payments",
      new TableColumn({
        name: "receipt_path",
        type: "varchar",
        length: "255",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("payments", "receipt_path");
  }
}