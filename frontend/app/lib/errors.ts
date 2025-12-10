export function getErrorMessage(error: unknown): string {
  if (!error) return "Erro desconhecido";
  if (error instanceof Error) return error.message;
  try {
    return String(error);
  } catch {
    return "Erro não serializável";
  }
}