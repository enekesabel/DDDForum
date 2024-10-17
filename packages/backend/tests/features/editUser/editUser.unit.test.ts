import path from 'path';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { sharedTestRoot } from '@dddforum/shared/src/paths';
import { User, UserInput } from '@dddforum/shared/src/modules/users';
import { UserInputBuilder } from '@dddforum/shared/tests/support';
import { Application, CompositionRoot } from '../../../src/core';
import { Config } from '../../../src/shared';
import { DatabaseFixtures } from '../../support';
import {
  EmailAlreadyInUseException,
  UserNotFoundException,
  UsernameAlreadyTakenException,
} from '../../../src/modules/users';

const feature = loadFeature(path.join(sharedTestRoot, 'features/editUser.feature'), {
  tagFilter: '@unit',
});

let application: Application;
let databaseFixtures: DatabaseFixtures;

beforeAll(async () => {
  const compositionRoot = CompositionRoot.Create(new Config('test:unit'));
  application = compositionRoot.getApplication();
  databaseFixtures = new DatabaseFixtures(compositionRoot);
});

beforeEach(async () => {
  await databaseFixtures.clearDatabase();
});

defineFeature(feature, (test) => {
  test('Successful user edit', ({ given, when, then }) => {
    let updatedUser: User;
    let updateUserInput: UserInput;
    let userId: number;

    given('I am a registered user', async () => {
      const createUserInput = new UserInputBuilder().withAllRandomDetails().build();
      const createdUsers = await databaseFixtures.setupWithExistingUsers(createUserInput);
      userId = createdUsers[0].id;
    });

    when('I try to update my user details using valid data', async () => {
      updateUserInput = new UserInputBuilder().withAllRandomDetails().build();
      updatedUser = await application.users.updateUser(userId, updateUserInput);
    });

    then('my user details should be updated successfully', async () => {
      expect(updatedUser.id).toBe(userId);
      expect(updatedUser.firstName).toBe(updateUserInput.firstName);
      expect(updatedUser.lastName).toBe(updateUserInput.lastName);
      expect(updatedUser.username).toBe(updateUserInput.username);
      expect(updatedUser.email).toBe(updateUserInput.email);
    });
  });

  test('User not found', ({ given, when, then }) => {
    let updatedUser: User | undefined;
    let error: UserNotFoundException;

    given('I am a registered user', async () => {
      const createUserInput = new UserInputBuilder().withAllRandomDetails().build();
      await databaseFixtures.setupWithExistingUsers(createUserInput);
    });

    when('I attempt to edit a user that does not exist', async () => {
      try {
        updatedUser = await application.users.updateUser(999999, new UserInputBuilder().withAllRandomDetails().build());
      } catch (e) {
        error = e as UserNotFoundException;
      }
    });

    then('I should receive an error indicating the user was not found', () => {
      expect(updatedUser).toBeUndefined();
      expect(error).toBeInstanceOf(UserNotFoundException);
    });
  });

  test('Email already in use', ({ given, and, when, then }) => {
    let updatedUser: User | undefined;
    let userId: number;
    let error: EmailAlreadyInUseException;

    given(/^I am a registered user with email "(.*)"$/, async (email: string) => {
      const createUserInput = new UserInputBuilder().withAllRandomDetails().withEmail(email).build();
      const createdUsers = await databaseFixtures.setupWithExistingUsers(createUserInput);
      userId = createdUsers[0].id;
    });

    and(/^another user exists with email "(.*)"$/, async (anotherEmail: string) => {
      const createUserInput = new UserInputBuilder().withAllRandomDetails().withEmail(anotherEmail).build();
      await databaseFixtures.setupWithExistingUsers(createUserInput);
    });

    when(/^I attempt to update my email to "(.*)"$/, async (newEmail: string) => {
      try {
        updatedUser = await application.users.updateUser(userId, { email: newEmail });
      } catch (e) {
        error = e as EmailAlreadyInUseException;
      }
    });

    then('I should receive an error indicating the email is already in use', () => {
      expect(updatedUser).toBeUndefined();
      expect(error).toBeInstanceOf(EmailAlreadyInUseException);
    });
  });

  test('Username already taken', ({ given, and, when, then }) => {
    let updatedUser: User | undefined;
    let userId: number;
    let error: UsernameAlreadyTakenException;

    given(/^I am a registered user with username "(.*)"$/, async (username: string) => {
      const createUserInput = new UserInputBuilder().withAllRandomDetails().withUsername(username).build();
      const createdUsers = await databaseFixtures.setupWithExistingUsers(createUserInput);
      userId = createdUsers[0].id;
    });

    and(/^another user exists with username "(.*)"$/, async (anotherUsername: string) => {
      const createUserInput = new UserInputBuilder().withAllRandomDetails().withUsername(anotherUsername).build();
      await databaseFixtures.setupWithExistingUsers(createUserInput);
    });

    when(/^I attempt to update my username to "(.*)"$/, async (newUsername: string) => {
      try {
        updatedUser = await application.users.updateUser(userId, { username: newUsername });
      } catch (e) {
        error = e as UsernameAlreadyTakenException;
      }
    });

    then('I should receive an error indicating the username is already taken', () => {
      expect(updatedUser).toBeUndefined();
      expect(error).toBeInstanceOf(UsernameAlreadyTakenException);
    });
  });
});
