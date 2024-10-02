import { Database } from '../../shared/database/Database';
import { TransactionalEmailAPI } from '../notifications/TransactionalEmailAPI';
import { UsersController } from './UsersController';
import { UsersRepository } from './UsersRepository';
import { UsersService } from './UsersService';
import { WebServer } from '../../shared/WebServer';

export class UsersModule {
  private database: Database;
  private transactionalEmailAPI: TransactionalEmailAPI;
  private usersRepository: UsersRepository;
  private usersService: UsersService;
  private usersController: UsersController;

  constructor(database: Database, transactionalEmailAPI: TransactionalEmailAPI, webServer: WebServer) {
    this.database = database;
    this.transactionalEmailAPI = transactionalEmailAPI;
    this.usersRepository = new UsersRepository(this.database);
    this.usersService = new UsersService(this.usersRepository, this.transactionalEmailAPI);
    this.usersController = new UsersController(this.usersService);

    webServer.registerController('/users', this.usersController);
  }
}
