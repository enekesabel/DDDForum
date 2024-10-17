import path from 'path';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { sharedTestRoot } from '@dddforum/shared/src/paths';
import { UserInput } from '@dddforum/shared/src/modules/users';
import { UserInputBuilder } from '@dddforum/shared/tests/support/builders';
import { Application, CompositionRoot } from '../../../src/core';
import { Config, createCommand, GenericError, ValidationError } from '../../../src/shared';
import {
  EmailAlreadyInUseException,
  UserNotFoundException,
  UsernameAlreadyTakenException,
  CreateUserCommandSchema,
} from '../../../src/modules/users';
import { DatabaseFixtures } from '../../support/fixtures/DatabaseFixtures';

const feature = loadFeature(path.join(sharedTestRoot, 'features/registration.feature'), {
  tagFilter: '@unit',
});

let compositionRoot: CompositionRoot;
let application: Application;
let addEmailToListSpy: jest.SpyInstance;
let sendEmailSpy: jest.SpyInstance;
let databaseFixtures: DatabaseFixtures;

beforeAll(async () => {
  compositionRoot = CompositionRoot.Create(new Config('test:unit'));
  application = compositionRoot.getApplication();
  databaseFixtures = new DatabaseFixtures(compositionRoot);
});

beforeEach(async () => {
  await databaseFixtures.clearDatabase();
  jest.clearAllMocks();
  addEmailToListSpy = jest.spyOn(application.marketing, 'addEmailToList');
  sendEmailSpy = jest.spyOn(application.notifications, 'sendMail');
});

defineFeature(feature, (test) => {
  test('Successful registration with marketing emails accepted', ({ given, when, then, and }) => {
    let createdUser: Awaited<ReturnType<typeof application.users.createUser>>;
    let createUserInput: UserInput;

    given('I am a new user', async () => {
      createUserInput = new UserInputBuilder().withAllRandomDetails().build();
    });

    when('I register with valid account details accepting marketing emails', async () => {
      createdUser = await application.users.createUser(createUserInput);

      await application.marketing.addEmailToList(createUserInput.email);
    });

    then('I should be granted access to my account', async () => {
      expect(createdUser.id).toBeDefined();
      expect(createdUser.email).toEqual(createUserInput.email);
      expect(createdUser.firstName).toEqual(createUserInput.firstName);
      expect(createdUser.lastName).toEqual(createUserInput.lastName);
      expect(createdUser.username).toEqual(createUserInput.username);

      const newUser = await application.users.getUserByEmail(createUserInput.email);

      expect(newUser.email).toEqual(createUserInput.email);
      expect(sendEmailSpy).toHaveBeenCalledTimes(1);
    });

    and('I should expect to receive marketing emails', () => {
      expect(addEmailToListSpy).toHaveBeenCalledTimes(1);
      expect(addEmailToListSpy).toHaveBeenCalledWith(createUserInput.email);
    });
  });

  test('Successful registration without marketing emails accepted', ({ given, when, then, and }) => {
    let createdUser: Awaited<ReturnType<typeof application.users.createUser>>;
    let createUserInput: UserInput;

    given('I am a new user', async () => {
      createUserInput = new UserInputBuilder().withAllRandomDetails().build();
    });

    when('I register with valid account details declining marketing emails', async () => {
      createdUser = await application.users.createUser(createUserInput);
    });

    then('I should be granted access to my account', async () => {
      expect(createdUser.id).toBeDefined();
      expect(createdUser.email).toEqual(createUserInput.email);
      expect(createdUser.firstName).toEqual(createUserInput.firstName);
      expect(createdUser.lastName).toEqual(createUserInput.lastName);
      expect(createdUser.username).toEqual(createUserInput.username);

      const newUser = await application.users.getUserByEmail(createUserInput.email);

      expect(newUser.email).toEqual(createUserInput.email);
      expect(sendEmailSpy).toHaveBeenCalledTimes(1);
    });

    and('I should not expect to receive marketing emails', () => {
      expect(addEmailToListSpy).toHaveBeenCalledTimes(0);
    });
  });

  test('Invalid or missing registration details', ({ given, when, then, and }) => {
    let createUserInput: UserInput;
    let createdUserResult: Awaited<ReturnType<typeof application.users.createUser>> | GenericError;

    given('I am a new user', async () => {
      createUserInput = new UserInputBuilder().withEmail('').build();
    });

    when('I register with invalid account details', async () => {
      try {
        const createUserCommand = createCommand(CreateUserCommandSchema, createUserInput);
        createdUserResult = await application.users.createUser(createUserCommand);
      } catch (error) {
        createdUserResult = error as GenericError;
      }
    });

    then('I should see an error notifying me that my input is invalid', () => {
      expect(createdUserResult).toBeInstanceOf(ValidationError);
    });

    and('I should not have been sent access to account details', () => {
      expect(application.users.getUserByEmail(createUserInput.email)).rejects.toThrow(UserNotFoundException);
      expect(sendEmailSpy).toHaveBeenCalledTimes(0);
    });
  });

  test('Account already created with email', ({ given, when, then, and }) => {
    let userInputs: UserInput[] = [];
    let createUserPromises: ReturnType<typeof application.users.createUser>[] = [];

    given(
      'a set of users already created accounts',
      async (table: { firstName: string; lastName: string; email: string }[]) => {
        userInputs = table.map((row) => {
          return new UserInputBuilder()
            .withAllRandomDetails()
            .withFirstName(row.firstName)
            .withLastName(row.lastName)
            .withEmail(row.email)
            .build();
        });
        await databaseFixtures.setupWithExistingUsers(...userInputs);
      }
    );

    when('new users attempt to register with those emails', async () => {
      createUserPromises = userInputs.map((userInput) => {
        return application.users.createUser(userInput);
      });
    });

    then('they should see an error notifying them that the account already exists', async () => {
      await Promise.all(createUserPromises.map((p) => expect(p).rejects.toThrow(EmailAlreadyInUseException)));
    });

    and('they should not have been sent access to account details', () => {
      expect(sendEmailSpy).toHaveBeenCalledTimes(0);
    });
  });

  test('Username already taken', ({ given, when, then, and }) => {
    let userInputs: UserInput[] = [];
    let createUserPromises: ReturnType<typeof application.users.createUser>[] = [];

    given(
      'a set of users have already created their accounts with valid details',
      async (table: { firstName: string; lastName: string; email: string; username: string }[]) => {
        userInputs = table.map((row) => {
          return new UserInputBuilder()
            .withUsername(row.username)
            .withFirstName(row.firstName)
            .withLastName(row.lastName)
            .withEmail(row.email)
            .build();
        });
        await databaseFixtures.setupWithExistingUsers(...userInputs);
      }
    );

    when(
      'new users attempt to register with already taken usernames',
      async (table: { firstName: string; lastName: string; email: string; username: string }[]) => {
        createUserPromises = table.map((row) => {
          return application.users.createUser(
            new UserInputBuilder()
              .withEmail(row.email)
              .withUsername(row.username)
              .withFirstName(row.firstName)
              .withLastName(row.lastName)
              .build()
          );
        });
      }
    );

    then('they see an error notifying them that the username has already been taken', async () => {
      await Promise.all(createUserPromises.map((p) => expect(p).rejects.toThrow(UsernameAlreadyTakenException)));
    });

    and('they should not have been sent access to account details', () => {
      expect(sendEmailSpy).toHaveBeenCalledTimes(0);
    });
  });
});
