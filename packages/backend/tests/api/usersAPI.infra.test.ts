import { APIClient } from '@dddforum/shared/src/core';
import { CreateUserResponse } from '@dddforum/shared/src/modules/users';
import { UserInputBuilder } from '@dddforum/shared/tests/support';
import { CompositionRoot } from '../../src/core';
import { Config, WebServer } from '../../src/shared';

describe('usersAPI', () => {
  const config = new Config('test:infra');
  const composition = CompositionRoot.Create(config);
  const application = composition.getApplication();

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

  it('can create users', async () => {
    const createUserInput = new UserInputBuilder().withAllRandomDetails().build();

    const createUserResponseStub: CreateUserResponse = {
      success: true,
      data: {
        id: 1,
        email: createUserInput.email,
        firstName: createUserInput.firstName,
        lastName: createUserInput.lastName,
        username: createUserInput.username,
      },
    };

    createUserSpy.mockResolvedValue(createUserResponseStub);

    await apiClient.users.register(createUserInput);

    expect(application.users.createUser).toHaveBeenCalledTimes(1);
  });
});
