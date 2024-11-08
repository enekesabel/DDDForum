import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import {
  CreateUserResponseSchema,
  GetUserResponseSchema,
  UpdateUserResponseSchema,
} from '@dddforum/shared/src/modules/users';
import { buildAPIResponse, Controller } from '../../shared';
import { Application } from '../../core';
import { UpdateUserCommand, CreateUserCommand, GetUserQuery } from './services';

export class UsersController extends Controller {
  constructor(
    private app: Application,
    private errorHandler: ErrorRequestHandler
  ) {
    super();
    this.router.use(this.errorHandler);
  }

  protected setupRoutes(): void {
    this.router.post('/new', this.createUser.bind(this));
    this.router.post('/edit/:userId', this.updateUser.bind(this));
    this.router.get('/', this.getUser.bind(this));
  }

  private async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const createUserCommand = CreateUserCommand.FromRequest(req);

      const user = await this.app.users.createUser(createUserCommand);

      return buildAPIResponse(res).schema(CreateUserResponseSchema).data(user).status(201).build();
    } catch (error) {
      next(error);
    }
  }

  private async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const updateUserCommand = UpdateUserCommand.FromRequest(req);

      const updatedUser = await this.app.users.updateUser(updateUserCommand);

      return buildAPIResponse(res).schema(UpdateUserResponseSchema).data(updatedUser).status(200).build();
    } catch (error) {
      return next(error);
    }
  }

  private async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const getUserQuery = GetUserQuery.FromRequest(req);

      const foundUser = await this.app.users.getUser(getUserQuery);

      return buildAPIResponse(res).schema(GetUserResponseSchema).data(foundUser).status(200).build();
    } catch (error) {
      return next(error);
    }
  }
}
