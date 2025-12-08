import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { PaymentType } from "./PaymentType";

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "date" })
  date!: string; // podemos trocar para Date depois, se preferir

  @Column({ name: "payment_type_id" })
  paymentTypeId!: number;

  @ManyToOne(() => PaymentType, (paymentType) => paymentType.payments, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE"
  })
  @JoinColumn({ name: "payment_type_id" })
  paymentType!: PaymentType;

  @Column({ type: "varchar", length: 255 })
  description!: string;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  amount!: number;

  @Column({ name: "receipt_path", type: "varchar", length: 255, nullable: true })
  receiptPath?: string | null;

  // futuro: campo opcional para comprovante
  // @Column({ name: "receipt_path", type: "varchar", length: 500, nullable: true })
  // receiptPath?: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}