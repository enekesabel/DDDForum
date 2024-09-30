import {
  EmailAlreadyInUseException,
  UsernameAlreadyTakenException,
  UserNotFoundException,
} from '@dddforum/shared/src/errors/exceptions';
import { findUserByEmail, findUserByUsername, createUser, findUserById, updateUser } from '../database';
import { CreateUserDTO } from '../dtos/CreateUserDTO';
import { UpdateUserDTO } from '../dtos/UpdateUserDTO';

export class UsersService {
  async createUser(createUserDTO: CreateUserDTO) {
    const existingUserByEmail = await findUserByEmail(createUserDTO.email);
    if (existingUserByEmail) {
      throw new EmailAlreadyInUseException();
    }

    const existingUserByUsername = await findUserByUsername(createUserDTO.username);
    if (existingUserByUsername) {
      throw new UsernameAlreadyTakenException();
    }

    return await createUser(createUserDTO);
  }

  async getUserByEmail(email: string) {
    const foundUser = await findUserByEmail(email);

    if (!foundUser) {
      throw new UserNotFoundException();
    }

    return foundUser;
  }

  async getUserById(userId: number) {
    const foundUserById = await findUserById(userId);

    if (!foundUserById) {
      throw new UserNotFoundException();
    }

    return foundUserById;
  }

  async updateUser(userId: number, updateUserDTO: UpdateUserDTO) {
    const foundUserById = await findUserById(userId);

    if (!foundUserById) {
      throw new UserNotFoundException();
    }

    if (updateUserDTO.email) {
      const foundUserByEmail = await findUserByEmail(updateUserDTO.email);
      // Allow passing the email unchanged
      // Only throw error if we'd try to assing the same email to a different user
      if (foundUserByEmail && foundUserByEmail.id !== foundUserById.id) {
        throw new EmailAlreadyInUseException();
      }
    }

    if (updateUserDTO.username) {
      const foundUserByUsername = await findUserByUsername(updateUserDTO.username);
      // Allow passing the username unchanged
      // Only throw error if we'd try to assing the same username to a different user
      if (foundUserByUsername && foundUserByUsername.id !== foundUserById.id) {
        throw new UsernameAlreadyTakenException();
      }
    }

    return await updateUser(userId, updateUserDTO);
  }
}
