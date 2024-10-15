import { Database, WebServer } from '../../shared';
import { PostsRepository } from './ports/PostsRepository';
import { PostsController } from './PostsController';
import { ProductionPostsRepository } from './adapters/ProductionPostsRepository';
import { PostsService } from './PostsService';

export class PostsModule {
  private database: Database;
  private postsRepository: PostsRepository;
  private postsService: PostsService;
  private postsController: PostsController;

  constructor(database: Database, webServer: WebServer) {
    this.database = database;
    this.postsRepository = new ProductionPostsRepository(this.database);
    this.postsService = new PostsService(this.postsRepository);
    this.postsController = new PostsController(this.postsService);

    webServer.registerController('/posts', this.postsController);
  }
}
