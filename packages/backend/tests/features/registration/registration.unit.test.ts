import path from 'path';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { sharedTestRoot } from '@dddforum/shared/src/paths';
import { UserInput } from '@dddforum/shared/src/modules/users';
import { UserInputBuilder } from '@dddforum/shared/tests/support/builders';
import { Application, CompositionRoot } from '../../../src/core';
import { Config, createCommand, GenericError, ValidationError } from '../../../src/shared';
import { UserNotFoundException } from '../../../src/modules/users';
import { CreateUserCommandSchema } from '../../../src/modules/users/CreateUserCommand';

const feature = loadFeature(path.join(sharedTestRoot, 'features/registration.feature'), {
  tagFilter: '@unit',
});

let compositionRoot: CompositionRoot;
let application: Application;
let addEmailToListSpy: jest.SpyInstance;
let sendEmailSpy: jest.SpyInstance;

beforeEach(async () => {
  jest.clearAllMocks();
  addEmailToListSpy = jest.spyOn(application.marketing, 'addEmailToList');
  sendEmailSpy = jest.spyOn(application.notifications, 'sendMail');
});

beforeAll(async () => {
  compositionRoot = CompositionRoot.Create(new Config('test:unit'));
  application = compositionRoot.getApplication();
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
});
