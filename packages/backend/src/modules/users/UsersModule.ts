import { Database, WebServer, Config } from '../../shared';
import { TransactionalEmailAPI } from '../notifications';
import { UsersRepository } from './ports/UsersRepository';
import { UsersController } from './UsersController';
import { usersErrorHandler } from './usersErrorHandler';
import { ProductionUsersRepository } from './adapters/ProductionUsersRepository';
import { UsersService } from './UsersService';

export class UsersModule {
  private database: Database;
  private transactionalEmailAPI: TransactionalEmailAPI;
  private usersRepository: UsersRepository;
  private usersService: UsersService;
  private usersController: UsersController;
  private config: Config;

  constructor(config: Config, database: Database, transactionalEmailAPI: TransactionalEmailAPI, webServer: WebServer) {
    this.config = config;
    this.database = database;
    this.transactionalEmailAPI = transactionalEmailAPI;
    this.usersRepository = this.createUsersRepository();
    this.usersService = new UsersService(this.usersRepository, this.transactionalEmailAPI);
    this.usersController = new UsersController(this.usersService, usersErrorHandler);

    webServer.registerController('/users', this.usersController);
  }

  private createUsersRepository() {
    if (this.config.env === 'production') return new ProductionUsersRepository(this.database);

    return new ProductionUsersRepository(this.database);
  }

  getUsersService() {
    return this.usersService;
  }
}
