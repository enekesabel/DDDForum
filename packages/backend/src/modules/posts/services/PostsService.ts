import { PostsRepository } from '../ports/PostsRepository';
import { GetPostsQuery } from './GetPostsQuery';

export class PostsService {
  private postsRepository: PostsRepository;

  constructor(postsRepository: PostsRepository) {
    this.postsRepository = postsRepository;
  }

  async getPosts(_query: GetPostsQuery) {
    return await this.postsRepository.getPosts();
  }
}
