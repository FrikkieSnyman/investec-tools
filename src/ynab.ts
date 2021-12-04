import fetch from "node-fetch";
import { YNABTransaction } from "./model";
const getBasicHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.YNAB_PAT}`,
});
export const sendTransactionsToYnab = async (
  transactions: YNABTransaction[]
) => {
  const ynabResponse = await (
    await fetch(
      `https://api.youneedabudget.com/v1/budgets/${process.env.YNAB_BUDGET_ID}/transactions`,
      {
        method: "POST",
        headers: { ...getBasicHeaders() },
        body: JSON.stringify({ transactions }),
      }
    )
  ).json();

  return ynabResponse;
};

type YnabBudgetsResponse = {
  data: { budgets: Array<{ id: string }> };
};
export const getYnabBudgets = async (): Promise<YnabBudgetsResponse> => {
  const ynabResponse = await (
    await fetch(`https://api.youneedabudget.com/v1/budgets`, {
      method: "GET",
      headers: {
        ...getBasicHeaders(),
      },
    })
  ).json();

  return ynabResponse as YnabBudgetsResponse;
};
type YnabAccountsResponse = {
  data: {
    accounts: Array<{ id: string; name: string; transfer_payee_id: string }>;
  };
};
export const getYnabAccounts = async (
  budgetId: string
): Promise<YnabAccountsResponse> => {
  const ynabResponse = await (
    await fetch(
      `https://api.youneedabudget.com/v1/budgets/${budgetId}/accounts`,
      {
        method: "GET",
        headers: { ...getBasicHeaders() },
      }
    )
  ).json();

  return ynabResponse as YnabAccountsResponse;
};
