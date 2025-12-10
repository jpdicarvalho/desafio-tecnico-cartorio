"use client";

import { useEffect, useState, FormEvent } from "react";
import {
  api,
  PaymentDTO,
  PaymentTypeDTO,
  PaymentCreatePayload,
  getReceiptUrl,
} from "../lib/api";
import TypeFilterDropdown from "./TypeFilterDropdown";
import { getErrorMessage } from "../lib/errors";


type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void; // sinaliza ao pai para recarregar lista
  paymentTypes: PaymentTypeDTO[];
  editingPayment?: PaymentDTO | null;
};

export default function PaymentForm({
  isOpen,
  onClose,
  onSaved,
  paymentTypes,
  editingPayment = null,
}: Props) {
  const [formData, setFormData] = useState<PaymentCreatePayload>({
    date: "",
    paymentTypeId: 0,
    description: "",
    amount: 0,
  });
  const [formReceiptFile, setFormReceiptFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!editingPayment) {
      setFormData({
        date: "",
        paymentTypeId: 0,
        description: "",
        amount: 0,
      });
      setFormReceiptFile(null);
      setFormError(null);
      return;
    }

    setFormData({
      date: editingPayment.date.includes("T") ? editingPayment.date.split("T")[0] : editingPayment.date,
      paymentTypeId: editingPayment.paymentTypeId ?? editingPayment.paymentType?.id ?? 0,
      description: editingPayment.description,
      amount: editingPayment.amount,
    });
    setFormReceiptFile(null);
    setFormError(null);
  }, [editingPayment, isOpen]);

  useEffect(() => {
    if (!formError) return;
    const t = setTimeout(() => setFormError(null), 5000);
    return () => clearTimeout(t);
  }, [formError]);

  const handleFormChange = (field: keyof PaymentCreatePayload, value: string) => {
    setFormData((prev) => {
      if (field === "paymentTypeId") {
        return { ...prev, paymentTypeId: Number(value) || 0 };
      }
      if (field === "amount") {
        const parsed = value.replace(",", ".");
        return { ...prev, amount: parsed ? Number(parsed) : 0 };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.date) {
      setFormError("Informe a data do pagamento.");
      return;
    }
    if (!formData.paymentTypeId || formData.paymentTypeId <= 0) {
      setFormError("Selecione um tipo de pagamento.");
      return;
    }
    if (!formData.description.trim()) {
      setFormError("Informe uma descrição.");
      return;
    }
    if (!formData.amount || formData.amount <= 0) {
      setFormError("Informe um valor maior que zero.");
      return;
    }

    try {
      setIsSaving(true);

      let savedPayment: PaymentDTO;
      if (!editingPayment) {
        savedPayment = await api.createPayment(formData);
      } else {
        savedPayment = await api.updatePayment({
          id: editingPayment.id,
          ...formData,
        });
      }

      if (formReceiptFile) {
        try {
          const { receiptPath } = await api.uploadReceipt(savedPayment.id, formReceiptFile);
          // optional: you can use receiptPath if needed
          savedPayment = { ...savedPayment, receiptPath };
        } catch (upErr: unknown) {
          console.error(upErr);
          setFormError(getErrorMessage(upErr) || "Pagamento salvo, mas houve erro ao enviar o comprovante.");
        }
      }

      onSaved();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setFormError(getErrorMessage(err) || "Erro ao salvar pagamento.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={() => (!isSaving ? onClose() : undefined)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{editingPayment ? "Editar pagamento" : "Novo pagamento"}</h3>
          <button type="button" className="modal-close" onClick={() => !isSaving && onClose()} disabled={isSaving}>
            ×
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">Data</label>
              <input type="date" className="input" value={formData.date} onChange={(e) => handleFormChange("date", e.target.value)} />
            </div>

            <div className="form-field">
              <label className="form-label">Tipo de pagamento</label>
              <TypeFilterDropdown
                value={formData.paymentTypeId || null}
                options={paymentTypes}
                onChange={(val) => setFormData((prev) => ({ ...prev, paymentTypeId: val || 0 }))}
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Descrição</label>
            <input type="text" className="input" value={formData.description} onChange={(e) => handleFormChange("description", e.target.value)} placeholder="Ex.: Pagamento de folha - janeiro/2025" />
          </div>

          <div className="form-field">
            <label className="form-label">Valor (R$)</label>
            <input type="number" step="0.01" min="0" className="input" value={formData.amount || ""} onChange={(e) => handleFormChange("amount", e.target.value)} />
          </div>

          <div className="form-field">
            <div className="details-divider" />

            <div className="details-receipt">
              <div className="details-receipt-header">
                <span className="details-label">Comprovante (opcional)</span>

                {editingPayment && editingPayment.receiptPath && (
                  <a href={getReceiptUrl(editingPayment.receiptPath)} target="_blank" rel="noopener noreferrer" className="details-receipt-link">
                    Ver comprovante atual
                  </a>
                )}
              </div>

              <div className="details-receipt-upload">
                <small className="form-help">Aceita PDF, PNG ou JPG. Tamanho máximo 5MB.</small>

                <label className="btn btn-ghost btn-ghost-small btn-attach">
                  Selecionar arquivo
                  <input
                    type="file"
                    accept=".pdf,image/png,image/jpeg"
                    style={{ display: "none" }}
                    onChange={(e) => setFormReceiptFile(e.target.files?.[0] || null)}
                  />
                </label>

                {formReceiptFile && <span className="details-receipt-selected">Arquivo selecionado: {formReceiptFile.name}</span>}
              </div>
            </div>
          </div>

          {formError && (
            <div className="alert alert-error">
              <span>{formError}</span>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={() => !isSaving && onClose()} disabled={isSaving}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? "Salvando..." : editingPayment ? "Atualizar pagamento" : "Salvar pagamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}