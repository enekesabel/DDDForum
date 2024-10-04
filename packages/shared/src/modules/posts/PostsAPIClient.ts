import { HTTPClient } from '../../shared';
import { GetPostsResponse } from './postsTypes';

export class PostsAPIClient extends HTTPClient {
  constructor(baseUrl: string) {
    super(`${baseUrl}/posts`);
  }

  async getPosts(sort: string): Promise<GetPostsResponse> {
    return await this.get('/', { params: { sort } });
  }
}
