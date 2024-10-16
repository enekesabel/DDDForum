import { UserInput } from '@dddforum/shared/src/modules/users';
import { UserInputBuilder } from '@dddforum/shared/tests/support/builders';
import { faker } from '@faker-js/faker';
import { UsersRepository } from '../../../src/modules/users/ports/UsersRepository';

export class UserBuilder {
  private usersRepository: UsersRepository;

  constructor(usersRepository: UsersRepository) {
    this.usersRepository = usersRepository;
  }

  static FromUserInput(userInput: UserInput, usersRepository: UsersRepository) {
    const builder = new UserBuilder(usersRepository);
    builder.userInputBuilder = UserInputBuilder.FromUserInput(userInput);
    return builder;
  }

  private userInputBuilder = new UserInputBuilder();

  withAllRandomDetails() {
    this.userInputBuilder.withAllRandomDetails();
    return this;
  }

  async build() {
    const userInput = this.userInputBuilder.build();
    return await this.usersRepository.createUser({
      ...userInput,
      password: faker.internet.password(),
    });
  }
}
