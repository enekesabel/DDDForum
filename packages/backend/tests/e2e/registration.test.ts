import { defineFeature, loadFeature } from 'jest-cucumber';
import { sharedTestRoot } from '@dddforum/shared/src/paths';
import path from 'path';
import supertest from 'supertest';
import { UserInput } from '@dddforum/shared/src/api/users';
import { UserInputBuilder } from '@dddforum/shared/tests/support/builders/UserInputBuilder';
import { CompositionRoot } from '../../src/CompositionRoot';
import { DatabaseFixtures } from '../support/fixtures/DatabaseFixtures';
import { EmailAlreadyInUseException, UsernameAlreadyTakenException } from '@dddforum/shared/src/errors/exceptions';
import { ValidationError } from '@dddforum/shared/src/errors/errors';
import { Server } from 'http';

const feature = loadFeature(path.join(sharedTestRoot, 'features/registration.feature'));
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
  test('Successful registration with marketing emails accepted', ({ given, when, then, and }) => {
    let createUserResponse: supertest.Response;
    let addEmailToListResponse: supertest.Response;
    let createUserInput: UserInput;

    given('I am a new user', async () => {
      createUserInput = new UserInputBuilder().withAllRandomDetails().build();
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
    let createUserInput: UserInput;

    given('I am a new user', async () => {
      createUserInput = new UserInputBuilder().withAllRandomDetails().build();
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

  test('Invalid or missing registration details', ({ given, when, then, and }) => {
    let createUserResponse: supertest.Response;
    let createUserInput: UserInput;

    given('I am a new user', async () => {
      createUserInput = new UserInputBuilder().build();
    });

    when('I register with invalid account details', async () => {
      createUserResponse = await supertest(app).post('/users/new').send(createUserInput);
    });

    then('I should see an error notifying me that my input is invalid', () => {
      expect(createUserResponse.status).toBe(400);
      expect(createUserResponse.body.error).toBe(new ValidationError().message);
    });

    and('I should not have been sent access to account details', () => {
      expect(createUserResponse.body.data).toBeUndefined();
      expect(createUserResponse.body.success).toBeFalsy();
    });
  });

  test('Account already created with email', ({ given, when, then, and }) => {
    let userInputs: UserInput[] = [];
    let createUserResponses: supertest.Response[] = [];

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
        await DatabaseFixtures.SetupWithExistingUsers(...userInputs);
      }
    );

    when('new users attempt to register with those emails', async () => {
      createUserResponses = await Promise.all(
        userInputs.map((userInput) => {
          return supertest(app).post('/users/new').send(userInput);
        })
      );
    });

    then('they should see an error notifying them that the account already exists', () => {
      for (const response of createUserResponses) {
        expect(response.status).toBe(409);
        expect(response.body.error).toBe(new EmailAlreadyInUseException().message);
      }
    });

    and('they should not have been sent access to account details', () => {
      createUserResponses.forEach((response) => {
        expect(response.body.success).toBeFalsy();
        expect(response.body.data).toBeUndefined();
      });
    });
  });

  test('Username already taken', ({ given, when, then, and }) => {
    let createUserResponses: supertest.Response[] = [];

    given(
      'a set of users have already created their accounts with valid details',
      async (table: { firstName: string; lastName: string; email: string; username: string }[]) => {
        const existingUserInputs = table.map((row) => {
          return new UserInputBuilder()
            .withUsername(row.username)
            .withFirstName(row.firstName)
            .withLastName(row.lastName)
            .withEmail(row.email)
            .build();
        });
        await DatabaseFixtures.SetupWithExistingUsers(...existingUserInputs);
      }
    );

    when(
      'new users attempt to register with already taken usernames',
      async (table: { firstName: string; lastName: string; email: string; username: string }[]) => {
        createUserResponses = await Promise.all(
          table.map((row) => {
            return supertest(app)
              .post('/users/new')
              .send(
                new UserInputBuilder()
                  .withEmail(row.email)
                  .withUsername(row.username)
                  .withFirstName(row.firstName)
                  .withLastName(row.lastName)
                  .build()
              );
          })
        );
      }
    );

    then('they see an error notifying them that the username has already been taken', () => {
      for (const response of createUserResponses) {
        expect(response.status).toBe(409);
        expect(response.body.error).toBe(new UsernameAlreadyTakenException().message);
      }
    });

    and('they should not have been sent access to account details', () => {
      createUserResponses.forEach((response) => {
        expect(response.body.success).toBeFalsy();
        expect(response.body.data).toBeUndefined();
      });
    });
  });
});
