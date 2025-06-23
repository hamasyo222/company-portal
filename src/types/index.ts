export type UserType = 'company_admin' | 'company_employee';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: UserType;
}

export * from './api';
// index.d.tsは型宣言ファイルなのでimport/export不要 