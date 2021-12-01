import { Client } from "investec-api";
import { YNABTransaction } from "./model";
import { sendTransactionsToYnab } from "./ynab";

const sync = async () => {
  if (!process.env.INVESTEC_API_ID || !process.env.INVESTEC_API_SECRET) {
    console.error("missing environment variables");
    return;
  }
  console.log("signing in to investec...");
  const client = await Client.create(
    process.env.INVESTEC_API_ID,
    process.env.INVESTEC_API_SECRET
  );
  console.log("received token from investec, fetching accounts...");

  const accounts = await client.getAccounts();
  console.log("got accounts from investec");
  const todayIsoString = new Date().toISOString().split("T")[0];
  const twoDaysAgoIsoString = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const ynabTransactions: YNABTransaction[] = [];
  for (const acc of accounts) {
    console.log("fetching transactions for account", acc.accountId);
    const transactions = await acc.getTransactions({
      fromDate: twoDaysAgoIsoString,
      toDate: todayIsoString,
    });
    if (!process.env[`i${acc.accountId}`]) {
      console.error("missing account from map", { accountId: acc.accountId });
      continue;
    }
    ynabTransactions.push(
      ...transactions.map((t) => ({
        account_id: process.env[`i${acc.accountId}`]!,
        date: t.transactionDate,
        amount: (t.type === "DEBIT" ? -1 : 1) * t.amount * 1000,
        payee_name: t.description.slice(0, 50),
        import_id: `${(t.type === "DEBIT" ? -1 : 1) * t.amount * 1000}:${
          t.transactionDate
        }:${t.postedOrder}`,
        cleared: "cleared" as "cleared",
      }))
    );
  }

  if (ynabTransactions.length < 1) {
    console.log("No transactions to send to ynab");
    return;
  }
  console.log("sending transactions to ynab", ynabTransactions);
  const ynabResponse = await sendTransactionsToYnab(ynabTransactions);
  console.log(ynabResponse);
};

sync().then(() => {
  console.log("done");
});
