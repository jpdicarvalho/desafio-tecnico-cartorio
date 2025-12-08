// app/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export type PaymentTypeDTO = {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PaymentDTO = {
  id: number;
  date: string; // "YYYY-MM-DD"
  paymentTypeId: number;
  description: string;
  amount: number;
  createdAt?: string;
  updatedAt?: string;
  paymentType?: PaymentTypeDTO;
};

export type PaymentFilters = {
  paymentTypeId?: number | null;
  startDate?: string | null; // "YYYY-MM-DD"
  endDate?: string | null;   // "YYYY-MM-DD"
};

export type PaymentCreatePayload = {
  date: string;          // "YYYY-MM-DD"
  paymentTypeId: number;
  description: string;
  amount: number;
};

export type PaymentUpdatePayload = {
  id: number;
  date: string;          // "YYYY-MM-DD"
  paymentTypeId: number;
  description: string;
  amount: number;
};

function buildQueryString(filters: PaymentFilters): string {
  const params = new URLSearchParams();

  if (filters.paymentTypeId) {
    params.set("paymentTypeId", String(filters.paymentTypeId));
  }
  if (filters.startDate) {
    params.set("startDate", filters.startDate);
  }
  if (filters.endDate) {
    params.set("endDate", filters.endDate);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Erro na requisição (${res.status})`;
    try {
      const data = await res.json();
      if (data?.message) {
        message = data.message;
      }
    } catch {
      // ignora parse de JSON
    }
    throw new Error(message);
  }
  return res.json();
}

export const api = {
  async getPaymentTypes(): Promise<PaymentTypeDTO[]> {
    const res = await fetch(`${API_BASE_URL}/payment-types`, {
      cache: "no-store",
    });
    return handleResponse<PaymentTypeDTO[]>(res);
  },

  async getPayments(filters: PaymentFilters = {}): Promise<PaymentDTO[]> {
    const qs = buildQueryString(filters);
    const res = await fetch(`${API_BASE_URL}/payments${qs}`, {
      cache: "no-store",
    });
    return handleResponse<PaymentDTO[]>(res);
  },

  async createPayment(payload: PaymentCreatePayload): Promise<PaymentDTO> {
    const res = await fetch(`${API_BASE_URL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<PaymentDTO>(res);
  },

  async updatePayment(payload: PaymentUpdatePayload): Promise<PaymentDTO> {
    const { id, ...rest } = payload;
    const res = await fetch(`${API_BASE_URL}/payments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rest),
    });
    return handleResponse<PaymentDTO>(res);
  },

  async deletePayment(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/payments/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      await handleResponse(res); // vai lançar erro com message
    }
  },
  // depois adicionaremos create/update/delete aqui
};