import fetch from "node-fetch";

const sync = async () => {
  console.log("signing in to investec...");
  const tokenResponse = await fetch(
    "https://openapi.investec.com/identity/v2/oauth2/token",
    {
      method: "POST",
      body:
        "grant_type=client_credentials&client_id=" +
        process.env.INVESTEC_API_ID +
        "&client_secret=" +
        process.env.INVESTEC_API_SECRET,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const tokenJson = await tokenResponse.json();
  const token = tokenJson.access_token;
  const basicHeaders = { Authorization: `Bearer ${token}` };
  console.log("received token from investec, fetching accounts...");
  const accounts = await (
    await fetch(`https://openapi.investec.com/za/pb/v1/accounts`, {
      headers: {
        ...basicHeaders,
      },
    })
  ).json();
  console.log("got account from investec");
  const todayIsoString = new Date().toISOString().split("T")[0];

  const ynabTransactions = [];
  for (const acc of accounts.data.accounts) {
    console.log("fetching transactions for account", acc.accountId);
    const transactions = await (
      await fetch(
        `https://openapi.investec.com/za/pb/v1/accounts/${acc.accountId}/transactions?fromDate=${todayIsoString}&toDate=${todayIsoString}`,
        {
          headers: {
            ...basicHeaders,
          },
        }
      )
    ).json();
    ynabTransactions.push(
      ...transactions.data.transactions.map((t) => ({
        account_id: process.env[acc.accountId],
        date: t.transactionDate,
        amount: (t.type === "DEBIT" ? -1 : 1) * t.amount * 1000,
        payee_name: t.description.slice(0, 50),
        import_id: `${(t.type === "DEBIT" ? -1 : 1) * t.amount * 1000}:${
          t.transactionDate
        }:${t.postedOrder}`,
        cleared: "cleared",
      }))
    );
  }

  if (ynabTransactions.length < 1) {
    console.log("No transactions to send to ynab");
    return;
  }
  console.log("sending transactions to ynab", ynabTransactions);
  const ynabResponse = await (
    await fetch(
      `https://api.youneedabudget.com/v1/budgets/${process.env.YNAB_BUDGET_ID}/transactions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.YNAB_PAT}`,
        },
        body: JSON.stringify({ transactions: ynabTransactions }),
      }
    )
  ).json();

  console.log(ynabResponse);
};

sync().then(() => {
  console.log("done");
});
