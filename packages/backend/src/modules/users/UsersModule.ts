import { Database, WebServer } from '../../shared';
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

  constructor(database: Database, transactionalEmailAPI: TransactionalEmailAPI, webServer: WebServer) {
    this.database = database;
    this.transactionalEmailAPI = transactionalEmailAPI;
    this.usersRepository = new ProductionUsersRepository(this.database);
    this.usersService = new UsersService(this.usersRepository, this.transactionalEmailAPI);
    this.usersController = new UsersController(this.usersService, usersErrorHandler);

    webServer.registerController('/users', this.usersController);
  }

  getUsersService() {
    return this.usersService;
  }
}
