import { CreateUserDTO } from './CreateUserDTO';
import { UpdateUserDTO } from './UpdateUserDTO';
import { UsersRepository } from './UsersRepository';
import { TransactionalEmailAPI } from '../notifications/TransactionalEmailAPI';
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

  async createUser(createUserDTO: CreateUserDTO) {
    const existingUserByEmail = await this.usersRepository.findUserByEmail(createUserDTO.email);
    if (existingUserByEmail) {
      throw new EmailAlreadyInUseException();
    }

    const existingUserByUsername = await this.usersRepository.findUserByUsername(createUserDTO.username);
    if (existingUserByUsername) {
      throw new UsernameAlreadyTakenException();
    }

    const createdUser = await this.usersRepository.createUser({
      ...createUserDTO,
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

  async updateUser(userId: number, updateUserDTO: UpdateUserDTO) {
    const foundUserById = await this.usersRepository.findUserById(userId);

    if (!foundUserById) {
      throw new UserNotFoundException();
    }

    if (updateUserDTO.email) {
      const foundUserByEmail = await this.usersRepository.findUserByEmail(updateUserDTO.email);
      // Allow passing the email unchanged
      // Only throw error if we'd try to assing the same email to a different user
      if (foundUserByEmail && foundUserByEmail.id !== foundUserById.id) {
        throw new EmailAlreadyInUseException();
      }
    }

    if (updateUserDTO.username) {
      const foundUserByUsername = await this.usersRepository.findUserByUsername(updateUserDTO.username);
      // Allow passing the username unchanged
      // Only throw error if we'd try to assing the same username to a different user
      if (foundUserByUsername && foundUserByUsername.id !== foundUserById.id) {
        throw new UsernameAlreadyTakenException();
      }
    }

    return await this.usersRepository.updateUser(userId, updateUserDTO);
  }
}