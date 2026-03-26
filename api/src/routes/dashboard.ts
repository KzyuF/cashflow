import type { FastifyInstance } from "fastify";
import { prisma } from "../server.js";
import { convert, getRatesDate, hasRates, fetchRates } from "../services/currency.service.js";

export async function dashboardRoutes(app: FastifyInstance) {
  app.get("/", async (request) => {
    const userId = request.userId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [user, accounts, expenses, incomes, subs, debts, people] =
      await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.account.findMany({
          where: { userId, isArchived: false },
        }),
        prisma.expense.findMany({
          where: { userId, date: { gte: startOfMonth, lt: endOfMonth } },
        }),
        prisma.income.findMany({
          where: { userId, date: { gte: startOfMonth, lt: endOfMonth } },
        }),
        prisma.subscription.findMany({
          where: { userId, isActive: true },
        }),
        prisma.debt.findMany({ where: { userId } }),
        prisma.personDebt.findMany({
          where: { userId, isSettled: false },
        }),
      ]);

    const mainCurrency = user?.currency || "EUR";

    // Ensure rates are loaded
    if (!hasRates()) {
      await fetchRates(prisma).catch(() => {});
    }

    // Convert amount to user's main currency
    const toMain = (amount: number, fromCurrency: string) =>
      convert(amount, fromCurrency, mainCurrency);

    // Accounts: convert each to main currency for total
    const totalCapital = accounts.reduce(
      (s, a) => s + toMain(Number(a.balance), a.currency),
      0
    );

    const totalDebtRemaining = debts.reduce(
      (s, d) => s + Number(d.remainingAmount),
      0
    );

    // Expenses: convert each to main currency
    const monthlyExpenses = expenses.reduce(
      (s, e) => s + toMain(Number(e.amount), e.currency),
      0
    );
    const monthlyIncome = incomes.reduce(
      (s, i) => s + toMain(Number(i.amount), i.currency),
      0
    );
    const monthlySubs = subs.reduce(
      (s, sub) => s + toMain(Number(sub.price), sub.currency),
      0
    );
    const monthlyDebtPayments = debts.reduce(
      (s, d) => s + Number(d.monthlyPayment),
      0
    );

    const theyOweMe = people
      .filter((p) => p.direction === "they_owe")
      .reduce((s, p) => s + Number(p.amount), 0);
    const iOweThem = people
      .filter((p) => p.direction === "i_owe")
      .reduce((s, p) => s + Number(p.amount), 0);

    // Upcoming payments (next 14 days)
    const in14Days = new Date(now);
    in14Days.setDate(now.getDate() + 14);

    const upcomingPayments = [
      ...subs
        .filter((s) => new Date(s.nextDate) <= in14Days)
        .map((s) => ({
          type: "subscription" as const,
          name: s.name,
          amount: Number(s.price),
          currency: s.currency,
          date: s.nextDate,
          icon: s.icon,
        })),
      ...debts
        .filter((d) => new Date(d.nextPayment) <= in14Days)
        .map((d) => ({
          type: "debt" as const,
          name: d.name,
          amount: Number(d.monthlyPayment),
          currency: mainCurrency,
          date: d.nextPayment,
        })),
    ].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Upcoming interest
    const upcomingInterest = accounts
      .filter(
        (a) =>
          a.interestAmount &&
          a.nextInterestAt &&
          new Date(a.nextInterestAt) <= in14Days
      )
      .map((a) => ({
        name: a.name,
        amount: Number(a.interestAmount),
        currency: a.currency,
        date: a.nextInterestAt!,
        rate: Number(a.interestRate),
      }));

    return {
      mainCurrency,
      ratesDate: getRatesDate(),
      totalCapital,
      netWorth: totalCapital - totalDebtRemaining,
      totalDebtRemaining,
      monthlyIncome,
      monthlyExpenses,
      monthlySubs,
      monthlyDebtPayments,
      upcomingPayments,
      upcomingInterest,
      peopleBalance: {
        theyOweMe,
        iOweThem,
        net: theyOweMe - iOweThem,
      },
      accounts: accounts.map((a) => ({
        ...a,
        balanceInMain:
          a.currency !== mainCurrency
            ? toMain(Number(a.balance), a.currency)
            : null,
      })),
    };
  });
}
