"use client";

import { useEffect, useState, FormEvent } from "react";
import {
  api,
  PaymentDTO,
  PaymentFilters,
  PaymentTypeDTO,
  PaymentCreatePayload,
  getReceiptUrl
} from "./lib/api";

type TypeFilterDropdownProps = {
  value: number | null;
  options: PaymentTypeDTO[];
  onChange: (value: number | null) => void;
};

function TypeFilterDropdown({
  value,
  options,
  onChange,
}: TypeFilterDropdownProps) {
  const [open, setOpen] = useState(false);

  const currentLabel =
    value != null
      ? options.find((o) => o.id === value)?.name ?? "Tipo selecionado"
      : "Todos os tipos";

  const handleSelect = (newValue: number | null) => {
    onChange(newValue);
    setOpen(false);
  };

  return (
    <div className="type-dropdown">
      <button
        type="button"
        className="type-dropdown-trigger input"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="type-dropdown-label">{currentLabel}</span>
        <span className="type-dropdown-icon">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="type-dropdown-menu">
          <button
            type="button"
            className={`type-dropdown-item ${
              value == null ? "type-dropdown-item-active" : ""
            }`}
            onClick={() => handleSelect(null)}
          >
            Todos os tipos
          </button>

          <div className="type-dropdown-divider" />

          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`type-dropdown-item ${
                value === opt.id ? "type-dropdown-item-active" : ""
              }`}
              onClick={() => handleSelect(opt.id)}
            >
              {opt.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const [paymentTypes, setPaymentTypes] = useState<PaymentTypeDTO[]>([]);
  const [payments, setPayments] = useState<PaymentDTO[]>([]);

  const [filters, setFilters] = useState<PaymentFilters>({
    paymentTypeId: null,
    startDate: null,
    endDate: null,
  });

  const [isFetchingTypes, setIsFetchingTypes] = useState(false);
  const [isFetchingPayments, setIsFetchingPayments] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal & form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState<PaymentCreatePayload>({
    date: "",
    paymentTypeId: 0,
    description: "",
    amount: 0,
  });

  const [formReceiptFile, setFormReceiptFile] = useState<File | null>(null);

  const [editingPaymentId, setEditingPaymentId] = useState<number | null>(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentDTO | null>(null);
  const [detailsMode, setDetailsMode] = useState<"view" | "delete">("view");
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const totalInPeriod = payments.reduce((sum, p) => {
    const value = typeof p.amount === "string" ? parseFloat(p.amount) : p.amount;
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);

  // limpar msg de erro do form depois de alguns segundos
  useEffect(() => {
    if (!formError) return;
    const timer = setTimeout(() => {
      setFormError(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [formError]);

  // Carregar tipos de pagamento ao montar
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        setIsFetchingTypes(true);
        const types = await api.getPaymentTypes();
        setPaymentTypes(types);
      } catch (error: any) {
        console.error(error);
        setErrorMessage(error.message || "Erro ao carregar tipos de pagamento.");
      } finally {
        setIsFetchingTypes(false);
      }
    };

    fetchTypes();
  }, []);

  // Carregar pagamentos quando filtros mudarem
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsFetchingPayments(true);
        setErrorMessage(null);
        const list = await api.getPayments(filters);
        setPayments(list);
      } catch (error: any) {
        console.error(error);
        setErrorMessage(error.message || "Erro ao carregar pagamentos.");
        setPayments([]);
      } finally {
        setIsFetchingPayments(false);
      }
    };

    fetchPayments();
  }, [filters]);

  const handleFilterChange = (field: keyof PaymentFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value || null,
    }));
  };

  const handlePaymentTypeFilterChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      paymentTypeId: value ? Number(value) : null,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      paymentTypeId: null,
      startDate: null,
      endDate: null,
    });
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });

  const formatDate = (isoDate: string) => {
    try {
      const [year, month, day] = isoDate.split("-");
      return `${day}/${month}/${year}`;
    } catch {
      return isoDate;
    }
  };

  // Modal handlers
  const openCreateModal = () => {
    setFormData({
      date: "",
      paymentTypeId: 0,
      description: "",
      amount: 0,
    });
    setFormReceiptFile(null);
    setEditingPaymentId(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (payment: PaymentDTO) => {
    setFormData({
      // backend deve devolver date como "YYYY-MM-DD" (se vier ISO, você pode cortar o "T")
      date: payment.date.includes("T") ? payment.date.split("T")[0] : payment.date,
      paymentTypeId: payment.paymentTypeId ?? payment.paymentType?.id ?? 0,
      description: payment.description,
      amount: payment.amount,
    });
    setFormReceiptFile(null);
    setEditingPaymentId(payment.id);
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
    setEditingPaymentId(null);
  };

  const openDetailsModal = (payment: PaymentDTO) => {
    setSelectedPayment(payment);
    setDetailsMode("view");
    setIsDetailsModalOpen(true);
  };

  const openDeleteDetailsModal = (payment: PaymentDTO) => {
    setSelectedPayment(payment);
    setDetailsMode("delete");
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedPayment(null);
    setDetailsMode("view");
  };

  const handleFormChange = (
    field: keyof PaymentCreatePayload,
    value: string
  ) => {
    setFormData((prev) => {
      if (field === "paymentTypeId") {
        return { ...prev, paymentTypeId: Number(value) || 0 };
      }
      if (field === "amount") {
        // Permite digitar vazio, converte para 0 depois
        const parsed = value.replace(",", ".");
        return { ...prev, amount: parsed ? Number(parsed) : 0 };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    // Validação simples no front (backend já valida também)
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

      if (editingPaymentId == null) {
        // criação
        savedPayment = await api.createPayment(formData);
      } else {
        // edição
        savedPayment = await api.updatePayment({
          id: editingPaymentId,
          ...formData,
        });
      }

      // Se tiver arquivo de comprovante, faz upload agora
      if (formReceiptFile) {
        try {
          const { receiptPath } = await api.uploadReceipt(
            savedPayment.id,
            formReceiptFile
          );
          // atualiza receiptPath em memória (opcional, já que vamos recarregar a lista)
          savedPayment = { ...savedPayment, receiptPath };
        } catch (uploadError: any) {
          console.error(uploadError);
          // Se quiser, pode não bloquear o fluxo inteiro por falha no upload
          setFormError(
            uploadError?.message ||
              "Pagamento salvo, mas houve erro ao enviar o comprovante."
          );
        }
      }

      // Recarrega a lista com os filtros atuais
      const list = await api.getPayments(filters);
      setPayments(list);

      setIsModalOpen(false);
      setEditingPaymentId(null);
      setFormReceiptFile(null);
    } catch (error: any) {
      console.error(error);
      setFormError(
        error.message ||
          "Erro ao salvar pagamento. Verifique os dados e tente novamente."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePayment = async () => {
    if (!selectedPayment) return;

    try {
      setDeletingPaymentId(selectedPayment.id);
      await api.deletePayment(selectedPayment.id);

      // Recarrega a lista com os filtros atuais
      const list = await api.getPayments(filters);
      setPayments(list);

      closeDetailsModal();
    } catch (error: any) {
      console.error(error);
      setErrorMessage(
        error.message || "Erro ao excluir pagamento. Tente novamente."
      );
    } finally {
      setDeletingPaymentId(null);
    }
  };

  return (
    <div className="page-root">
      {/* Cabeçalho da página */}
      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">Pagamentos</h2>
          <p className="page-subtitle">
            Visualize, filtre e gerencie os pagamentos do cartório.
          </p>
        </div>
        <div className="page-header-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={openCreateModal}
          >
            <span className="btn-primary-icon">＋</span>
            <span>Novo pagamento</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <section className="filters">
        <div className="filter-field">
          <label className="filter-label">Data inicial</label>
          <input
            type="date"
            className="input"
            value={filters.startDate || ""}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
          />
        </div>
        <div className="filter-field">
          <label className="filter-label">Data final</label>
          <input
            type="date"
            className="input"
            value={filters.endDate || ""}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
          />
        </div>
        <div className="filter-field">
          <label className="filter-label">Tipo de pagamento</label>
          <TypeFilterDropdown
              value={filters.paymentTypeId ?? null}
              options={paymentTypes}
              onChange={(val) => {
                setFilters((prev) => ({
                  ...prev,
                  paymentTypeId: val,
                }));
              }}
          />
        </div>
        <div className="filter-field filter-field-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleClearFilters}
          >
            Limpar filtros
          </button>
        </div>
      </section>

      {/* Mensagem de erro geral */}
      {errorMessage && (
        <div className="alert alert-error">
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Resumo do período */}
      <section className="summary-section">
        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-title">Resumo do período</span>
            <span className="summary-subtitle">
              {filters.startDate && filters.endDate
                ? `De ${formatDate(filters.startDate)} até ${formatDate(
                    filters.endDate
                  )}`
                : filters.startDate
                ? `A partir de ${formatDate(filters.startDate)}`
                : filters.endDate
                ? `Até ${formatDate(filters.endDate)}`
                : "Sem filtro de datas aplicado"}
            </span>
          </div>

          <div className="summary-content">
            <div className="summary-item">
              <span className="summary-item-label">Total de pagamentos</span>
              <span className="summary-item-value">
                {payments.length.toString().padStart(2, "0")}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-item-label">Valor total no período</span>
              <span className="summary-item-value summary-item-value-strong">
                {formatCurrency(totalInPeriod)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Tabela de pagamentos */}
      <section className="table-section">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Descrição</th>
                <th className="table-col-right">Valor</th>
                <th className="table-col-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isFetchingPayments ? (
                <tr>
                  <td colSpan={4} className="table-empty">
                    Carregando pagamentos...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="table-empty">
                    Nenhum pagamento encontrado. Ajuste os filtros ou cadastre
                    um novo pagamento.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id}>
                    <td>{formatDate(p.date)}</td>
                    <td>{p.paymentType?.name || "—"}</td>
                    <td>{p.description}</td>
                    <td className="table-col-right">R$ {formatCurrency(Number(p.amount))}</td>
                    <td className="table-col-right">
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn btn-ghost btn-ghost-small"
                          onClick={() => openDetailsModal(p)}
                        >
                          Detalhes
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-ghost-small"
                          onClick={() => openEditModal(p)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-ghost-small"
                          onClick={() => openDeleteDetailsModal(p)}
                          disabled={deletingPaymentId === p.id}
                        >
                          {deletingPaymentId === p.id ? "Excluindo..." : "Excluir"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal de criação de pagamento */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div
            className="modal"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="modal-header">
              <h3 className="modal-title">
                {editingPaymentId == null ? "Novo pagamento" : "Editar pagamento"}
              </h3>
              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
                disabled={isSaving}
              >
                ×
              </button>
            </div>

            <form className="modal-body" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">Data</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.date}
                    onChange={(e) =>
                      handleFormChange("date", e.target.value)
                    }
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Tipo de pagamento</label>
                  <TypeFilterDropdown
                    value={formData.paymentTypeId || null}
                    options={paymentTypes}
                    onChange={(val) => {
                      setFormData((prev) => ({
                        ...prev,
                        paymentTypeId: val || 0,
                      }));
                    }}
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Descrição</label>
                <input
                  type="text"
                  className="input"
                  value={formData.description}
                  onChange={(e) =>
                    handleFormChange("description", e.target.value)
                  }
                  placeholder="Ex.: Pagamento de folha - janeiro/2025"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input"
                  value={formData.amount || ""}
                  onChange={(e) =>
                    handleFormChange("amount", e.target.value)
                  }
                />
              </div>

              <div className="form-field">
                <div className="details-divider" />

                <div className="details-receipt">
                  <div className="details-receipt-header">
                    <span className="details-label">Comprovante (opcional)</span>

                    {/* Para quando estiver editando e já houver comprovante */}
                    {editingPaymentId != null && selectedPayment?.id === editingPaymentId && selectedPayment.receiptPath && (
                      <a
                        href={getReceiptUrl(selectedPayment.receiptPath)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="details-receipt-link"
                      >
                        Ver comprovante atual
                      </a>
                    )}
                  </div>

                  <div className="details-receipt-upload">
                    <small className="form-help">
                      Aceita PDF, PNG ou JPG. Tamanho máximo 5MB.
                    </small>
                    <label className="btn btn-ghost btn-ghost-small btn-attach">
                      Selecionar arquivo
                      <input
                        type="file"
                        accept=".pdf,image/png,image/jpeg"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setFormReceiptFile(file);
                        }}
                      />
                    </label>

                    {formReceiptFile && (
                      <span className="details-receipt-selected">
                        Arquivo selecionado: {formReceiptFile.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {formError && (
                <div className="alert alert-error">
                  <span>{formError}</span>
                </div>
              )}

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={closeModal}
                  disabled={isSaving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Salvando..."
                    : editingPaymentId == null
                    ? "Salvar pagamento"
                    : "Atualizar pagamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de detalhes / confirmação de exclusão */}
      {isDetailsModalOpen && selectedPayment && (
        <div className="modal-backdrop" onClick={closeDetailsModal}>
          <div
            className="modal modal-details"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">
                {detailsMode === "view"
                  ? "Detalhes do pagamento"
                  : "Confirmar exclusão"}
              </h3>
              <button
                type="button"
                className="modal-close"
                onClick={closeDetailsModal}
                disabled={deletingPaymentId === selectedPayment.id}
              >
                ×
              </button>
            </div>

            <div className="modal-body modal-body-details">
              <div className="details-grid">
                <div className="details-group">
                  <span className="details-label">Data</span>
                  <span className="details-value">
                    {formatDate(selectedPayment.date)}
                  </span>
                </div>

                <div className="details-group">
                  <span className="details-label">Tipo de pagamento</span>
                  <span className="details-value">
                    {selectedPayment.paymentType?.name ?? "—"}
                  </span>
                </div>

                <div className="details-group">
                  <span className="details-label">Descrição</span>
                  <span className="details-value">
                    {selectedPayment.description}
                  </span>
                </div>

                <div className="details-group">
                  <span className="details-label">Valor</span>
                  <span className="details-value details-value-strong">
                    {formatCurrency(selectedPayment.amount)}
                  </span>
                </div>

                {selectedPayment.createdAt && (
                  <div className="details-group">
                    <span className="details-label">Criado em</span>
                    <span className="details-value">
                      {new Date(selectedPayment.createdAt).toLocaleString(
                        "pt-BR"
                      )}
                    </span>
                  </div>
                )}

                {selectedPayment.updatedAt && (
                  <div className="details-group">
                    <span className="details-label">Atualizado em</span>
                    <span className="details-value">
                      {new Date(selectedPayment.updatedAt).toLocaleString(
                        "pt-BR"
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Bloco de comprovante */}
              <div className="details-divider" />

              <div className="details-receipt">
                <div className="details-receipt-header">
                  <span className="details-label">Comprovante</span>

                  {selectedPayment.receiptPath ? (
                    <a
                      href={getReceiptUrl(selectedPayment.receiptPath)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="details-receipt-link"
                    >
                      Abrir comprovante
                    </a>
                  ) : (
                    <span className="details-receipt-empty">
                      Nenhum comprovante anexado.
                    </span>
                  )}
                </div>
              </div>

              {detailsMode === "delete" && (
                <div className="details-warning">
                  Esta ação é irreversível. O pagamento será removido
                  permanentemente do sistema.
                </div>
              )}
            </div>

            <div className="modal-footer">
              {detailsMode === "view" ? (
                <>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={closeDetailsModal}
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      // abre modal de edição com esse pagamento
                      openEditModal(selectedPayment);
                      closeDetailsModal();
                    }}
                  >
                    Editar
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={closeDetailsModal}
                    disabled={deletingPaymentId === selectedPayment.id}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDeletePayment}
                    disabled={deletingPaymentId === selectedPayment.id}
                  >
                    {deletingPaymentId === selectedPayment.id
                      ? "Excluindo..."
                      : "Excluir"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}