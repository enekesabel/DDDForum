import { PostsRepository, Posts } from '../ports/PostsRepository';

export class InMemoryPostsRepository implements PostsRepository {
  private posts: Posts;

  constructor() {
    this.posts = [];
  }

  async getPosts(): Promise<Posts> {
    return this.posts;
  }

  async clear(): Promise<void> {
    this.posts = [];
  }
}
