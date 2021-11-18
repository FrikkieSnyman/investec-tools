import fetch from "node-fetch";
const getBasicHeaders = (token) => {
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getInvestecToken = async () => {
  const tokenResponse = await (
    await fetch("https://openapi.investec.com/identity/v2/oauth2/token", {
      method: "POST",
      body:
        "grant_type=client_credentials&client_id=" +
        process.env.INVESTEC_API_ID +
        "&client_secret=" +
        process.env.INVESTEC_API_SECRET,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
  ).json();
  return tokenResponse.access_token;
};

export const getInvestecAccounts = async (token) => {
  const accountsResponse = await (
    await fetch(`https://openapi.investec.com/za/pb/v1/accounts`, {
      headers: {
        ...getBasicHeaders(token),
      },
    })
  ).json();
  return accountsResponse.data.accounts;
};

export const getInvestecTransactionsForAccount = async (
  token,
  accountId,
  dateFromIsoString,
  dateToIsoString
) => {
  const transactionsResponse = await (
    await fetch(
      `https://openapi.investec.com/za/pb/v1/accounts/${accountId}/transactions?fromDate=${dateFromIsoString}&toDate=${dateToIsoString}`,
      {
        headers: {
          ...getBasicHeaders(token),
        },
      }
    )
  ).json();
  return transactionsResponse.data.transactions;
};
