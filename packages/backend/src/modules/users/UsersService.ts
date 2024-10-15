import { TransactionalEmailAPI } from '../notifications';
import { CreateUserCommand } from './CreateUserCommand';
import { UsersRepository } from './ports/UsersRepository';
import { UpdateUserCommand } from './UpdateUserCommand';
import { EmailAlreadyInUseException, UsernameAlreadyTakenException, UserNotFoundException } from './usersExceptions';

function generateRandomPassword(length: number): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  const passwordArray = [];

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    passwordArray.push(charset[randomIndex]);
  }

  return passwordArray.join('');
}

export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private transactionalEmailAPI: TransactionalEmailAPI
  ) {}

  async createUser(createUserCommand: CreateUserCommand) {
    const existingUserByEmail = await this.usersRepository.findUserByEmail(createUserCommand.email);
    if (existingUserByEmail) {
      throw new EmailAlreadyInUseException();
    }

    const existingUserByUsername = await this.usersRepository.findUserByUsername(createUserCommand.username);
    if (existingUserByUsername) {
      throw new UsernameAlreadyTakenException();
    }

    const createdUser = await this.usersRepository.createUser({
      ...createUserCommand,
      password: generateRandomPassword(10),
    });

    await this.transactionalEmailAPI.sendMail({
      to: createdUser.email,
      subject: 'Welcome to DDD Forum',
      text: `Welcome to DDDForum. You can login with the following details </br>
      email: ${createdUser.email}
      password: ${createdUser.password}`,
    });

    return createdUser;
  }

  async getUserByEmail(email: string) {
    const foundUser = await this.usersRepository.findUserByEmail(email);

    if (!foundUser) {
      throw new UserNotFoundException();
    }

    return foundUser;
  }

  async getUserById(userId: number) {
    const foundUserById = await this.usersRepository.findUserById(userId);

    if (!foundUserById) {
      throw new UserNotFoundException();
    }

    return foundUserById;
  }

  async updateUser(userId: number, updateUserCommand: UpdateUserCommand) {
    const foundUserById = await this.usersRepository.findUserById(userId);

    if (!foundUserById) {
      throw new UserNotFoundException();
    }

    if (updateUserCommand.email) {
      const foundUserByEmail = await this.usersRepository.findUserByEmail(updateUserCommand.email);
      // Allow passing the email unchanged
      // Only throw error if we'd try to assing the same email to a different user
      if (foundUserByEmail && foundUserByEmail.id !== foundUserById.id) {
        throw new EmailAlreadyInUseException();
      }
    }

    if (updateUserCommand.username) {
      const foundUserByUsername = await this.usersRepository.findUserByUsername(updateUserCommand.username);
      // Allow passing the username unchanged
      // Only throw error if we'd try to assing the same username to a different user
      if (foundUserByUsername && foundUserByUsername.id !== foundUserById.id) {
        throw new UsernameAlreadyTakenException();
      }
    }

    return await this.usersRepository.updateUser(userId, updateUserCommand);
  }
}
