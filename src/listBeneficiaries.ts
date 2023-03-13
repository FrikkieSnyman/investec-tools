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
  console.log("getting investec beneficiaries");
  const investecBeneficiaries = await client.getBeneficiaries();
  console.log("getting investec beneficiary categories");
  const investecBeneficiaryCategories = await client.getBeneficiaryCategories();

  console.log("===== Investec beneficiaries =====");
  console.log(JSON.stringify(investecBeneficiaries, null, 2));
  console.log("\n\n");
  console.log("===== Investec beneficiarycategories =====");
  console.log(JSON.stringify(investecBeneficiaryCategories, null, 2));
  console.log("\n\n");
};

list().then(() => console.log("done"));
