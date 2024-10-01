import { Database } from './database/Database';
import { ContactListAPI } from '../modules/marketing/ContactListAPI';
import { TransactionalEmailAPI } from '../modules/notifications/TransactionalEmailAPI';
import { errorHandler } from './errorHandler';
import { prisma } from './database/prisma/prisma';
import { WebServer } from './WebServer';
import { PostsService } from '../modules/posts/PostsService';
import { UsersService } from '../modules/users/UsersService';
import { UsersRepository } from '../modules/users/UsersRepository';
import { MarketingController } from '../modules/marketing/MarketingController';
import { MarketingService } from '../modules/marketing/MarketingService';
import { PostsController } from '../modules/posts/PostsController';
import { PostsRepository } from '../modules/posts/PostsRepository';
import { UsersController } from '../modules/users/UsersController';

export class CompositionRoot {
  private static Instance: CompositionRoot;
  static Create() {
    if (!this.Instance) {
      this.Instance = new CompositionRoot();
    }
    return this.Instance;
  }

  // Database
  private database: Database;

  // Repositories
  private usersRepository: UsersRepository;
  private postsRepository: PostsRepository;

  // External services
  private transactionalEmailAPI: TransactionalEmailAPI;
  private contactListAPI: ContactListAPI;

  // Services
  private usersService: UsersService;
  private postsService: PostsService;
  private marketingService: MarketingService;

  // Controllers
  private usersController: UsersController;
  private postsController: PostsController;
  private marketingController: MarketingController;

  // Web server
  private webServer: WebServer;

  private constructor() {
    this.database = new Database(prisma);

    this.usersRepository = new UsersRepository(this.database);
    this.postsRepository = new PostsRepository(this.database);

    this.transactionalEmailAPI = new TransactionalEmailAPI();
    this.contactListAPI = new ContactListAPI();

    this.usersService = new UsersService(this.usersRepository, this.transactionalEmailAPI);
    this.postsService = new PostsService(this.postsRepository);
    this.marketingService = new MarketingService(this.contactListAPI);

    this.usersController = new UsersController(this.usersService);
    this.postsController = new PostsController(this.postsService);
    this.marketingController = new MarketingController(this.marketingService);

    this.webServer = this.createWebServer();
  }

  private createWebServer() {
    const webServer = new WebServer({
      port: Number(process.env.PORT) || 3000,
    });

    webServer.registerController('/users', this.usersController);
    webServer.registerController('/posts', this.postsController);
    webServer.registerController('/marketing', this.marketingController);
    webServer.registerMiddleware(errorHandler);

    return webServer;
  }

  getWebServer() {
    return this.webServer;
  }
}
