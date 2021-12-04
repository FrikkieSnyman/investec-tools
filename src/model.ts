export type YNABTransaction = {
  account_id: string;
  date: string;
  amount: number;
  payee_name?: string;
  payee_id?: string;
  import_id: string;
  cleared: "cleared";
};
