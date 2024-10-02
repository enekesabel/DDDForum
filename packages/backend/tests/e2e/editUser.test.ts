import { defineFeature, loadFeature } from 'jest-cucumber';
import { sharedTestRoot } from '@dddforum/shared/src/paths';
import path from 'path';
import supertest from 'supertest';
import { UserInput } from '@dddforum/shared/src/api/users';
import { UserInputBuilder } from '@dddforum/shared/tests/support/builders/UserInputBuilder';
import { DatabaseFixtures } from '../support/fixtures/DatabaseFixtures';
import { ValidationError } from '@dddforum/shared/src/errors/errors';
import {
  EmailAlreadyInUseException,
  UsernameAlreadyTakenException,
  UserNotFoundException,
} from '@dddforum/shared/src/errors/exceptions';
import { Server } from 'http';
import { CompositionRoot } from '../../src/core';

const feature = loadFeature(path.join(sharedTestRoot, 'features/editUser.feature'));

const compositionRoot = CompositionRoot.Create();

let app: Server;

beforeEach(DatabaseFixtures.ClearDatabase);

beforeAll(async () => {
  compositionRoot.getWebServer().start();
  app = compositionRoot.getWebServer().getServer();
});

afterAll(async () => {
  await compositionRoot.getWebServer().stop();
});

defineFeature(feature, (test) => {
  test('Successful user edit', ({ given, when, then }) => {
    let updateUserResponse: supertest.Response;
    let updateUserInput: UserInput;
    let userId: number;

    given('I am a registered user', async () => {
      const createUserInput = new UserInputBuilder().withAllRandomDetails().build();
      const createdUsers = await DatabaseFixtures.SetupWithExistingUsers(createUserInput);
      userId = createdUsers[0].id;
    });

    when('I try to update my user details using valid data', async () => {
      updateUserInput = new UserInputBuilder().withAllRandomDetails().build();
      updateUserResponse = await supertest(app).post(`/users/edit/${userId}`).send(updateUserInput);
    });

    then('my user details should be updated successfully', async () => {
      expect(updateUserResponse.status).toBe(200);
      expect(updateUserResponse.body.data).toBeDefined();
      expect(updateUserResponse.body.data.id).toBe(userId);
      expect(updateUserResponse.body.data.firstName).toBe(updateUserInput.firstName);
      expect(updateUserResponse.body.data.lastName).toBe(updateUserInput.lastName);
      expect(updateUserResponse.body.data.username).toBe(updateUserInput.username);
      expect(updateUserResponse.body.data.email).toBe(updateUserInput.email);
    });
  });

  test('Invalid or missing user data', ({ given, when, then, and }) => {
    let updateUserResponse: supertest.Response;
    let userId: number;

    given('I am a registered user', async () => {
      const createUserInput = new UserInputBuilder().withAllRandomDetails().build();
      const createdUsers = await DatabaseFixtures.SetupWithExistingUsers(createUserInput);
      userId = createdUsers[0].id;
    });

    when('I try to update my user details using invalid data', async () => {
      const invalidUserInput = new UserInputBuilder().withEmail('').build();
      updateUserResponse = await supertest(app).post(`/users/edit/${userId}`).send(invalidUserInput);
    });

    then('I should receive an error indicating the request was invalid', () => {
      expect(updateUserResponse.status).toBe(400);
      expect(updateUserResponse.body.error).toBe(new ValidationError().message);
    });

    and(`My user details shouldn't be updated`, async () => {
      expect(updateUserResponse.body.data).toBeUndefined();
    });
  });

  test('User not found', ({ given, when, then }) => {
    let updateUserResponse: supertest.Response;

    given('I am a registered user', async () => {
      const createUserInput = new UserInputBuilder().withAllRandomDetails().build();
      await DatabaseFixtures.SetupWithExistingUsers(createUserInput);
    });

    when('I attempt to edit a user that does not exist', async () => {
      updateUserResponse = await supertest(app)
        .post('/users/edit/999999')
        .send(new UserInputBuilder().withAllRandomDetails().build());
    });

    then('I should receive an error indicating the user was not found', () => {
      expect(updateUserResponse.status).toBe(404);
      expect(updateUserResponse.body.error).toBe(new UserNotFoundException().message);
    });
  });

  test('Email already in use', ({ given, and, when, then }) => {
    let updateUserResponse: supertest.Response;
    let userId: number;

    given(/^I am a registered user with email "(.*)"$/, async (email: string) => {
      const createUserInput = new UserInputBuilder().withAllRandomDetails().withEmail(email).build();
      const createdUsers = await DatabaseFixtures.SetupWithExistingUsers(createUserInput);
      userId = createdUsers[0].id;
    });

    and(/^another user exists with email "(.*)"$/, async (anotherEmail: string) => {
      const createUserInput = new UserInputBuilder().withAllRandomDetails().withEmail(anotherEmail).build();
      await DatabaseFixtures.SetupWithExistingUsers(createUserInput);
    });

    when(/^I attempt to update my email to "(.*)"$/, async (newEmail: string) => {
      updateUserResponse = await supertest(app).post(`/users/edit/${userId}`).send({ email: newEmail });
    });

    then('I should receive an error indicating the email is already in use', () => {
      expect(updateUserResponse.status).toBe(409);
      expect(updateUserResponse.body.error).toBe(new EmailAlreadyInUseException().message);
    });
  });

  test('Username already taken', ({ given, and, when, then }) => {
    let updateUserResponse: supertest.Response;
    let userId: number;

    given(/^I am a registered user with username "(.*)"$/, async (username: string) => {
      const createUserInput = new UserInputBuilder().withAllRandomDetails().withUsername(username).build();
      const createdUsers = await DatabaseFixtures.SetupWithExistingUsers(createUserInput);
      userId = createdUsers[0].id;
    });

    and(/^another user exists with username "(.*)"$/, async (anotherUsername: string) => {
      const createUserInput = new UserInputBuilder().withAllRandomDetails().withUsername(anotherUsername).build();
      await DatabaseFixtures.SetupWithExistingUsers(createUserInput);
    });

    when(/^I attempt to update my username to "(.*)"$/, async (newUsername: string) => {
      updateUserResponse = await supertest(app).post(`/users/edit/${userId}`).send({ username: newUsername });
    });

    then('I should receive an error indicating the username is already taken', () => {
      expect(updateUserResponse.status).toBe(409);
      expect(updateUserResponse.body.error).toBe(new UsernameAlreadyTakenException().message);
    });
  });
});
