import { Request, Response, NextFunction } from 'express';
import { generateRandomPassword, parseUserForResponse, ResponseBuilder } from '../utils';
import { createUser, findUserByEmail, findUserById, findUserByUsername, updateUser } from '../database';
import { Controller } from './Controller';
import {
  EmailAlreadyInUseException,
  UserNotFoundException,
  UsernameAlreadyTakenException,
} from '@dddforum/shared/src/errors/exceptions';
import { ClientError } from '@dddforum/shared/src/errors/errors';
import { CreateUserDTO } from '../dtos/CreateUserDTO';
import { UpdateUserDTO } from '../dtos/UpdateUserDTO';

export class UsersController extends Controller {
  protected setupRoutes(): void {
    this.router.post('/new', this.createUser.bind(this));
    this.router.post('/edit/:userId', this.updateUser.bind(this));
    this.router.get('/', this.getUser.bind(this));
  }

  private async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const createUserDTO = CreateUserDTO.Create({ ...req.body, password: generateRandomPassword(10) });

      const existingUserByEmail = await findUserByEmail(createUserDTO.email);
      if (existingUserByEmail) {
        return next(new EmailAlreadyInUseException());
      }

      const existingUserByUsername = await findUserByUsername(createUserDTO.username);
      if (existingUserByUsername) {
        return next(new UsernameAlreadyTakenException());
      }

      const user = await createUser(createUserDTO);

      return new ResponseBuilder(res).data(parseUserForResponse(user)).status(201).build();
    } catch (error) {
      return next(error);
    }
  }

  private async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const updateUserDTO = UpdateUserDTO.Create(req.body);
      const userId = Number(req.params.userId);

      const foundUserById = await findUserById(userId);

      if (!foundUserById) {
        return next(new UserNotFoundException());
      }

      if (updateUserDTO.email) {
        const foundUserByEmail = await findUserByEmail(updateUserDTO.email);
        // Allow passing the email unchanged
        // Only throw error if we'd try to assing the same email to a different user
        if (foundUserByEmail && foundUserByEmail.id !== foundUserById.id) {
          return next(new EmailAlreadyInUseException());
        }
      }

      if (updateUserDTO.username) {
        const foundUserByUsername = await findUserByUsername(updateUserDTO.username);
        // Allow passing the username unchanged
        // Only throw error if we'd try to assing the same username to a different user
        if (foundUserByUsername && foundUserByUsername.id !== foundUserById.id) {
          return next(new UsernameAlreadyTakenException());
        }
      }

      const updatedUser = await updateUser(userId, updateUserDTO);

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
