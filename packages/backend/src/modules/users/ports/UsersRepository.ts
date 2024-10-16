import type { User, PrismaClient } from '@prisma/client';
import { Repository } from '../../../shared';

let _client: PrismaClient;

export type UserCreateInput = Omit<User, 'id'>;
export type UserUpdateInput = Partial<UserCreateInput>;

export type UserCreateOutput = Awaited<
  ReturnType<
    typeof _client.user.create<{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any;
      include: { member: true };
    }>
  >
>;

export interface UsersRepository extends Repository {
  findUserById(id: number): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserByUsername(username: string): Promise<User | null>;
  createUser(userData: UserCreateInput): Promise<UserCreateOutput>;
  updateUser(id: number, userData: Partial<UserUpdateInput>): Promise<User>;
}
