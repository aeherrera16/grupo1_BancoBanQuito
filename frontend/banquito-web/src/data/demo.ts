import { Account, Branch, Customer, Transaction } from '../types';

export const demoCustomers: Customer[] = [
 {id:1,customerType:'NATURAL',identificationType:'CEDULA',identification:'1712345678',firstName:'Mateo',lastName:'Andrade',birthDate:'1998-05-10',email:'mateo@correo.com',mobilePhone:'0991234567',address:'Quito Norte',status:'ACTIVO'},
 {id:2,customerType:'NATURAL',identificationType:'CEDULA',identification:'1723456789',firstName:'Ana',lastName:'Paredes',birthDate:'1999-09-12',email:'ana@correo.com',mobilePhone:'0993334444',address:'Quito Centro',status:'ACTIVO'},
 {id:3,customerType:'JURIDICO',identificationType:'RUC',identification:'1790012345001',legalName:'Textiles Andinos S.A.',constitutionDate:'2015-03-21',email:'tesoreria@textilesandinos.ec',mobilePhone:'022345678',address:'Av. Amazonas, Quito',status:'ACTIVO'},
];
export const demoBranches: Branch[] = [
 {id:1,branchCode:'001',name:'Sucursal Norte',city:'Quito'}, {id:2,branchCode:'002',name:'Sucursal Sur',city:'Quito'}, {id:3,branchCode:'005',name:'Digital',city:'Quito'}
];
export const demoAccounts: Account[] = [
 {id:1,accountNumber:'0010000001',customerId:1,branch:demoBranches[0],accountSubtype:{id:1,code:'AHO',name:'Ahorros'},balance:2450,availableBalance:2450,status:'ACTIVA',creationDate:'2026-05-01T10:10:00'},
 {id:2,accountNumber:'0050000201',customerId:3,branch:demoBranches[2],accountSubtype:{id:2,code:'CTE',name:'Corriente'},balance:42500,availableBalance:42500,status:'ACTIVA',creationDate:'2026-05-01T10:15:00'},
 {id:3,accountNumber:'0050000202',customerId:3,branch:demoBranches[2],accountSubtype:{id:3,code:'NOM',name:'Nómina'},balance:18500,availableBalance:18000,status:'ACTIVA',creationDate:'2026-05-01T10:20:00'},
];
export const demoTransactions: Transaction[] = [
 {id:1,transactionUuid:'1b9e5f9b-1ef8-4f2c-a450-6d2f0d82c111',movementType:'CREDITO',amount:1200,resultingBalance:2450,status:'EXITOSA',description:'Depósito ventanilla',transactionDate:'2026-05-08T09:30:00'},
 {id:2,transactionUuid:'cbbac57e-6b74-40ee-b573-35fe251aa222',movementType:'DEBITO',amount:35,resultingBalance:2415,status:'EXITOSA',description:'Retiro cajero',transactionDate:'2026-05-08T12:10:00'},
];
export const demoBatches = [
 {id:101,fileName:'nomina_mayo.csv',ruc:'1790012345001',sourceAccountNumber:'0050000202',channel:'PORTAL',serviceType:'NOM',receivedAt:'2026-05-08T13:00:00',status:'PROCESSED',headerTotalRecords:120,headerTotalAmount:18450,successfulRecords:118,rejectedRecords:2},
 {id:102,fileName:'proveedores_08.csv',ruc:'1790012345001',sourceAccountNumber:'0050000201',channel:'SFTP',serviceType:'PRV',receivedAt:'2026-05-08T18:40:00',status:'ENCOLADO',headerTotalRecords:36,headerTotalAmount:7900,successfulRecords:0,rejectedRecords:0},
];
