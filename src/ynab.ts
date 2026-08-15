import * as ynab from "ynab";
import type {
  Account,
  NewTransaction,
  PlanSummary,
  SaveTransactionsResponse,
} from "ynab";

// constructed lazily so the env file has loaded by the time the token is read
const api = () => new ynab.API(process.env.YNAB_PAT!);

export const sendTransactionsToYnab = (
  transactions: NewTransaction[]
): Promise<SaveTransactionsResponse> =>
  api().transactions.createTransactions(process.env.YNAB_BUDGET_ID!, {
    transactions,
  });

// YNAB calls budgets "plans" nowadays; ids are unchanged
export const getYnabBudgets = async (): Promise<PlanSummary[]> =>
  (await api().plans.getPlans()).data.plans;

export const getYnabAccounts = async (budgetId: string): Promise<Account[]> =>
  (await api().accounts.getAccounts(budgetId)).data.accounts;
