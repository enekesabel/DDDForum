import { Prisma, User } from '@prisma/client';

export interface UsersRepository {
  findUserById(id: number): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserByUsername(username: string): Promise<User | null>;
  createUser(userData: Prisma.UserCreateInput): Promise<User>;
  updateUser(id: number, userData: Prisma.UserUpdateInput): Promise<User>;
}
