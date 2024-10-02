import { Database } from '../../shared/database/Database';
import { PostsController } from './PostsController';
import { PostsRepository } from './PostsRepository';
import { PostsService } from './PostsService';
import { WebServer } from '../../shared/WebServer';

export class PostsModule {
  private database: Database;
  private postsRepository: PostsRepository;
  private postsService: PostsService;
  private postsController: PostsController;

  constructor(database: Database, webServer: WebServer) {
    this.database = database;
    this.postsRepository = new PostsRepository(this.database);
    this.postsService = new PostsService(this.postsRepository);
    this.postsController = new PostsController(this.postsService);
    webServer.registerController('/posts', this.postsController);
  }
}
