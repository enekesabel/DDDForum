import path from 'path';
import { Server } from 'http';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { sharedTestRoot } from '@dddforum/shared/paths';
import { GetUserResponse, UserExceptions } from '@dddforum/shared/src/modules/users';
import { UserInputBuilder } from '@dddforum/shared/tests/support';
import { APIClient } from '@dddforum/shared/src/core';
import { GenericErrors } from '@dddforum/shared/src/shared';
import { DatabaseFixtures } from '../../support';
import { CompositionRoot } from '../../../src/core';
import { Config } from '../../../src/shared';

const feature = loadFeature(path.join(sharedTestRoot, 'features/getUserByEmail.feature'), {
  tagFilter: '@e2e',
});

let app: Server;
let apiClient: APIClient;
let databaseFixtures: DatabaseFixtures;
let compositionRoot: CompositionRoot;

beforeAll(async () => {
  compositionRoot = CompositionRoot.Create(new Config('test:e2e'));
  databaseFixtures = new DatabaseFixtures(compositionRoot);
  await databaseFixtures.clearDatabase();
  await compositionRoot.getWebServer().start();
  app = compositionRoot.getWebServer().getServer();
  apiClient = APIClient.FromServer(app);
});

afterAll(async () => {
  await compositionRoot.getWebServer().stop();
});

defineFeature(feature, (test) => {
  test('Successfully retrieve user details by email', ({ given, when, then }) => {
    let getUserResponse: GetUserResponse;
    let emailToFind: string;

    given(/^a user exists with the email "(.*)"$/, async (email: string) => {
      emailToFind = email;
      await databaseFixtures.setupWithExistingUsers(
        new UserInputBuilder().withAllRandomDetails().withEmail(email).build()
      );
    });

    when(/^I request user details using the email "(.*)"$/, async (email: string) => {
      getUserResponse = await apiClient.users.getUserByEmail(email);
    });

    then('I should receive the user details', () => {
      expect(getUserResponse.success).toBe(true);
      expect(getUserResponse.data?.email).toBe(emailToFind);
    });
  });

  test('User not found', ({ given, when, then }) => {
    let getUserResponse: GetUserResponse;

    given(/^No user with email "(.*)" exists$/, async () => {});

    when(/^I request user details using the email "(.*)"$/, async (email: string) => {
      getUserResponse = await apiClient.users.getUserByEmail(email);
    });

    then('I should receive an error indicating that the user was not found', () => {
      expect(getUserResponse.success).toBe(false);
      expect(getUserResponse.error).toMatchObject({ code: UserExceptions.enum.UserNotFound });
    });
  });

  test('Not providing email', ({ when, then }) => {
    let getUserResponse: GetUserResponse;

    when('I request user details without providing an email', async () => {
      getUserResponse = await apiClient.users.getUserByEmail(undefined as unknown as string);
    });

    then('I should receive an error indicating that was a client error', () => {
      expect(getUserResponse.success).toBe(false);
      expect(getUserResponse.error).toMatchObject({ code: GenericErrors.enum.ClientError });
    });
  });
});
