import { SharedModule } from './SharedModule';
import { UsersModule } from '../modules/users/UsersModule';
import { NotificationsModule } from '../modules/notifications/NotificationsModule';
import { PostsModule } from '../modules/posts/PostsModule';
import { MarketingModule } from '../modules/marketing/MarketingModule';
import { errorHandler } from './errorHandler';

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
}
