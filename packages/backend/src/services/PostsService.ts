import { getPosts } from '../database';

export class PostsService {
  async getPosts() {
    return await getPosts();
  }
}
