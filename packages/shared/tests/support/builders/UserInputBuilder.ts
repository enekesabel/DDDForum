import { faker } from '@faker-js/faker';
import { UserInput } from '../../../src/modules/users';

export class UserInputBuilder {
  static FromUserInput(userInput: UserInput) {
    const builder = new UserInputBuilder();
    builder.props = {
      firstName: userInput.firstName,
      lastName: userInput.lastName,
      email: userInput.email,
      username: userInput.username,
    };
    return builder;
  }

  private props: UserInput;

  constructor() {
    this.props = {
      firstName: '',
      lastName: '',
      email: '',
      username: '',
    };
  }

  public withAllRandomDetails() {
    this.withFirstName(faker.person.firstName());
    this.withLastName(faker.person.lastName());
    this.withEmail(faker.internet.email());
    this.withUsername(faker.internet.userName());
    return this;
  }

  public withFirstName(firstName: string) {
    this.props = {
      ...this.props,
      firstName,
    };
    return this;
  }

  public withLastName(lastName: string) {
    this.props = {
      ...this.props,
      lastName,
    };
    return this;
  }

  public withEmail(email: string) {
    this.props = {
      ...this.props,
      email,
    };
    return this;
  }

  public withUsername(username: string) {
    this.props = {
      ...this.props,
      username,
    };
    return this;
  }

  public build() {
    return this.props;
  }
}
