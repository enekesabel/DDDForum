import { UserInput } from '@dddforum/shared/src/modules/users';
import { UserInputBuilder } from '@dddforum/shared/tests/support/builders/UserInputBuilder';
import { faker } from '@faker-js/faker';
import { prisma } from '../../../src/shared';

export class UserBuilder {
  static FromUserInput(userInput: UserInput) {
    const builder = new UserBuilder();
    builder.userInputBuilder = UserInputBuilder.FromUserInput(userInput);
    return builder;
  }

  private userInputBuilder = new UserInputBuilder();

  withAllRandomDetails() {
    this.userInputBuilder.withAllRandomDetails();
    return this;
  }

  build() {
    const userInput = this.userInputBuilder.build();
    return prisma.user.create({
      data: {
        ...userInput,
        member: {
          create: {},
        },
        password: faker.internet.password(),
      },
      include: {
        member: true,
      },
    });
  }
}
