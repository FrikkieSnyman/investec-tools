import { Client } from "investec-api";

const list = async () => {
  if (!process.env.INVESTEC_API_ID || !process.env.INVESTEC_API_SECRET || !process.env.INVESTEC_API_KEY) {
    console.error("missing environment variables");
    return;
  }
  console.log("logging in to investec...");
  const client = await Client.create(
    process.env.INVESTEC_API_ID,
    process.env.INVESTEC_API_SECRET,
    process.env.INVESTEC_API_KEY
  );
  console.log(client);
  console.log("getting investec accounts");
  const investecAccounts = await client.getAccounts();

  console.log("===== Investec accounts =====");
  console.log(
    JSON.stringify(
      investecAccounts.map((a) => ({
        id: a.accountId,
        name: a.accountName,
        number: a.accountNumber,
        product: a.productName,
        referenceName: a.referenceName,
      })),
      null,
      2
    )
  );
};

list().then(() => console.log("done"));
