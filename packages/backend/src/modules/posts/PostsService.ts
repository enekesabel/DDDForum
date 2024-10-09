import { PostsRepository } from './PostsRepository';

export class PostsService {
  private postsRepository: PostsRepository;

  constructor(postsRepository: PostsRepository) {
    this.postsRepository = postsRepository;
  }

  async getPosts() {
    return await this.postsRepository.getPosts();
  }
}
