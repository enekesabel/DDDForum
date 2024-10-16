import { SharedModule, errorHandler } from '../shared';
import { UsersModule } from '../modules/users';
import { NotificationsModule } from '../modules/notifications';
import { PostsModule } from '../modules/posts';
import { MarketingModule } from '../modules/marketing';
import { Application } from './Application';

export class CompositionRoot {
  private static Instance: CompositionRoot;
  static Create() {
    if (!this.Instance) {
      this.Instance = new CompositionRoot();
    }
    return this.Instance;
  }

  private sharedModule: SharedModule;
  private notificationsModule: NotificationsModule;
  private usersModule: UsersModule;
  private postsModule: PostsModule;
  private marketingModule: MarketingModule;

  private constructor() {
    this.sharedModule = new SharedModule();
    const webServer = this.sharedModule.getWebServer();
    const database = this.sharedModule.getDatabase();

    this.notificationsModule = new NotificationsModule();
    this.usersModule = new UsersModule(database, this.notificationsModule.getTransactionalEmailAPI(), webServer);
    this.postsModule = new PostsModule(database, webServer);
    this.marketingModule = new MarketingModule(webServer);

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
    };
  }
}
