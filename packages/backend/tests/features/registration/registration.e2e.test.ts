import path from 'path';
import { Server } from 'http';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { sharedTestRoot } from '@dddforum/shared/paths';
import { UserExceptions, UserInput, CreateUserResponse } from '@dddforum/shared/src/modules/users';
import { UserInputBuilder } from '@dddforum/shared/tests/support';
import { AddToEmailListResponse } from '@dddforum/shared/src/modules/marketing';
import { APIClient } from '@dddforum/shared/src/core';
import { GenericErrors } from '@dddforum/shared/src/shared';
import { CompositionRoot } from '../../../src/core';
import { DatabaseFixtures } from '../../support';
import { Config } from '../../../src/shared';

const feature = loadFeature(path.join(sharedTestRoot, 'features/registration.feature'), {
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
  test('Successful registration with marketing emails accepted', ({ given, when, then, and }) => {
    let createUserResponse: CreateUserResponse;
    let addEmailToListResponse: AddToEmailListResponse;
    let createUserInput: UserInput;

    given('I am a new user', async () => {
      createUserInput = new UserInputBuilder().withAllRandomDetails().build();
    });

    when('I register with valid account details accepting marketing emails', async () => {
      createUserResponse = await apiClient.users.register(createUserInput);

      addEmailToListResponse = await apiClient.marketing.addEmailToList(createUserInput.email);
    });

    then('I should be granted access to my account', async () => {
      const { data } = createUserResponse;
      expect(createUserResponse.success).toBe(true);
      expect(data!.id).toBeDefined();
      expect(data!.email).toEqual(createUserInput.email);
      expect(data!.firstName).toEqual(createUserInput.firstName);
      expect(data!.lastName).toEqual(createUserInput.lastName);
      expect(data!.username).toEqual(createUserInput.username);
    });

    and('I should expect to receive marketing emails', () => {
      const { success } = addEmailToListResponse;
      expect(addEmailToListResponse.success).toBe(true);
      expect(success).toBeTruthy();
    });
  });

  test('Successful registration without marketing emails accepted', ({ given, when, then, and }) => {
    let createUserResponse: CreateUserResponse;
    let createUserInput: UserInput;

    given('I am a new user', async () => {
      createUserInput = new UserInputBuilder().withAllRandomDetails().build();
    });

    when('I register with valid account details declining marketing emails', async () => {
      createUserResponse = await apiClient.users.register(createUserInput);
    });

    then('I should be granted access to my account', async () => {
      const { data } = createUserResponse;
      expect(createUserResponse.success).toBe(true);
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
    let createUserResponse: CreateUserResponse;
    let createUserInput: UserInput;

    given('I am a new user', async () => {
      createUserInput = new UserInputBuilder().build();
    });

    when('I register with invalid account details', async () => {
      createUserResponse = await apiClient.users.register(createUserInput);
    });

    then('I should see an error notifying me that my input is invalid', () => {
      expect(createUserResponse.success).toBe(false);
      expect(createUserResponse.error).toMatchObject({
        code: GenericErrors.enum.ValidationError,
      });
    });

    and('I should not have been sent access to account details', () => {
      expect(createUserResponse.data).toBeUndefined();
    });
  });

  test('Account already created with email', ({ given, when, then, and }) => {
    let userInputs: UserInput[] = [];
    let createUserResponses: CreateUserResponse[] = [];

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
      }
    );

    when('new users attempt to register with those emails', async () => {
      createUserResponses = await Promise.all(
        userInputs.map((userInput) => {
          return apiClient.users.register(userInput);
        })
      );
    });

    then('they should see an error notifying them that the account already exists', () => {
      for (const response of createUserResponses) {
        expect(response.success).toBe(false);
        expect(response.error).toMatchObject({
          code: UserExceptions.enum.EmailAlreadyInUse,
        });
      }
    });

    and('they should not have been sent access to account details', () => {
      createUserResponses.forEach((response) => {
        expect(response.data).toBeUndefined();
      });
    });
  });

  test('Username already taken', ({ given, when, then, and }) => {
    let createUserResponses: CreateUserResponse[] = [];

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
        await databaseFixtures.setupWithExistingUsers(...existingUserInputs);
      }
    );

    when(
      'new users attempt to register with already taken usernames',
      async (table: { firstName: string; lastName: string; email: string; username: string }[]) => {
        createUserResponses = await Promise.all(
          table.map((row) => {
            return apiClient.users.register(
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
        expect(response.success).toBe(false);
        expect(response.error).toMatchObject({
          code: UserExceptions.enum.UsernameAlreadyTaken,
        });
      }
    });

    and('they should not have been sent access to account details', () => {
      createUserResponses.forEach((response) => {
        expect(response.data).toBeUndefined();
      });
    });
  });
});
