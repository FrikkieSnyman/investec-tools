import { Client } from "investec-api";
import { getYnabAccounts, getYnabBudgets } from "./ynab.js";

const list = async () => {
  console.log("logging in to investec...");
  const client = await Client.create(
    process.env.INVESTEC_API_ID,
    process.env.INVESTEC_API_SECRET
  );
  console.log("getting investec accounts");
  const investecAccounts = await client.getAccounts();

  console.log("getting ynab budgets");
  const ynabBudgets = await getYnabBudgets();

  console.log("getting ynab accounts");
  const ynabAccounts = {};
  for (const budget of ynabBudgets.data.budgets) {
    const accounts = await getYnabAccounts(budget.id);
    ynabAccounts[budget.id] = accounts.data.accounts.map((a) => ({
      id: a.id,
      name: a.name,
    }));
  }

  console.log("===== Investec accounts =====");
  console.log(JSON.stringify(investecAccounts, null, 2));
  console.log("\n\n");
  console.log("===== YNAB Accounts =====");
  console.log(JSON.stringify(ynabAccounts, null, 2));
};

list().then("done");
