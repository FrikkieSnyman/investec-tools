import fetch from "node-fetch";
export const sendTransactionsToYnab = async (transactions) => {
  const ynabResponse = await (
    await fetch(
      `https://api.youneedabudget.com/v1/budgets/${process.env.YNAB_BUDGET_ID}/transactions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.YNAB_PAT}`,
        },
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
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.YNAB_PAT}`,
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.YNAB_PAT}`,
        },
      }
    )
  ).json();

  return ynabResponse;
};
