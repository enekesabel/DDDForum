import { HTTPClient } from '../../shared';
import { CreateUserResponse, GetUserResponse, UpdateUserResponse, UserInput } from './usersTypes';

export class UsersAPIClient extends HTTPClient {
  constructor(baseUrl: string) {
    super(`${baseUrl}/users`);
  }

  async register(userInput: UserInput): Promise<CreateUserResponse> {
    return await this.post('/new', userInput);
  }

  async getUserByEmail(email: string): Promise<GetUserResponse> {
    return await this.get(`/`, { params: { email } });
  }

  async editUser(userId: number, userInput: Partial<UserInput>): Promise<UpdateUserResponse> {
    return await this.post(`/edit/${userId}`, userInput);
  }
}
