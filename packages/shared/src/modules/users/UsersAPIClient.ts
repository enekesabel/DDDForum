import { HTTPClient } from '../../shared';
import { CreateUserResponse, GetUserResponse, UpdateUserResponse, UserInput } from './usersTypes';

export class UsersAPIClient extends HTTPClient {
  constructor(baseUrl: string) {
    super(`${baseUrl}/users`);
  }

  async register(userInput: UserInput) {
    return (await this.post('/new', userInput)) as CreateUserResponse;
  }

  async getUserByEmail(email: string) {
    return (await this.get(`/`, { params: { email } })) as GetUserResponse;
  }

  async editUser(userId: number, userInput: Partial<UserInput>) {
    return (await this.post(`/edit/${userId}`, userInput)) as UpdateUserResponse;
  }
}
