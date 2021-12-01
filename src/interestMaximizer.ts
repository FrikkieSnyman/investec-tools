import { Account, Client } from "investec-api";

const t = async () => {
  if (
    !process.env.INVESTEC_API_ID ||
    !process.env.INVESTEC_API_SECRET ||
    !process.env.TRANS_ACC_ID ||
    !process.env.SAV_ACC_ID ||
    !process.env.FACILITY ||
    !process.env.MIN_BAL
  ) {
    console.error("missing environment variables");
    return;
  }
  const transactionAccountId = process.env.TRANS_ACC_ID;
  const savingsAccountId = process.env.SAV_ACC_ID;
  const minBalance = +process.env.MIN_BAL;
  const facility = +process.env.FACILITY;
  console.log("signing in to investec...");
  const client = await Client.create(
    process.env.INVESTEC_API_ID,
    process.env.INVESTEC_API_SECRET
  );
  const accounts = await client.getAccounts();
  const transactionalAccount = accounts.find(
    (a) => a.accountId === transactionAccountId
  );
  const savingsAccount = accounts.find((a) => a.accountId === savingsAccountId);
  if (!transactionalAccount || !savingsAccount) {
    console.log("accounts not found");
    return;
  }

  const transactionalAccBalance = await transactionalAccount.getBalance();

  const trueBalance = transactionalAccBalance.availableBalance - facility; // the availableBalance takes the pending transactions into account
  let diffFromTarget = trueBalance - minBalance;

  let fromAccount, toAccount: Account;
  if (diffFromTarget === 0) {
    console.log("target balance reached, doing nothing");
    return;
  }
  if (diffFromTarget > 0) {
    // move money into savings
    fromAccount = transactionalAccount;
    toAccount = savingsAccount;
  } else {
    // move savings into money
    fromAccount = savingsAccount;
    toAccount = transactionalAccount;
    diffFromTarget *= -1;
  }
  console.log("transferring", { fromAccount, toAccount, diffFromTarget });
  const timestamp = Date.now();
  const reference = `${timestamp} - auto transfer`;
  const transferResponse = await fromAccount.transfer([
    {
      account: toAccount,
      myReference: reference,
      theirReference: reference,
      amount: diffFromTarget,
    },
  ]);

  console.log("transfer response", transferResponse);
};

t().then(() => console.log("done"));