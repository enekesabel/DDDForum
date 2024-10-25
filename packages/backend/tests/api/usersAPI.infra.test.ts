import { APIClient } from '@dddforum/shared/src/core';
import { UserInputBuilder } from '@dddforum/shared/tests/support';
import { CreateUserResponseSchema } from '@dddforum/shared/src/modules/users';
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
  const config = new Config('test:infra');
  const composition = CompositionRoot.Create(config);
  const application = composition.getApplication();
  const databaseFixtures = new DatabaseFixtures(composition);

  let server: WebServer;
  let apiClient: APIClient;

  let createUserSpy: jest.SpyInstance;

  beforeAll(async () => {
    server = composition.getWebServer();
    await server.start();
    apiClient = APIClient.FromServer(server.getServer());
    createUserSpy = jest.spyOn(application.users, 'createUser');
  });

  afterEach(() => {
    createUserSpy.mockClear();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe('creating users', () => {
    const createUserInput = new UserInputBuilder().withAllRandomDetails().build();

    it('should be able to successfully create a user', async () => {
      const createUserStub = await databaseFixtures.makeUserBuilder().withAllRandomDetails().build();

      createUserSpy.mockResolvedValue(createUserStub);

      const response = await apiClient.users.register(createUserInput);

      const expectedCreateUserResponse = buildMockAPIReponse()
        .schema(CreateUserResponseSchema)
        .data(createUserStub)
        .build();

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

      const expectedErrorResponse = buildMockAPIReponse().schema(CreateUserResponseSchema).error(error).build();

      const response = await apiClient.users.register(createUserInput);

      expect(response).toEqual(expectedErrorResponse);
    });
  });
});
