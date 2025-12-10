"use client";

import { PaymentDTO } from "../lib/api";

type Props = {
  payments: PaymentDTO[];
  isFetching: boolean;
  onOpenDetails: (payment: PaymentDTO) => void;
  onEdit: (payment: PaymentDTO) => void;
  onRequestDelete: (payment: PaymentDTO) => void;
};

export default function PaymentList({
  payments,
  isFetching,
  onOpenDetails,
  onEdit,
  onRequestDelete,
}: Props) {
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

  return (
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
            {isFetching ? (
              <tr>
                <td colSpan={5} className="table-empty">
                  Carregando pagamentos...
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={5} className="table-empty">
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
                  <td className="table-col-right">{formatCurrency(Number(p.amount))}</td>
                  <td className="table-col-right">
                    <div className="table-actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-ghost-small"
                        onClick={() => onOpenDetails(p)}
                      >
                        Detalhes
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-ghost-small"
                        onClick={() => onEdit(p)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-ghost-small"
                        onClick={() => onRequestDelete(p)}
                      >
                        Excluir
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
  );
}