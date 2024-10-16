import { User } from '@prisma/client';
import { UserCreateInput, UsersRepository, UserUpdateInput } from '../ports/UsersRepository';

export class InMemoryUsersRepository implements UsersRepository {
  private users: User[];

  constructor() {
    this.users = [];
  }
  async findUserById(id: number): Promise<User | null> {
    return this.users.find((user) => user.id === id) || null;
  }
  async findUserByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.email === email) || null;
  }
  async findUserByUsername(username: string): Promise<User | null> {
    return this.users.find((user) => user.username === username) || null;
  }
  async createUser(userData: UserCreateInput): Promise<User> {
    const user = {
      id: this.users.length + 1,
      ...userData,
    };
    this.users.push(user);
    return user;
  }
  async updateUser(id: number, userData: UserUpdateInput): Promise<User> {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) {
      throw new Error('User not found');
    }
    const user = {
      ...this.users[index],
      ...userData,
    };
    this.users[index] = user;
    return user;
  }
}