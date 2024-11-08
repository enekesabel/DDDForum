import { Server } from 'http';
import { UsersAPIClient } from '../modules/users';
import { PostsAPIClient } from '../modules/posts';
import { MarketingAPIClient } from '../modules/marketing';

export class APIClient {
  static FromServer(server: Server): APIClient {
    const address = server.address();

    if (!address) {
      throw new Error('Could not get server address');
    }

    if (typeof address === 'string') {
      return new APIClient(address);
    }

    const baseUrl = `http://localhost:${address.port}`;
    return new APIClient(baseUrl);
  }
  constructor(private baseUrl: string) {}

  readonly users = new UsersAPIClient(this.baseUrl);
  readonly posts = new PostsAPIClient(this.baseUrl);
  readonly marketing = new MarketingAPIClient(this.baseUrl);
}
