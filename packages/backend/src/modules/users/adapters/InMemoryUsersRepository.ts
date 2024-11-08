import { UserCreateInput, UserCreateOutput, UsersRepository, UserUpdateInput } from '../ports/UsersRepository';

export class InMemoryUsersRepository implements UsersRepository {
  private users: UserCreateOutput[];

  constructor() {
    this.users = [];
  }
  async findUserById(id: number) {
    return this.users.find((user) => user.id === id) || null;
  }
  async findUserByEmail(email: string) {
    return this.users.find((user) => user.email === email) || null;
  }
  async findUserByUsername(username: string) {
    return this.users.find((user) => user.username === username) || null;
  }
  async createUser(userData: UserCreateInput) {
    const existingUserByEmail = await this.findUserByEmail(userData.email);
    if (existingUserByEmail) {
      throw new Error('Email already in use');
    }

    const existingUserByUsername = await this.findUserByUsername(userData.username);
    if (existingUserByUsername) {
      throw new Error('Username already taken');
    }
    const id = this.users.length + 1;
    const user = {
      id: id,
      ...userData,
      member: {
        id: id,
        userId: id,
      },
    };
    this.users.push(user);
    return user;
  }
  async updateUser(id: number, userData: UserUpdateInput) {
    const existingUserIndex = this.users.findIndex((user) => user.id === id);
    const existingUser = this.users[existingUserIndex];
    if (!existingUser) {
      throw new Error('User not found');
    }

    const existingUserByEmail = userData.email && (await this.findUserByEmail(userData.email));
    if (existingUserByEmail && existingUserByEmail.id !== id) {
      throw new Error('Email already in use');
    }

    const existingUserByUsername = userData.username && (await this.findUserByUsername(userData.username));
    if (existingUserByUsername && existingUserByUsername.id !== id) {
      throw new Error('Username already taken');
    }

    const updatedUser = {
      ...existingUser,
      ...userData,
    };
    this.users[existingUserIndex] = updatedUser;
    return updatedUser;
  }
  async clear(): Promise<void> {
    this.users = [];
  }
}
