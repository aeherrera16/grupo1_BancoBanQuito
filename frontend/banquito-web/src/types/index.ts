export type Role='CLIENTE_NATURAL'|'EMPRESA'|'ASESOR'|'CAJERO'|'SWITCH'|'ADMIN';
export type CustomerType='NATURAL'|'JURIDICO';
export type Status='ACTIVA'|'ACTIVO'|'INACTIVA'|'INACTIVO'|'BLOQUEADA'|'SUSPENDIDA'|'SUSPENDIDO'|'PROCESADO'|'PROCESSED'|'VALIDADO'|'VALIDATED'|'RECEIVED'|'RECIBIDO'|'PROCESSING'|'EN_PROCESO'|'ENCOLADO'|'REJECTED'|'RECHAZADO'|'SUCCESS'|'EXITOSA'|'PENDING'|'PENDIENTE';
export interface Customer{ id?:number; customerType:CustomerType; identificationType:string; identification:string; firstName?:string; lastName?:string; birthDate?:string; legalName?:string; constitutionDate?:string; legalRepresentative?:Customer|number|null; email:string; mobilePhone:string; address:string; status:string; }
export interface Account{ id?:number; accountNumber:string; customerId:number; branch?:{id?:number;branchCode?:string;name?:string;city?:string}; accountSubtype?:{id:number;code?:string;name?:string}; balance:number|string; accountingBalance?:number|string; availableBalance?:number|string; status:string; creationDate?:string; }
export interface Branch{ id?:number; branchCode:string; name:string; city:string; }
export interface Transaction{ id?:number; account?:Account; transactionUuid:string; movementType:string; amount:number|string; resultingBalance?:number|string; status:string; description?:string; transactionDate?:string; }
export interface BatchUploadResult{ validationResult?:string; isSuccess?:boolean; batchStatus?:string; fileValidation?:any; error?:string; rejectedEarly?:boolean; }
export interface Session{ username:string; role:Role; displayName:string; customerId?:number; companyRuc?:string; }
