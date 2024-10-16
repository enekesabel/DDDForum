import { User } from '@prisma/client';

export type UserCreateInput = Omit<User, 'id'>;
export type UserUpdateInput = Partial<UserCreateInput>;

export interface UsersRepository {
  findUserById(id: number): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserByUsername(username: string): Promise<User | null>;
  createUser(userData: UserCreateInput): Promise<User>;
  updateUser(id: number, userData: Partial<UserUpdateInput>): Promise<User>;
}
