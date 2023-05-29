// SAVINGS ROULETTE
// Savings accrue when you least expect it!
// The beforeTransaction will randomly reject transactions,
// whereafter the afterTransaction will transfer the amount to your savings account.
// You can configure the percentage of transactions that will be rejected, and the maximum amount that will be considered for savings.
// You can also configure the accounts to transfer from and to.
// This is a great way to save money without even thinking about it!

const PERCENTAGE = Number(process.env.PERCENTAGE); // what are the chances of "savings"
const MAX_AMOUNT_IN_CENTS = Number(process.env.MAX_AMOUNT_IN_CENTS); // max amount of a transaction that will be considered for savings
const FROM_ACCOUNT_ID = process.env.FROM_ACCOUNT_ID; // the account to transfer from
const TO_ACCOUNT_ID = process.env.TO_ACCOUNT_ID; // the account to transfer to
const INVESTEC_API_ID = process.env.INVESTEC_API_ID; // your Investec API ID
const INVESTEC_API_SECRET = process.env.INVESTEC_API_SECRET; // your Investec API secret
const INVESTEC_API_KEY = process.env.INVESTEC_API_KEY; // your Investec API key
const KVAAS_API_KEY = process.env.KVAAS_API_KEY; // your KVAAS API key

// This function runs during the card transaction authorization flow.
// It has a limited execution time, so keep any code short-running.
const beforeTransaction = async (authorization) => {
  console.log(authorization);
  if (
    authorization.centsAmount <= MAX_AMOUNT_IN_CENTS &&
    Math.random() < PERCENTAGE
  ) {
    console.log("SURPRISE SAVINGS!!");
    // we only get 2s, so do the transfer after the before transaction
    setResult(authorization.card.id, "reject");
    // implement your favourite messaging API here to inform yourself of the surprise savings!
    return false;
  }
  setResult(authorization.card.id, "approve");
  return true;
};

// This function runs after an approved transaction.
// NB: in the simulator, only `afterTransaction` is ever called.
// in prod, `afterDecline` is called.
const afterTransaction = async (transaction) => {
  console.log(transaction);

  const result = await getResult(transaction.card.id);
  if (result === "reject") {
    await doSurpriseSavings(transaction.centsAmount);
  }
};

const afterDecline = async (transaction) => {
  console.log(transaction);

  const result = await getResult(transaction.card.id);
  if (result === "reject") {
    await doSurpriseSavings(transaction.centsAmount);
  }
};

const setResult = async (key, result) => {
  const response = await fetch(`https://www.kvaas.cloud/api/${key}`, {
    method: "POST",
    body: JSON.stringify({
      value: result,
    }),
    headers: {
      "Content-Type": "application/json",
      "x-api-key": KVAAS_API_KEY,
    },
  });
  return response.json();
};
const getResult = async (key) => {
  const response = await fetch(`https://www.kvaas.cloud/api/${key}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": KVAAS_API_KEY,
    },
  });
  return response.json();
};

const getBasicHeaders = (token) => {
  return {
    Authorization: `Bearer ${token}`,
  };
};

// shamelessly copied from https://github.com/FrikkieSnyman/Investec-api
const INVESTEC_BASE_URL = "https://openapi.investec.com";

const getInvestecToken = async () => {
  const tokenResponse = await fetch(
    `${INVESTEC_BASE_URL}/identity/v2/oauth2/token`,
    {
      method: "POST",
      body: `grant_type=client_credentials&scope=accounts`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic  ${Buffer.from(
          `${INVESTEC_API_ID}:${INVESTEC_API_SECRET}`
        ).toString("base64")} `,

        "x-api-key": INVESTEC_API_KEY,
      },
    }
  );
  return tokenResponse.json();
};
const transfer = async (token, amountInCents) => {
  const body = {
    transferList: [
      {
        beneficiaryAccountId: TO_ACCOUNT_ID,
        amount: Math.floor(amountInCents / 100),
        myReference: "SUPRISE SAVINGS!",
        theirReference: "SUPRISE SAVINGS!",
      },
    ],
  };
  const transferResponse = await fetch(
    `${INVESTEC_BASE_URL}/za/pb/v1/accounts/${FROM_ACCOUNT_ID}/transfermultiple`,
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        ...getBasicHeaders(token),
      },
    }
  );
  return transferResponse.json();
};

const doSurpriseSavings = async (amountInCents) => {
  const token = (await getInvestecToken()).access_token;
  await transfer(token, amountInCents);
};
