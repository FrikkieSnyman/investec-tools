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
