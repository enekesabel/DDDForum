import { Config, SharedModule, errorHandler } from '../shared';
import { UsersModule } from '../modules/users';
import { NotificationsModule } from '../modules/notifications';
import { PostsModule } from '../modules/posts';
import { MarketingModule } from '../modules/marketing';
import { Application } from './Application';

export class CompositionRoot {
  private static Instance: CompositionRoot;
  static Create(config: Config) {
    if (!this.Instance) {
      this.Instance = new CompositionRoot(config);
    }
    return this.Instance;
  }

  private config: Config;
  readonly sharedModule: SharedModule;
  readonly notificationsModule: NotificationsModule;
  readonly usersModule: UsersModule;
  readonly postsModule: PostsModule;
  readonly marketingModule: MarketingModule;

  private constructor(config: Config) {
    this.config = config;
    this.sharedModule = new SharedModule();
    const database = this.sharedModule.getDatabase();

    this.notificationsModule = new NotificationsModule(this.config);
    this.usersModule = new UsersModule(this.config, database, this.notificationsModule.getNotificationsService());
    this.postsModule = new PostsModule(this.config, database);
    this.marketingModule = new MarketingModule(this.config);

    this.setUpRoutes();

    // registering global error handling middleware at last
    this.sharedModule.getWebServer().registerMiddleware(errorHandler);
  }

  private setUpRoutes() {
    const app = this.getApplication();
    const webServer = this.sharedModule.getWebServer();
    this.usersModule.setUpRoutes(app, webServer);
    this.postsModule.setUpRoutes(app, webServer);
    this.marketingModule.setUpRoutes(app, webServer);
  }

  getWebServer() {
    return this.sharedModule.getWebServer();
  }

  getApplication(): Application {
    return {
      users: this.usersModule.getUsersService(),
      posts: this.postsModule.getPostsService(),
      marketing: this.marketingModule.getMarketingService(),
      notifications: this.notificationsModule.getNotificationsService(),
    };
  }
}
