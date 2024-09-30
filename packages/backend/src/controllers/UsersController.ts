import { Request, Response, NextFunction } from 'express';
import {
  generateRandomPassword,
  isValidCreateUserInput,
  isValidUpdateUserInput,
  parseUserForResponse,
  ResponseBuilder,
} from '../utils';
import { createUser, findUserByEmail, findUserById, findUserByUsername, updateUser } from '../database';
import { Controller } from './Controller';
import {
  EmailAlreadyInUseException,
  UserNotFoundException,
  UsernameAlreadyTakenException,
} from '@dddforum/shared/src/errors/exceptions';
import { ClientError, ValidationError } from '@dddforum/shared/src/errors/errors';

export class UsersController extends Controller {
  protected setupRoutes(): void {
    this.router.post('/new', this.createUser.bind(this));
    this.router.post('/edit/:userId', this.updateUser.bind(this));
    this.router.get('/', this.getUser.bind(this));
  }

  private async createUser(req: Request, res: Response, next: NextFunction) {
    const userData = req.body;

    if (!isValidCreateUserInput(req.body)) {
      return next(new ValidationError());
    }

    const existingUserByEmail = await findUserByEmail(req.body.email);
    if (existingUserByEmail) {
      return next(new EmailAlreadyInUseException());
    }

    const existingUserByUsername = await findUserByUsername(req.body.username);
    if (existingUserByUsername) {
      return next(new UsernameAlreadyTakenException());
    }

    const user = await createUser({
      ...userData,
      password: generateRandomPassword(10),
    });

    return new ResponseBuilder(res).data(parseUserForResponse(user)).status(201).build();
  }

  private async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      // excluding id and password from user data
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, password, ...userData } = req.body;

      if (!isValidUpdateUserInput(userData)) {
        return next(new ValidationError());
      }

      const foundUserById = await findUserById(Number(req.params.userId));

      if (!foundUserById) {
        return next(new UserNotFoundException());
      }

      if (userData.email) {
        const foundUserByEmail = await findUserByEmail(userData.email);
        // Allow passing the email unchanged
        // Only throw error if we'd try to assing the same email to a different user
        if (foundUserByEmail && foundUserByEmail.id !== foundUserById.id) {
          return next(new EmailAlreadyInUseException());
        }
      }

      if (userData.username) {
        const foundUserByUsername = await findUserByUsername(userData.username);
        // Allow passing the username unchanged
        // Only throw error if we'd try to assing the same username to a different user
        if (foundUserByUsername && foundUserByUsername.id !== foundUserById.id) {
          return next(new UsernameAlreadyTakenException());
        }
      }

      const updatedUser = await updateUser(Number(req.params.userId), userData);

      return new ResponseBuilder(res).data(parseUserForResponse(updatedUser)).status(200).build();
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

      const foundUser = await findUserByEmail(String(email));

      if (!foundUser) {
        return next(new UserNotFoundException());
      }

      return new ResponseBuilder(res).data(parseUserForResponse(foundUser)).status(200).build();
    } catch (error) {
      return next(error);
    }
  }
}
