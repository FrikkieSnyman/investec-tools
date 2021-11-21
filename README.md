# investec-ynab-sync

This is a small script that can be used to keep your Investec accounts in-sycn with your You Need A Budget (YNAB) budget.

## Setup

Create a `.env` file that contains the following environment variables:

```
INVESTEC_API_ID=xxx
INVESTEC_API_SECRET=yyy
YNAB_PAT=zzz
```
where `INVESTEC_API_ID` and `INVESTEC_API_SECRET` is your client ID and client secret from Investec's Open API, and `YNAB_PAT` is your Peronal Access Token for your YNAB account.

Next, run `yarn install`.

## Basic usage

### List accounts

Run `yarn listAccounts` to get a list of accounts for both Investec and YNAB. These will be used to add to your `.env` to run the sync script.

### Sync transactions from Investec to YNAB

Add the following to your `.env` file:

```
YNAB_BUDGET_ID=aaa
ixxx=aaa-bbb
iyyy=bbb-ccc
izzz=ccc-ddd
```
where `YNAB_BUDGET_ID` is the id of the budget that you want to keep in sync with Investec, `ixxx`, `iyyy`, `izzz` are the Investec account ID's prepended with "i" and their values are the correlating accounts from YNAB.

You can now run `yarn start` to sync the past 3 days of transactions from Investec with YNAB.
