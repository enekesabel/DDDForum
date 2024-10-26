import { UserInput } from '@dddforum/shared/src/modules/users';
import { UserInputBuilder } from '@dddforum/shared/tests/support';
import { faker } from '@faker-js/faker';
import { UsersRepository } from '../../../src/modules/users';

export class UserBuilder {
  private usersRepository: UsersRepository;

  constructor(usersRepository: UsersRepository) {
    this.usersRepository = usersRepository;
  }

  fromUserInput(userInput: UserInput) {
    this.userInputBuilder = UserInputBuilder.FromUserInput(userInput);
    return this;
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
