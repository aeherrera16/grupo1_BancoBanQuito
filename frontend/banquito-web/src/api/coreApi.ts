import { Account, Branch, Customer, Transaction } from '../types';
import { coreHttp, tryGet, tryPost } from './http';
import { demoAccounts, demoBranches, demoCustomers, demoTransactions } from '../data/demo';

async function postAccountAmount(path: 'credit' | 'debit', payload: any) {
  const accountNumber = payload.accountNumber || payload.cuenta;
  const amount = Number(payload.amount ?? payload.monto ?? 0);
  const { data } = await coreHttp.post(`/core/accounts/${accountNumber}/${path}`, { amount });
  return data;
}

export const coreApi = {
  health: async () => {
    try { const { data } = await coreHttp.get('/actuator/health'); return data; }
    catch { return { status: 'DOWN_OR_NOT_EXPOSED' }; }
  },
  customers: () => tryGet<Customer[]>(coreHttp, ['/core/customers','/api/core/customers','/api/customers','/customers'], demoCustomers),
  accounts: () => tryGet<Account[]>(coreHttp, ['/core/accounts','/api/core/accounts','/api/accounts','/accounts'], demoAccounts),
  branches: () => tryGet<Branch[]>(coreHttp, ['/core/branches','/api/core/branches','/api/branches','/branches'], demoBranches),
  transactions: () => tryGet<Transaction[]>(coreHttp, ['/core/transactions','/api/core/transactions','/api/transactions','/transactions'], demoTransactions),
  createCustomer: (payload: Customer) => tryPost<Customer>(coreHttp, ['/core/customers','/api/core/customers','/api/customers','/customers'], payload),
  updateCustomerStatus: async (id: number, status: string) => {
    const { data } = await coreHttp.patch(`/core/customers/${id}/status`, { status });
    return data as Customer;
  },
  createAccount: (payload: any) => tryPost<Account>(coreHttp, ['/core/accounts','/api/core/accounts','/api/accounts','/accounts'], payload),
  debit: (payload: any) => postAccountAmount('debit', payload),
  credit: (payload: any) => postAccountAmount('credit', payload),
  transfer: (payload: any) => tryPost<any>(coreHttp, ['/core/transactions/transferir','/api/core/transactions/transferir','/core/accounts/transfer','/api/accounts/transfer'], payload),
};
