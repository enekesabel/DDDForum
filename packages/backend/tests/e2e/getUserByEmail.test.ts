import { defineFeature, loadFeature } from 'jest-cucumber';
import { sharedTestRoot } from '@dddforum/shared/src/paths';
import path from 'path';
import { GetUserResponse } from '@dddforum/shared/src/modules/users';
import { DatabaseFixtures } from '../support/fixtures/DatabaseFixtures';
import { UserInputBuilder } from '@dddforum/shared/tests/support/builders/UserInputBuilder';
import { Server } from 'http';
import { CompositionRoot } from '../../src/core';
import { UserExceptions } from '@dddforum/shared/src/modules/users';
import { APIClient } from '@dddforum/shared/src/core/APIClient';
import { GenericErrors } from '@dddforum/shared/src/shared';

const feature = loadFeature(path.join(sharedTestRoot, 'features/getUserByEmail.feature'));

const compositionRoot = CompositionRoot.Create();

let app: Server;
let apiClient: APIClient;

beforeEach(DatabaseFixtures.ClearDatabase);

beforeAll(async () => {
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
      await DatabaseFixtures.SetupWithExistingUsers(
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

    given(/^No user with email "(.*)" exists$/, async (email: string) => {});

    when(/^I request user details using the email "(.*)"$/, async (email: string) => {
      getUserResponse = await apiClient.users.getUserByEmail(email);
    });

    then('I should receive an error indicating that the user was not found', () => {
      expect(getUserResponse.success).toBe(false);
      expect(getUserResponse.error).toMatchObject({ code: UserExceptions.UserNotFound });
    });
  });

  test('Not providing email', ({ when, then }) => {
    let getUserResponse: GetUserResponse;

    when('I request user details without providing an email', async () => {
      getUserResponse = await apiClient.users.getUserByEmail('');
    });

    then('I should receive an error indicating that was a client error', () => {
      expect(getUserResponse.success).toBe(false);
      expect(getUserResponse.error).toMatchObject({ code: GenericErrors.ClientError });
    });
  });
});
