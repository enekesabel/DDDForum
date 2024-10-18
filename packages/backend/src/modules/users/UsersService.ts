import { NotificationsService } from '../notifications';
import { CreateUserCommand } from './CreateUserCommand';
import { GetUserQuery } from './GetUserQuery';
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
    private notificationsService: NotificationsService
  ) {}

  async createUser(createUserCommand: CreateUserCommand) {
    const existingUserByEmail = await this.usersRepository.findUserByEmail(createUserCommand.value.email);
    if (existingUserByEmail) {
      throw new EmailAlreadyInUseException();
    }

    const existingUserByUsername = await this.usersRepository.findUserByUsername(createUserCommand.value.username);
    if (existingUserByUsername) {
      throw new UsernameAlreadyTakenException();
    }

    const createdUser = await this.usersRepository.createUser({
      ...createUserCommand.value,
      password: generateRandomPassword(10),
    });

    await this.notificationsService.sendMail(
      createdUser.email,
      'Welcome to DDD Forum',
      `Welcome to DDDForum. You can login with the following details </br>
      email: ${createdUser.email}
      password: ${createdUser.password}`
    );

    return createdUser;
  }

  async getUser(getUserQuery: GetUserQuery) {
    const foundUser = await this.usersRepository.findUserByEmail(getUserQuery.value);

    if (!foundUser) {
      throw new UserNotFoundException();
    }

    return foundUser;
  }

  async updateUser(updateUserCommand: UpdateUserCommand) {
    const { userId, ...userData } = updateUserCommand.value;

    const foundUserById = await this.usersRepository.findUserById(userId);

    if (!foundUserById) {
      throw new UserNotFoundException();
    }

    if (userData.email) {
      const foundUserByEmail = await this.usersRepository.findUserByEmail(userData.email);
      // Allow passing the email unchanged
      // Only throw error if we'd try to assing the same email to a different user
      if (foundUserByEmail && foundUserByEmail.id !== foundUserById.id) {
        throw new EmailAlreadyInUseException();
      }
    }

    if (userData.username) {
      const foundUserByUsername = await this.usersRepository.findUserByUsername(userData.username);
      // Allow passing the username unchanged
      // Only throw error if we'd try to assing the same username to a different user
      if (foundUserByUsername && foundUserByUsername.id !== foundUserById.id) {
        throw new UsernameAlreadyTakenException();
      }
    }

    return await this.usersRepository.updateUser(userId, userData);
  }
}
