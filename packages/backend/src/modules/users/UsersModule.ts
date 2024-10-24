import { Database, WebServer, Config } from '../../shared';
import { NotificationsService } from '../notifications/NotificationsService';
import { UsersRepository } from './ports/UsersRepository';
import { UsersController } from './UsersController';
import { usersErrorHandler } from './usersErrorHandler';
import { ProductionUsersRepository } from './adapters/ProductionUsersRepository';
import { UsersService } from './services';
import { InMemoryUsersRepository } from './adapters/InMemoryUsersRepository';

export class UsersModule {
  private database: Database;
  private notificationsService: NotificationsService;
  private usersRepository: UsersRepository;
  private usersService: UsersService;
  private usersController: UsersController;
  private config: Config;

  constructor(config: Config, database: Database, notificationsService: NotificationsService, webServer: WebServer) {
    this.config = config;
    this.database = database;
    this.notificationsService = notificationsService;
    this.usersRepository = this.createUsersRepository();
    this.usersService = new UsersService(this.usersRepository, this.notificationsService);
    this.usersController = new UsersController(this.usersService, usersErrorHandler);

    webServer.registerController('/users', this.usersController);
  }

  private createUsersRepository() {
    switch (this.config.script) {
      case 'test:unit':
      case 'start:dev':
        return new InMemoryUsersRepository();
      default:
        return new ProductionUsersRepository(this.database);
    }
  }

  getUsersService() {
    return this.usersService;
  }

  getUsersRepository() {
    return this.usersRepository;
  }
}
