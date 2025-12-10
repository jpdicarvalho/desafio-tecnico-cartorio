"use client";

import { useState } from "react";
import { usePayments } from "./hooks/usePayments";
import TypeFilterDropdown from "./components/TypeFilterDropdown";
import PaymentList from "./components/PaymentList";
import PaymentForm from "./components/PaymentForm";
import PaymentDetails from "./components/PaymentDetails";
import { PaymentDTO } from "./lib/api";

export default function HomePage() {
  const {
    paymentTypes,
    payments,
    filters,
    setFilters,
    clearFilters,
    isFetchingPayments,
    errorMessage,
    reloadPayments,
  } = usePayments();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentDTO | null>(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsPayment, setDetailsPayment] = useState<PaymentDTO | null>(null);
  const [detailsMode, setDetailsMode] = useState<"view" | "delete">("view");

  const totalInPeriod = payments.reduce((sum, p) => {
    const value = typeof p.amount === "string" ? parseFloat(p.amount) : p.amount;
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);

  const openCreate = () => {
    setEditingPayment(null);
    setIsFormOpen(true);
  };

  const openEdit = (p: PaymentDTO) => {
    setEditingPayment(p);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPayment(null);
  };

  const handleSaved = async () => {
    await reloadPayments();
  };

  const openDetails = (p: PaymentDTO) => {
    setDetailsPayment(p);
    setDetailsMode("view");
    setIsDetailsOpen(true);
  };

  const openDeleteDetails = (p: PaymentDTO) => {
    setDetailsPayment(p);
    setDetailsMode("delete");
    setIsDetailsOpen(true);
  };

  const closeDetails = () => {
    setIsDetailsOpen(false);
    setDetailsPayment(null);
    setDetailsMode("view");
  };

  const handleDeleted = async () => {
    await reloadPayments();
  };

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value || null }));
  };

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
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            <span className="btn-primary-icon">＋</span>
            <span>Novo pagamento</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <section className="filters">
        <div className="filter-field">
          <label className="filter-label">Data inicial</label>
          <input type="date" className="input" value={filters.startDate || ""} onChange={(e) => handleFilterChange("startDate", e.target.value)} />
        </div>
        <div className="filter-field">
          <label className="filter-label">Data final</label>
          <input type="date" className="input" value={filters.endDate || ""} onChange={(e) => handleFilterChange("endDate", e.target.value)} />
        </div>
        <div className="filter-field">
          <label className="filter-label">Tipo de pagamento</label>
          <TypeFilterDropdown value={filters.paymentTypeId ?? null} options={paymentTypes} onChange={(val) => setFilters((prev) => ({ ...prev, paymentTypeId: val }))} />
        </div>

        <div className="filter-field filter-field-actions">
          <button type="button" className="btn btn-ghost" onClick={() => clearFilters()}>
            Limpar filtros
          </button>
        </div>
      </section>

      {/* Mensagem de erro geral */}
      {errorMessage && <div className="alert alert-error"><span>{errorMessage}</span></div>}

      {/* Resumo do período */}
      <section className="summary-section">
        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-title">Resumo do período</span>
            <span className="summary-subtitle">
              {filters.startDate && filters.endDate
                ? `De ${formatDate(filters.startDate)} até ${formatDate(filters.endDate)}`
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
              <span className="summary-item-value">{payments.length.toString().padStart(2, "0")}</span>
            </div>
            <div className="summary-item">
              <span className="summary-item-label">Valor total no período</span>
              <span className="summary-item-value summary-item-value-strong">{formatCurrency(totalInPeriod)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Lista */}
      <PaymentList payments={payments} isFetching={isFetchingPayments} onOpenDetails={openDetails} onEdit={openEdit} onRequestDelete={openDeleteDetails} />

      {/* Form modal */}
      <PaymentForm isOpen={isFormOpen} onClose={closeForm} onSaved={handleSaved} paymentTypes={paymentTypes} editingPayment={editingPayment} />

      {/* Details modal */}
      <PaymentDetails isOpen={isDetailsOpen} payment={detailsPayment} mode={detailsMode} onClose={closeDetails} onEditRequested={openEdit} onDeleted={handleDeleted} />
    </div>
  );
}