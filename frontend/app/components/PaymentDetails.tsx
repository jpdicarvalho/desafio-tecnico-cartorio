"use client";

import { useState } from "react";
import { PaymentDTO, getReceiptUrl, api } from "../lib/api";
import { getErrorMessage } from "../lib/errors";


type Props = {
  isOpen: boolean;
  payment: PaymentDTO | null;
  mode: "view" | "delete";
  onClose: () => void;
  onEditRequested: (p: PaymentDTO) => void;
  onDeleted: () => void; // sinaliza ao pai para recarregar
};

export default function PaymentDetails({
  isOpen,
  payment,
  mode,
  onClose,
  onEditRequested,
  onDeleted,
}: Props) {
  const [deleting, setDeleting] = useState(false);
  if (!isOpen || !payment) return null;

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatDate = (isoDate: string) => {
    try {
      const [year, month, day] = isoDate.split("-");
      return `${day}/${month}/${year}`;
    } catch {
      return isoDate;
    }
  };

  const handleDelete = async () => {
    if (!payment) return;
    try {
      setDeleting(true);
      await api.deletePayment(payment.id);
      onDeleted();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      alert(getErrorMessage(err) || "Erro ao excluir pagamento.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-details" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{mode === "view" ? "Detalhes do pagamento" : "Confirmar exclusão"}</h3>
          <button type="button" className="modal-close" onClick={onClose} disabled={deleting}>×</button>
        </div>

        <div className="modal-body modal-body-details">
          <div className="details-grid">
            <div className="details-group"><span className="details-label">Data</span><span className="details-value">{formatDate(payment.date)}</span></div>
            <div className="details-group"><span className="details-label">Tipo de pagamento</span><span className="details-value">{payment.paymentType?.name ?? "—"}</span></div>
            <div className="details-group"><span className="details-label">Descrição</span><span className="details-value">{payment.description}</span></div>
            <div className="details-group"><span className="details-label">Valor</span><span className="details-value details-value-strong">{formatCurrency(payment.amount)}</span></div>

            {payment.createdAt && <div className="details-group"><span className="details-label">Criado em</span><span className="details-value">{new Date(payment.createdAt).toLocaleString("pt-BR")}</span></div>}
            {payment.updatedAt && <div className="details-group"><span className="details-label">Atualizado em</span><span className="details-value">{new Date(payment.updatedAt).toLocaleString("pt-BR")}</span></div>}
          </div>

          <div className="details-divider" />

          <div className="details-receipt">
            <div className="details-receipt-header">
              <span className="details-label">Comprovante</span>
              {payment.receiptPath ? (
                <a href={getReceiptUrl(payment.receiptPath)} target="_blank" rel="noopener noreferrer" className="details-receipt-link">Abrir comprovante</a>
              ) : (
                <span className="details-receipt-empty">Nenhum comprovante anexado.</span>
              )}
            </div>
          </div>

          {mode === "delete" && <div className="details-warning">Esta ação é irreversível. O pagamento será removido permanentemente do sistema.</div>}
        </div>

        <div className="modal-footer">
          {mode === "view" ? (
            <>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Fechar</button>
              <button type="button" className="btn btn-primary" onClick={() => { onEditRequested(payment); onClose(); }}>Editar</button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-ghost" onClick={onClose} disabled={deleting}>Cancelar</button>
              <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>{deleting ? "Excluindo..." : "Excluir"}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}