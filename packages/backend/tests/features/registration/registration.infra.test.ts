import path from 'path';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { sharedTestRoot } from '@dddforum/shared/src/paths';
import { UserInput } from '@dddforum/shared/src/modules/users';
import { UserInputBuilder } from '@dddforum/shared/tests/support';
import { createRequest } from 'node-mocks-http';
import { Application, CompositionRoot } from '../../../src/core';
import { Config, InvalidRequestBodyException, ValidationErrorException } from '../../../src/shared';
import {
  EmailAlreadyInUseException,
  UsernameAlreadyTakenException,
  CreateUserCommand,
  GetUserQuery,
} from '../../../src/modules/users';
import { DatabaseFixtures } from '../../support';
import { AddToEmailListCommand } from '../../../src/modules/marketing';

const feature = loadFeature(path.join(sharedTestRoot, 'features/registration.feature'), {
  tagFilter: '@infra',
});

let compositionRoot: CompositionRoot;
let application: Application;
let addEmailToListSpy: jest.SpyInstance;
let sendEmailSpy: jest.SpyInstance;
let saveUserSpy: jest.SpyInstance;
let databaseFixtures: DatabaseFixtures;

beforeAll(async () => {
  compositionRoot = CompositionRoot.Create(new Config('test:infra'));
  application = compositionRoot.getApplication();
  databaseFixtures = new DatabaseFixtures(compositionRoot);
});

beforeEach(async () => {
  await databaseFixtures.clearDatabase();
  jest.clearAllMocks();
  addEmailToListSpy = jest.spyOn(application.marketing, 'addEmailToList');
  sendEmailSpy = jest.spyOn(application.notifications, 'sendMail');
  saveUserSpy = jest.spyOn(compositionRoot.usersModule.getUsersRepository(), 'createUser');
});

defineFeature(feature, (test) => {
  test('Successful registration with marketing emails accepted', ({ given, when, then, and }) => {
    let createdUser: Awaited<ReturnType<typeof application.users.createUser>>;
    let createUserInput: UserInput;
    let command: AddToEmailListCommand;

    given('I am a new user', async () => {
      createUserInput = new UserInputBuilder().withAllRandomDetails().build();
    });

    when('I register with valid account details accepting marketing emails', async () => {
      createdUser = await application.users.createUser(CreateUserCommand.Create(createUserInput));
      command = AddToEmailListCommand.Create(createdUser.email);

      await application.marketing.addEmailToList(command);
    });

    then('I should be granted access to my account', async () => {
      expect(createdUser.id).toBeDefined();
      expect(createdUser.email).toEqual(createUserInput.email);
      expect(createdUser.firstName).toEqual(createUserInput.firstName);
      expect(createdUser.lastName).toEqual(createUserInput.lastName);
      expect(createdUser.username).toEqual(createUserInput.username);

      const newUser = await application.users.getUser(GetUserQuery.Create(createUserInput.email));

      expect(newUser.email).toEqual(createUserInput.email);
      expect(sendEmailSpy).toHaveBeenCalledTimes(1);
      expect(saveUserSpy).toHaveBeenCalledTimes(1);
    });

    and('I should expect to receive marketing emails', () => {
      expect(addEmailToListSpy).toHaveBeenCalledTimes(1);
      expect(addEmailToListSpy).toHaveBeenCalledWith(command);
    });
  });

  test('Successful registration without marketing emails accepted', ({ given, when, then, and }) => {
    let createdUser: Awaited<ReturnType<typeof application.users.createUser>>;
    let createUserInput: UserInput;

    given('I am a new user', async () => {
      createUserInput = new UserInputBuilder().withAllRandomDetails().build();
    });

    when('I register with valid account details declining marketing emails', async () => {
      createdUser = await application.users.createUser(CreateUserCommand.Create(createUserInput));
    });

    then('I should be granted access to my account', async () => {
      expect(createdUser.id).toBeDefined();
      expect(createdUser.email).toEqual(createUserInput.email);
      expect(createdUser.firstName).toEqual(createUserInput.firstName);
      expect(createdUser.lastName).toEqual(createUserInput.lastName);
      expect(createdUser.username).toEqual(createUserInput.username);

      const newUser = await application.users.getUser(GetUserQuery.Create(createUserInput.email));

      expect(newUser.email).toEqual(createUserInput.email);
      expect(sendEmailSpy).toHaveBeenCalledTimes(1);
      expect(saveUserSpy).toHaveBeenCalledTimes(1);
    });

    and('I should not expect to receive marketing emails', () => {
      expect(addEmailToListSpy).toHaveBeenCalledTimes(0);
    });
  });

  test('Invalid or missing registration details', ({ given, when, then, and }) => {
    let createUserInput: UserInput;
    let createdUserResult: Awaited<ReturnType<typeof application.users.createUser>> | InvalidRequestBodyException;

    given('I am a new user', async () => {
      createUserInput = new UserInputBuilder().withEmail('').build();
    });

    when('I register with invalid account details', async () => {
      try {
        const request = createRequest({ body: createUserInput });
        const createUserCommand = CreateUserCommand.FromRequest(request);
        createdUserResult = await application.users.createUser(createUserCommand);
      } catch (error) {
        createdUserResult = error as InvalidRequestBodyException;
      }
    });

    then('I should see an error notifying me that my input is invalid', () => {
      expect(createdUserResult).toBeInstanceOf(InvalidRequestBodyException);
    });

    and('I should not have been sent access to account details', async () => {
      let error: ValidationErrorException | null = null;
      try {
        await application.users.getUser(GetUserQuery.Create(createUserInput.email));
      } catch (e) {
        error = e as ValidationErrorException;
      }

      expect(error).toBeInstanceOf(ValidationErrorException);
      expect(sendEmailSpy).toHaveBeenCalledTimes(0);
      expect(saveUserSpy).toHaveBeenCalledTimes(0);
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
        saveUserSpy.mockClear();
      }
    );

    when('new users attempt to register with those emails', async () => {
      createUserPromises = userInputs.map((userInput) => {
        return application.users.createUser(CreateUserCommand.Create(userInput));
      });
    });

    then('they should see an error notifying them that the account already exists', async () => {
      await Promise.all(createUserPromises.map((p) => expect(p).rejects.toThrow(EmailAlreadyInUseException)));
    });

    and('they should not have been sent access to account details', () => {
      expect(sendEmailSpy).toHaveBeenCalledTimes(0);
      expect(saveUserSpy).toHaveBeenCalledTimes(0);
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
        saveUserSpy.mockClear();
      }
    );

    when(
      'new users attempt to register with already taken usernames',
      async (table: { firstName: string; lastName: string; email: string; username: string }[]) => {
        createUserPromises = table.map((row) => {
          return application.users.createUser(
            CreateUserCommand.Create(
              new UserInputBuilder()
                .withEmail(row.email)
                .withUsername(row.username)
                .withFirstName(row.firstName)
                .withLastName(row.lastName)
                .build()
            )
          );
        });
      }
    );

    then('they see an error notifying them that the username has already been taken', async () => {
      await Promise.all(createUserPromises.map((p) => expect(p).rejects.toThrow(UsernameAlreadyTakenException)));
    });

    and('they should not have been sent access to account details', () => {
      expect(sendEmailSpy).toHaveBeenCalledTimes(0);
      expect(saveUserSpy).toHaveBeenCalledTimes(0);
    });
  });
});
