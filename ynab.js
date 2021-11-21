import fetch from "node-fetch";
const getBasicHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.YNAB_PAT}`,
});
export const sendTransactionsToYnab = async (transactions) => {
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

export const getYnabBudgets = async () => {
  const ynabResponse = await (
    await fetch(`https://api.youneedabudget.com/v1/budgets`, {
      method: "GET",
      headers: {
        ...getBasicHeaders(),
      },
    })
  ).json();

  return ynabResponse;
};

export const getYnabAccounts = async (budgetId) => {
  const ynabResponse = await (
    await fetch(
      `https://api.youneedabudget.com/v1/budgets/${budgetId}/accounts`,
      {
        method: "GET",
        headers: { ...getBasicHeaders() },
      }
    )
  ).json();

  return ynabResponse;
};
