import { Client } from "investec-api";
import { InvestecTransaction } from "investec-api/dist/util/model";
import { YNABTransaction } from "./model";
import { getYnabAccounts, sendTransactionsToYnab } from "./ynab";

const mapInvestecTransactionToYNABTransaction = (
  t: InvestecTransaction,
  payeeId?: string
): YNABTransaction => ({
  account_id: process.env[`i${t.accountId}`]!,
  date: t.transactionDate,
  amount: (t.type === "DEBIT" ? -1 : 1) * t.amount * 1000,
  payee_name: !payeeId ? t.description.slice(0, 50) : undefined,
  payee_id: payeeId,
  import_id: `${(t.type === "DEBIT" ? -1 : 1) * t.amount * 1000}:${
    t.transactionDate
  }:${t.postedOrder}`,
  cleared: "cleared" as "cleared",
});

const sync = async () => {
  if (
    !process.env.INVESTEC_API_ID ||
    !process.env.INVESTEC_API_SECRET ||
    !process.env.YNAB_BUDGET_ID
  ) {
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

  const ynabAccounts = await getYnabAccounts(process.env.YNAB_BUDGET_ID);
  const transactions: InvestecTransaction[] = [];
  const ynabTransactions: YNABTransaction[] = [];
  for (const acc of accounts) {
    console.log("fetching transactions for account", acc.accountId);
    const accTransactions = await acc.getTransactions({
      fromDate: twoDaysAgoIsoString,
      toDate: todayIsoString,
    });
    if (!process.env[`i${acc.accountId}`]) {
      console.error("missing account from map", { accountId: acc.accountId });
      continue;
    }
    transactions.push(...accTransactions);
  }

  const transfers: InvestecTransaction[] = [];
  transactions
    .filter((t) => t.type === "DEBIT")
    .forEach((debit) => {
      const credit = transactions.find(
        (ct) =>
          ct.type === "CREDIT" &&
          ct.amount === debit.amount &&
          (ct.description
            .toLowerCase()
            .includes(debit.description.toLowerCase()) ||
            debit.description
              .toLowerCase()
              .includes(ct.description.toLowerCase()))
      );
      if (!credit) {
        return;
      }
      const ynabAcc = ynabAccounts.data.accounts.find(
        (a) => a.id === process.env[`i${credit.accountId}`]!
      );
      if (!ynabAcc) {
        return;
      }
      transfers.push(debit, credit);
      ynabTransactions.push(
        mapInvestecTransactionToYNABTransaction(
          debit,
          ynabAcc.transfer_payee_id
        )
      );
    });

  ynabTransactions.push(
    ...transactions
      .filter((t) => !transfers.includes(t))
      .map((t) => mapInvestecTransactionToYNABTransaction(t))
  );
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
