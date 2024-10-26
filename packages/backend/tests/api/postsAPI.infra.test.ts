import { APIClient } from '@dddforum/shared/src/core';
import { UserInputBuilder } from '@dddforum/shared/tests/support';
import { GetPostsResponseSchema } from '@dddforum/shared/src/modules/posts';
import { CompositionRoot } from '../../src/core';
import { Config, WebServer } from '../../src/shared';
import { buildMockAPIReponse, DatabaseFixtures } from '../support/fixtures';
import { GENERIC_ERROR_EXCEPTIONS, VALIDATION_ERROR_EXCEPTIONS, CLIENT_ERROR_EXCEPTIONS } from './exampleErrors';

describe('postsAPI', () => {
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

  describe('get /posts?sort=recent', () => {
    const schema = GetPostsResponseSchema;

    let gestPostsSpy: jest.SpyInstance;

    beforeAll(() => {
      gestPostsSpy = jest.spyOn(application.posts, 'getPosts');
    });

    afterEach(() => {
      gestPostsSpy.mockClear();
    });

    it('should be able to successfully retrieve posts', async () => {
      const postsStub = await databaseFixtures.setUpWithRandomPostsByUser(
        new UserInputBuilder().withAllRandomDetails().build(),
        5
      );

      gestPostsSpy.mockResolvedValue(postsStub);

      const response = await apiClient.posts.getPosts('recent');

      const expectedGetUserResponse = buildMockAPIReponse().schema(schema).data(postsStub).build();

      expect(application.posts.getPosts).toHaveBeenCalledTimes(1);
      expect(response).toEqual(expectedGetUserResponse);
    });

    const errorsToCheck = [
      ...Object.entries(GENERIC_ERROR_EXCEPTIONS),
      ...Object.entries(VALIDATION_ERROR_EXCEPTIONS),
      ...Object.entries(CLIENT_ERROR_EXCEPTIONS),
    ] as const;

    it.each(errorsToCheck)('should be able to handle %s error', async (_key, error) => {
      gestPostsSpy.mockRejectedValue(error);

      const expectedErrorResponse = buildMockAPIReponse().schema(schema).error(error).build();

      const response = await apiClient.posts.getPosts('recent');

      expect(response).toEqual(expectedErrorResponse);
    });
  });
});
