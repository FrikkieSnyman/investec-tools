# investec-interest-maximizer

The idea behind this script is that interest on your savings/loan accounts are calculated daily. As such, you want to put as much money there everyday to increase earnings/minimise accrued interest.

This script respects a facility and minimum balance for your transactional account. If your transactional account dips below that minimum (`facility + min_balance`), it transfers money back from the savings/loan account to keep the transactional account at this defined limit.
This means that you can happily transact everyday, let your debit orders go off, etc., without having to keep the accounts balanced yourself.

## Pre-requisites

Ensure that you have `yarn` installed.

Run `yarn install` and then `yarn build` before running any other commands.

## Requirements

This script is best run in the cloud on an intervalled schedule.

It requires the following environment variables:

| Variable              | Description                                                  |
| --------------------- | ------------------------------------------------------------ |
| `INVESTEC_API_ID`     | Client ID for Investec's Open API                            |
| `INVESTEC_API_KEY`    | The relevant Client Key for Investec's Open API              |
| `INVESTEC_API_SECRET` | The relevant Client Secret for Investec's Open API           |
| `TRANS_ACC_ID`        | The account id of the account used as transactional account  |
| `SAV_ACC_ID`          | The account id of the account user as savings/loan account   |
| `FACILITY`            | The facility on the transactional account                    |
| `MIN_BAL`             | The minimum balance to maintain on the transactional account |

In order to get the account IDs, simply run `yarn listInvestecAccounts`. This will output a list of accounts with their IDs that you can then use to set your environment variables accordingly.

Note: all of these environment variables are required. The script won't run without any of them.

## Running script

To run locally, put all the above environment variables in a `.env` file, located in the repo root. See [dotenv](https://www.npmjs.com/package/dotenv) for more details.

Simply run `yarn maximizeInterest` to run the script.

# Setting up on a scheduled interval on Heroku

You can run the script on a scheduled interval in the Heroku cloud. This can make use of free resources, so it won't cost you anything to run this.

Heroku is very pleasant for making use of in small, personal projects. As such, create an account or log in here.

Once signed in, create a new app.

Set this app up to perform continuous deployment on the GitHub repo that your code will live in.

Once your deployment is done, Heroku will create a resource called web npm start. This is a nice feature of Heroku to create a task if you do not have a `Procfile`. You can just safely toggle this off.

Next, add the environment variables that you have in your .env file to Heroku. Go to Settings, and add them one-by-one to Config Vars.

Back to the Resources tab, under Add-ons, search for Heroku Scheduler and add it to your app.

Open the dashboard for Heroku Scheduler by clicking on the name of the add-on. Click on Add Job, select your schedule (I did Every 10 minutes), and input `yarn maximizeInterest` for the command to run.

And that’s it!

Heroku will now launch a task every 10 minutes that will run the script to keep your interest maximised!
