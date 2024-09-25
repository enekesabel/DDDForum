import { defineFeature, loadFeature } from 'jest-cucumber';
import { sharedTestRoot } from '@dddforum/shared/src/paths';
import path from 'path';
import supertest from 'supertest';
import { CreateUserInput } from '@dddforum/shared/src/api/users';
import { CreateUserInputBuilder } from '@dddforum/shared/tests/support/builders/CreateUserInputBuilder';
import { app } from '../../src';

const feature = loadFeature(path.join(sharedTestRoot, 'features/registration.feature'));

afterAll(() => {
  app.close();
});

defineFeature(feature, (test) => {
  test('Successful registration with marketing emails accepted', ({ given, when, then, and }) => {
    let createUserResponse: supertest.Response;
    let addEmailToListResponse: supertest.Response;
    let createUserInput: CreateUserInput;

    given('I am a new user', async () => {
      createUserInput = new CreateUserInputBuilder().withAllRandomDetails().build();
    });

    when('I register with valid account details accepting marketing emails', async () => {
      createUserResponse = await supertest(app).post('/users/new').send(createUserInput);

      addEmailToListResponse = await supertest(app).post('/marketing/new').send({ email: createUserInput.email });
    });

    then('I should be granted access to my account', async () => {
      const { data } = createUserResponse.body;
      expect(createUserResponse.status).toBe(201);
      expect(data!.id).toBeDefined();
      expect(data!.email).toEqual(createUserInput.email);
      expect(data!.firstName).toEqual(createUserInput.firstName);
      expect(data!.lastName).toEqual(createUserInput.lastName);
      expect(data!.username).toEqual(createUserInput.username);
    });

    and('I should expect to receive marketing emails', () => {
      const { success } = addEmailToListResponse.body;
      expect(createUserResponse.status).toBe(201);
      expect(success).toBeTruthy();
    });
  });

  test('Successful registration without marketing emails accepted', ({ given, when, then, and }) => {
    let createUserResponse: supertest.Response;
    let createUserInput: CreateUserInput;

    given('I am a new user', async () => {
      createUserInput = new CreateUserInputBuilder().withAllRandomDetails().build();
    });

    when('I register with valid account details declining marketing emails', async () => {
      createUserResponse = await supertest(app).post('/users/new').send(createUserInput);
    });

    then('I should be granted access to my account', async () => {
      const { data } = createUserResponse.body;
      expect(createUserResponse.status).toBe(201);
      expect(data!.id).toBeDefined();
      expect(data!.email).toEqual(createUserInput.email);
      expect(data!.firstName).toEqual(createUserInput.firstName);
      expect(data!.lastName).toEqual(createUserInput.lastName);
      expect(data!.username).toEqual(createUserInput.username);
    });

    and('I should not expect to receive marketing emails', () => {
      // TODO: implement check one marketing endpoint set up
    });
  });
});
