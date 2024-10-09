import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import {
  CreateUserResponseSchema,
  GetUserResponseSchema,
  UpdateUserResponseSchema,
} from '@dddforum/shared/src/modules/users';
import { buildAPIResponse, ClientError, Controller, createCommand } from '../../shared';
import { CreateUserCommandSchema } from './CreateUserCommand';
import { UpdateUserCommandSchema } from './UpdateUserCommand';
import { UsersService } from './UsersService';

export class UsersController extends Controller {
  constructor(
    private usersService: UsersService,
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
      const createUserCommand = createCommand(CreateUserCommandSchema, req.body);

      const user = await this.usersService.createUser(createUserCommand);

      return buildAPIResponse(res).schema(CreateUserResponseSchema).data(user).status(201).build();
    } catch (error) {
      next(error);
    }
  }

  private async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.params.userId);
      const updateUserCommand = createCommand(UpdateUserCommandSchema, req.body);

      const updatedUser = await this.usersService.updateUser(userId, updateUserCommand);

      return buildAPIResponse(res).schema(UpdateUserResponseSchema).data(updatedUser).status(200).build();
    } catch (error) {
      return next(error);
    }
  }

  private async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.query;

      if (!email) {
        return next(new ClientError());
      }

      const foundUser = await this.usersService.getUserByEmail(String(email));

      return buildAPIResponse(res).schema(GetUserResponseSchema).data(foundUser).status(200).build();
    } catch (error) {
      return next(error);
    }
  }
}
