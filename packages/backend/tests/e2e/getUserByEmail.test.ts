import { defineFeature, loadFeature } from 'jest-cucumber';
import { sharedTestRoot } from '@dddforum/shared/src/paths';
import path from 'path';
import supertest from 'supertest';
import { app } from '../../src';
import { Errors } from '../../src/utils';
import { DatabaseFixtures } from '../support/fixtures/DatabaseFixtures';
import { UserInputBuilder } from '@dddforum/shared/tests/support/builders/UserInputBuilder';

const feature = loadFeature(path.join(sharedTestRoot, 'features/getUserByEmail.feature'));

beforeEach(DatabaseFixtures.ClearDatabase);

afterAll(() => {
  app.close();
});

defineFeature(feature, (test) => {
  test('Successfully retrieve user details by email', ({ given, when, then }) => {
    let getUserResponse: supertest.Response;
    let emailToFind: string;

    given(/^a user exists with the email "(.*)"$/, async (email: string) => {
      emailToFind = email;
      await DatabaseFixtures.SetupWithExistingUsers(
        new UserInputBuilder().withAllRandomDetails().withEmail(email).build()
      );
    });

    when(/^I request user details using the email "(.*)"$/, async (email: string) => {
      getUserResponse = await supertest(app).get('/users').query({ email });
    });

    then('I should receive the user details', () => {
      expect(getUserResponse.status).toBe(200);
      expect(getUserResponse.body.data.email).toBe(emailToFind);
    });
  });

  test('User not found', ({ given, when, then }) => {
    let getUserResponse: supertest.Response;

    given(/^No user with email "(.*)" exists$/, async (email: string) => {
      getUserResponse = await supertest(app).get('/users').query({ email });
    });

    when(/^I request user details using the email "(.*)"$/, async (email: string) => {
      getUserResponse = await supertest(app).get('/users').query({ email });
    });

    then('I should receive an error indicating that the user was not found', () => {
      expect(getUserResponse.status).toBe(404);
      expect(getUserResponse.body.error).toBe(Errors.UserNotFound);
    });
  });

  test('Not providing email', ({ when, then }) => {
    let getUserResponse: supertest.Response;

    when('I request user details without providing an email', async () => {
      getUserResponse = await supertest(app).get('/users');
    });

    then('I should receive an error indicating that was a client error', () => {
      expect(getUserResponse.status).toBe(400);
      expect(getUserResponse.body.error).toBe(Errors.ClientError);
    });
  });
});