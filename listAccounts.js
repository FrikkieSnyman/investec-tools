import { getInvestecAccounts, getInvestecToken } from "./investec.js";
import { getYnabAccounts, getYnabBudgets } from "./ynab.js";

const list = async () => {
  console.log("logging in to investec...");
  const token = await getInvestecToken();
  console.log("getting investec accounts");
  const investecAccounts = await getInvestecAccounts(token);

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
