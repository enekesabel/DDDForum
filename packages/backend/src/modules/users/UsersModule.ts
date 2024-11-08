import { Database, WebServer, Config } from '../../shared';
import { NotificationsService } from '../notifications/NotificationsService';
import { Application } from '../../core';
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
  private config: Config;

  constructor(config: Config, database: Database, notificationsService: NotificationsService) {
    this.config = config;
    this.database = database;
    this.notificationsService = notificationsService;
    this.usersRepository = this.createUsersRepository();
    this.usersService = new UsersService(this.usersRepository, this.notificationsService);
  }

  private createUsersRepository() {
    switch (this.config.script) {
      case 'test:unit':
      case 'start:dev':
      case 'test:infra:incoming':
        return new InMemoryUsersRepository();
      default:
        return new ProductionUsersRepository(this.database);
    }
  }

  setUpRoutes(app: Application, webServer: WebServer) {
    const usersController = new UsersController(app, usersErrorHandler);

    webServer.registerController('/users', usersController);
  }

  getUsersService() {
    return this.usersService;
  }

  getUsersRepository() {
    return this.usersRepository;
  }
}
