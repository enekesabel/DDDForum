import { APIClient } from '@dddforum/shared/src/core';
import { UserInputBuilder } from '@dddforum/shared/tests/support';
import {
  CreateUserResponseSchema,
  GetUserResponseSchema,
  UpdateUserResponseSchema,
} from '@dddforum/shared/src/modules/users';
import { faker } from '@faker-js/faker';
import { CompositionRoot } from '../../src/core';
import { Config, WebServer } from '../../src/shared';
import { buildMockAPIReponse, DatabaseFixtures } from '../support/fixtures';
import {
  GENERIC_ERROR_EXCEPTIONS,
  VALIDATION_ERROR_EXCEPTIONS,
  CLIENT_ERROR_EXCEPTIONS,
  USERS_EXCEPTIONS,
} from './exampleErrors';

describe('usersAPI', () => {
  const config = new Config('test:infra:incoming');
  const composition = CompositionRoot.Create(config);
  const application = composition.getApplication();
  const databaseFixtures = new DatabaseFixtures(composition);

  let server: WebServer;
  let apiClient: APIClient;

  beforeAll(async () => {
    server = composition.getWebServer();
    await server.start();
    apiClient = APIClient.FromServer(server.getServer());
  });

  afterAll(async () => {
    await server.stop();
  });

  describe('post /users/new', () => {
    const createUserInput = new UserInputBuilder().withAllRandomDetails().build();
    const schema = CreateUserResponseSchema;
    let createUserSpy: jest.SpyInstance;

    beforeAll(() => {
      createUserSpy = jest.spyOn(application.users, 'createUser');
    });

    afterEach(() => {
      createUserSpy.mockClear();
    });

    it('should be able to successfully create a user', async () => {
      const createUserStub = await databaseFixtures.makeUserBuilder().fromUserInput(createUserInput).build();

      createUserSpy.mockResolvedValue(createUserStub);

      const response = await apiClient.users.register(createUserInput);

      const expectedCreateUserResponse = buildMockAPIReponse().schema(schema).data(createUserStub).build();

      expect(application.users.createUser).toHaveBeenCalledTimes(1);
      expect(response).toEqual(expectedCreateUserResponse);
    });

    const errorsToCheck = [
      ...Object.entries(GENERIC_ERROR_EXCEPTIONS),
      ...Object.entries(VALIDATION_ERROR_EXCEPTIONS),
      ...Object.entries(CLIENT_ERROR_EXCEPTIONS),
      ['EmailAlreadyInUseException', USERS_EXCEPTIONS.EmailAlreadyInUse],
      ['UsernameAlreadyTaken', USERS_EXCEPTIONS.UsernameAlreadyTaken],
    ] as const;

    it.each(errorsToCheck)('should be able to handle %s error', async (_key, error) => {
      createUserSpy.mockRejectedValue(error);

      const expectedErrorResponse = buildMockAPIReponse().schema(schema).error(error).build();

      const response = await apiClient.users.register(createUserInput);

      expect(response).toEqual(expectedErrorResponse);
    });
  });

  describe('post /users/edit/:userId', () => {
    const updateUserInput = new UserInputBuilder().withAllRandomDetails().build();
    const userId = 1;
    const schema = UpdateUserResponseSchema;

    let updateUserSpy: jest.SpyInstance;

    beforeAll(() => {
      updateUserSpy = jest.spyOn(application.users, 'updateUser');
    });

    afterEach(() => {
      updateUserSpy.mockClear();
    });

    it('should be able to successfully update a user', async () => {
      const updatedUserStub = await databaseFixtures.makeUserBuilder().fromUserInput(updateUserInput).build();

      updateUserSpy.mockResolvedValue(updatedUserStub);

      const response = await apiClient.users.editUser(userId, updateUserInput);

      const expectedUpdateUserResponse = buildMockAPIReponse().schema(schema).data(updatedUserStub).build();

      expect(application.users.updateUser).toHaveBeenCalledTimes(1);
      expect(response).toEqual(expectedUpdateUserResponse);
    });

    const errorsToCheck = [
      ...Object.entries(GENERIC_ERROR_EXCEPTIONS),
      ...Object.entries(VALIDATION_ERROR_EXCEPTIONS),
      ...Object.entries(CLIENT_ERROR_EXCEPTIONS),
      ...Object.entries(USERS_EXCEPTIONS),
    ] as const;

    it.each(errorsToCheck)('should be able to handle %s error', async (_key, error) => {
      updateUserSpy.mockRejectedValue(error);

      const expectedErrorResponse = buildMockAPIReponse().schema(schema).error(error).build();

      const response = await apiClient.users.editUser(userId, updateUserInput);

      expect(response).toEqual(expectedErrorResponse);
    });
  });

  describe('get /users?email={email}', () => {
    const email = faker.internet.email();
    const schema = GetUserResponseSchema;

    let getUserSpy: jest.SpyInstance;

    beforeAll(() => {
      getUserSpy = jest.spyOn(application.users, 'getUser');
    });

    afterEach(() => {
      getUserSpy.mockClear();
    });

    it('should be able to successfully retrieve a user by email', async () => {
      const userStub = await databaseFixtures.makeUserBuilder().withAllRandomDetails().withEmail(email).build();

      getUserSpy.mockResolvedValue(userStub);

      const response = await apiClient.users.getUserByEmail(email);

      const expectedGetUserResponse = buildMockAPIReponse().schema(schema).data(userStub).build();

      expect(application.users.getUser).toHaveBeenCalledTimes(1);
      expect(response).toEqual(expectedGetUserResponse);
    });

    const errorsToCheck = [
      ...Object.entries(GENERIC_ERROR_EXCEPTIONS),
      ...Object.entries(VALIDATION_ERROR_EXCEPTIONS),
      ...Object.entries(CLIENT_ERROR_EXCEPTIONS),
      ['UserNotFoundException', USERS_EXCEPTIONS.UserNotFound],
    ] as const;

    it.each(errorsToCheck)('should be able to handle %s error', async (_key, error) => {
      getUserSpy.mockRejectedValue(error);

      const expectedErrorResponse = buildMockAPIReponse().schema(schema).error(error).build();

      const response = await apiClient.users.getUserByEmail(email);

      expect(response).toEqual(expectedErrorResponse);
    });
  });
});
