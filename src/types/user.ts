export type UserRole = 'admin' | 'staff' | 'public';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: UserRole;
} 