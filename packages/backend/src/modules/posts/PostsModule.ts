import { Database, WebServer, Config } from '../../shared';
import { Application } from '../../core';
import { PostsRepository } from './ports/PostsRepository';
import { PostsController } from './PostsController';
import { ProductionPostsRepository } from './adapters/ProductionPostsRepository';
import { PostsService } from './services';
import { InMemoryPostsRepository } from './adapters/InMemoryPostsRepository';

export class PostsModule {
  private database: Database;
  private postsRepository: PostsRepository;
  private postsService: PostsService;
  private config: Config;

  constructor(config: Config, database: Database) {
    this.config = config;
    this.database = database;
    this.postsRepository = this.createPostsRepository();
    this.postsService = new PostsService(this.postsRepository);
  }

  private createPostsRepository() {
    switch (this.config.script) {
      case 'test:unit':
      case 'start:dev':
      case 'test:infra:incoming':
        return new InMemoryPostsRepository();
      default:
        return new ProductionPostsRepository(this.database);
    }
  }

  setUpRoutes(app: Application, webServer: WebServer) {
    const postsController = new PostsController(app);
    webServer.registerController('/posts', postsController);
  }

  public getPostsService() {
    return this.postsService;
  }

  public getPostsRepository() {
    return this.postsRepository;
  }
}
