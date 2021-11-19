import {
  getInvestecToken,
  getInvestecAccounts,
  getInvestecTransactionsForAccount,
} from "./investec.js";
import { sendTransactionsToYnab } from "./ynab.js";

const sync = async () => {
  console.log("signing in to investec...");
  const token = await getInvestecToken();
  console.log("received token from investec, fetching accounts...");

  const accounts = await getInvestecAccounts(token);
  console.log("got accounts from investec");
  const todayIsoString = new Date().toISOString().split("T")[0];
  const twoDaysAgoIsoString = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const ynabTransactions = [];
  for (const acc of accounts) {
    console.log("fetching transactions for account", acc.accountId);
    const transactions = await getInvestecTransactionsForAccount(
      token,
      acc.accountId,
      twoDaysAgoIsoString,
      todayIsoString
    );
    ynabTransactions.push(
      ...transactions.map((t) => ({
        account_id: process.env[`i${acc.accountId}`],
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
  const ynabResponse = await sendTransactionsToYnab(ynabTransactions);
  console.log(ynabResponse);
};

sync().then(() => {
  console.log("done");
});
