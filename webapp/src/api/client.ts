const API_BASE = "/api";

function getInitData(): string {
  try {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initData) return tg.initData;
  } catch {
    // ignore
  }
  // Fallback for development
  return "dev:12345";
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `tma ${getInitData()}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Dashboard
  getDashboard: () => request<any>("/dashboard"),

  // Accounts
  getAccounts: () => request<any[]>("/accounts"),
  createAccount: (data: any) =>
    request<any>("/accounts", { method: "POST", body: JSON.stringify(data) }),
  updateAccount: (id: number, data: any) =>
    request<any>(`/accounts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteAccount: (id: number) =>
    request<any>(`/accounts/${id}`, { method: "DELETE" }),

  // Expenses
  getExpenses: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<any[]>(`/expenses${qs}`);
  },
  createExpense: (data: any) =>
    request<any>("/expenses", { method: "POST", body: JSON.stringify(data) }),
  deleteExpense: (id: number) =>
    request<any>(`/expenses/${id}`, { method: "DELETE" }),
  getExpenseStats: (month?: string) =>
    request<any>(`/expenses/stats${month ? `?month=${month}` : ""}`),
  getWeeklyExpenses: () => request<any[]>("/expenses/weekly"),

  // Income
  getIncome: () => request<any[]>("/income"),
  createIncome: (data: any) =>
    request<any>("/income", { method: "POST", body: JSON.stringify(data) }),
  deleteIncome: (id: number) =>
    request<any>(`/income/${id}`, { method: "DELETE" }),

  // Subscriptions
  getSubscriptions: () => request<any[]>("/subscriptions"),
  createSubscription: (data: any) =>
    request<any>("/subscriptions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateSubscription: (id: number, data: any) =>
    request<any>(`/subscriptions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteSubscription: (id: number) =>
    request<any>(`/subscriptions/${id}`, { method: "DELETE" }),

  // Debts
  getDebts: () => request<any[]>("/debts"),
  createDebt: (data: any) =>
    request<any>("/debts", { method: "POST", body: JSON.stringify(data) }),
  updateDebt: (id: number, data: any) =>
    request<any>(`/debts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteDebt: (id: number) =>
    request<any>(`/debts/${id}`, { method: "DELETE" }),

  // People
  getPeople: (filter?: string) =>
    request<any[]>(`/people${filter ? `?filter=${filter}` : ""}`),
  createPerson: (data: any) =>
    request<any>("/people", { method: "POST", body: JSON.stringify(data) }),
  settlePerson: (id: number) =>
    request<any>(`/people/${id}/settle`, { method: "PATCH" }),
  deletePerson: (id: number) =>
    request<any>(`/people/${id}`, { method: "DELETE" }),
};
