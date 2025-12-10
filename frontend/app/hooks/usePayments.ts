"use client";

import { useEffect, useState, useCallback } from "react";
import {
  api,
  PaymentDTO,
  PaymentFilters,
  PaymentTypeDTO,
} from "../lib/api";

import { getErrorMessage } from "../lib/errors";

export function usePayments(initialFilters?: Partial<PaymentFilters>) {
  const [paymentTypes, setPaymentTypes] = useState<PaymentTypeDTO[]>([]);
  const [payments, setPayments] = useState<PaymentDTO[]>([]);
  const [filters, setFilters] = useState<PaymentFilters>({
    paymentTypeId: null,
    startDate: null,
    endDate: null,
    ...(initialFilters || {}),
  });
  const [isFetchingTypes, setIsFetchingTypes] = useState(false);
  const [isFetchingPayments, setIsFetchingPayments] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchTypes = useCallback(async () => {
    try {
      setIsFetchingTypes(true);
      const types = await api.getPaymentTypes();
      setPaymentTypes(types);
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage(getErrorMessage(err) || "Erro ao carregar tipos de pagamento.");
    } finally {
      setIsFetchingTypes(false);
    }
  }, []);

  const fetchPayments = useCallback(async () => {
    try {
      setIsFetchingPayments(true);
      setErrorMessage(null);
      const list = await api.getPayments(filters);
      setPayments(list);
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage(getErrorMessage(err) || "Erro ao carregar pagamentos.");
      setPayments([]);
    } finally {
      setIsFetchingPayments(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const clearFilters = () => {
    setFilters({
      paymentTypeId: null,
      startDate: null,
      endDate: null,
    });
  };

  return {
    paymentTypes,
    payments,
    filters,
    setFilters,
    clearFilters,
    isFetchingTypes,
    isFetchingPayments,
    errorMessage,
    setErrorMessage,
    reloadPayments: fetchPayments,
  };
}