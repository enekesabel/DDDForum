import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { User } from '@prisma/client';
import { CreateUserResponse, GetUserResponse, UpdateUserResponse } from '@dddforum/shared/src/modules/users';
import { ClientError, Controller, ResponseBuilder } from '../../shared';
import { CreateUserDTO } from './CreateUserDTO';
import { UpdateUserDTO } from './UpdateUserDTO';
import { UsersService } from './UsersService';

// We don't want to return the password within the request
function parseUserForResponse(user: User): Omit<User, 'password'> {
  const returnData = JSON.parse(JSON.stringify(user));
  delete returnData.password;
  return returnData;
}

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
      const createUserDTO = CreateUserDTO.Create(req.body);

      const user = await this.usersService.createUser(createUserDTO);

      const parsedUser = parseUserForResponse(user);

      return new ResponseBuilder<CreateUserResponse>(res).data(parsedUser).status(201).build();
    } catch (error) {
      next(error);
    }
  }

  private async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.params.userId);
      const updateUserDTO = UpdateUserDTO.Create(req.body);

      const updatedUser = await this.usersService.updateUser(userId, updateUserDTO);

      return new ResponseBuilder<UpdateUserResponse>(res).data(parseUserForResponse(updatedUser)).status(200).build();
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

      return new ResponseBuilder<GetUserResponse>(res).data(parseUserForResponse(foundUser)).status(200).build();
    } catch (error) {
      return next(error);
    }
  }
}
