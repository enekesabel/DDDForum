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
    const webServer = this.sharedModule.getWebServer();
    const database = this.sharedModule.getDatabase();

    this.notificationsModule = new NotificationsModule();
    this.usersModule = new UsersModule(
      this.config,
      database,
      this.notificationsModule.getNotificationsService(),
      webServer
    );
    this.postsModule = new PostsModule(this.config, database, webServer);
    this.marketingModule = new MarketingModule(this.config, webServer);

    // registering error handling middleware at last
    webServer.registerMiddleware(errorHandler);
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
