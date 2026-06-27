import { Roles } from './roles';

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: Roles;
  balance: number;
  phone: string | null;
  isBlocked: boolean;
  isApproved: boolean;
  shopUrl: string | null;
  salesChannel: string | null;
  experience: string | null;
}
