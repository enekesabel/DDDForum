import path from 'path';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { sharedTestRoot } from '@dddforum/shared/src/paths';
import { UpdateUserResponse, UserInput, UserExceptions } from '@dddforum/shared/src/modules/users';
import { APIClient } from '@dddforum/shared/src/core';
import { UserInputBuilder } from '@dddforum/shared/tests/support/builders';
import { GenericErrors } from '@dddforum/shared/src/shared';
import { DatabaseFixtures } from '../../support/fixtures/DatabaseFixtures';
import { CompositionRoot } from '../../../src/core';
import { Config } from '../../../src/shared';

const feature = loadFeature(path.join(sharedTestRoot, 'features/editUser.feature'), {
  tagFilter: '@e2e',
});

let apiClient: APIClient;
let databaseFixtures: DatabaseFixtures;
let compositionRoot: CompositionRoot;

beforeAll(async () => {
  compositionRoot = CompositionRoot.Create(new Config('test:e2e'));
  databaseFixtures = new DatabaseFixtures(compositionRoot);
  await databaseFixtures.clearDatabase();
  await compositionRoot.getWebServer().start();
  const app = compositionRoot.getWebServer().getServer();
  apiClient = APIClient.FromServer(app);
});

afterAll(async () => {
  await compositionRoot.getWebServer().stop();
});

defineFeature(feature, (test) => {
  test('Successful user edit', ({ given, when, then }) => {
    let updateUserResponse: UpdateUserResponse;
    let updateUserInput: UserInput;
    let userId: number;

    given('I am a registered user', async () => {
      const createUserInput = new UserInputBuilder().withAllRandomDetails().build();
      const createdUsers = await databaseFixtures.setupWithExistingUsers(createUserInput);
      userId = createdUsers[0].id;
    });

    when('I try to update my user details using valid data', async () => {
      updateUserInput = new UserInputBuilder().withAllRandomDetails().build();
      updateUserResponse = await apiClient.users.editUser(userId, updateUserInput);
    });

    then('my user details should be updated successfully', async () => {
      expect(updateUserResponse.success).toBe(true);
      expect(updateUserResponse.data?.id).toBe(userId);
      expect(updateUserResponse.data?.firstName).toBe(updateUserInput.firstName);
      expect(updateUserResponse.data?.lastName).toBe(updateUserInput.lastName);
      expect(updateUserResponse.data?.username).toBe(updateUserInput.username);
      expect(updateUserResponse.data?.email).toBe(updateUserInput.email);
    });
  });

  test('Invalid or missing user data', ({ given, when, then, and }) => {
    let updateUserResponse: UpdateUserResponse;
    let userId: number;

    given('I am a registered user', async () => {
      const createUserInput = new UserInputBuilder().withAllRandomDetails().build();
      const createdUsers = await databaseFixtures.setupWithExistingUsers(createUserInput);
      userId = createdUsers[0].id;
    });

    when('I try to update my user details using invalid data', async () => {
      const invalidUserInput = new UserInputBuilder().withEmail('').build();
      updateUserResponse = await apiClient.users.editUser(userId, invalidUserInput);
    });

    then('I should receive an error indicating the request was invalid', () => {
      expect(updateUserResponse.success).toBe(false);
      expect(updateUserResponse.error).toMatchObject({ code: GenericErrors.enum.ValidationError });
    });

    and(`My user details shouldn't be updated`, async () => {
      expect(updateUserResponse.data).toBeUndefined();
    });
  });

  test('User not found', ({ given, when, then }) => {
    let updateUserResponse: UpdateUserResponse;

    given('I am a registered user', async () => {
      const createUserInput = new UserInputBuilder().withAllRandomDetails().build();
      await databaseFixtures.setupWithExistingUsers(createUserInput);
    });

    when('I attempt to edit a user that does not exist', async () => {
      updateUserResponse = await apiClient.users.editUser(
        999999,
        new UserInputBuilder().withAllRandomDetails().build()
      );
    });

    then('I should receive an error indicating the user was not found', () => {
      expect(updateUserResponse.error).toMatchObject({ code: UserExceptions.enum.UserNotFound });
    });
  });

  test('Email already in use', ({ given, and, when, then }) => {
    let updateUserResponse: UpdateUserResponse;
    let userId: number;

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
      updateUserResponse = await apiClient.users.editUser(userId, { email: newEmail });
    });

    then('I should receive an error indicating the email is already in use', () => {
      expect(updateUserResponse.error).toMatchObject({ code: UserExceptions.enum.EmailAlreadyInUse });
    });
  });

  test('Username already taken', ({ given, and, when, then }) => {
    let updateUserResponse: UpdateUserResponse;
    let userId: number;

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
      updateUserResponse = await apiClient.users.editUser(userId, { username: newUsername });
    });

    then('I should receive an error indicating the username is already taken', () => {
      expect(updateUserResponse.error).toMatchObject({ code: UserExceptions.enum.UsernameAlreadyTaken });
    });
  });
});
