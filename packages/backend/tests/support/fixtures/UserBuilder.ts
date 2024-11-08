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

  withEmail(email: string) {
    this.userInputBuilder.withEmail(email);
    return this;
  }

  withFirstName(firstName: string) {
    this.userInputBuilder.withFirstName(firstName);
    return this;
  }

  withLastName(lastName: string) {
    this.userInputBuilder.withLastName(lastName);
    return this;
  }

  withUsername(username: string) {
    this.userInputBuilder.withUsername(username);
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
