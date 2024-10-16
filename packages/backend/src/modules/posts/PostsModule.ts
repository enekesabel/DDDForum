import { Database, WebServer, Config } from '../../shared';
import { PostsRepository } from './ports/PostsRepository';
import { PostsController } from './PostsController';
import { ProductionPostsRepository } from './adapters/ProductionPostsRepository';
import { PostsService } from './PostsService';
import { InMemoryPostsRepository } from './adapters/InMemoryPostsRepository';

export class PostsModule {
  private database: Database;
  private postsRepository: PostsRepository;
  private postsService: PostsService;
  private postsController: PostsController;
  private config: Config;

  constructor(config: Config, database: Database, webServer: WebServer) {
    this.config = config;
    this.database = database;
    this.postsRepository = this.createPostsRepository();
    this.postsService = new PostsService(this.postsRepository);
    this.postsController = new PostsController(this.postsService);

    webServer.registerController('/posts', this.postsController);
  }

  private createPostsRepository() {
    switch (this.config.script) {
      case 'test:unit':
      case 'start:dev':
        return new InMemoryPostsRepository();
      default:
        return new ProductionPostsRepository(this.database);
    }
  }

  public getPostsService() {
    return this.postsService;
  }

  public getPostsRepository() {
    return this.postsRepository;
  }
}
