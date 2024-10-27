import { APIClient } from '@dddforum/shared/src/core';
import { AddToEmailListResponseSchema } from '@dddforum/shared/src/modules/marketing';
import { CompositionRoot } from '../../src/core';
import { Config, WebServer } from '../../src/shared';
import { buildMockAPIReponse } from '../support/fixtures';
import { GENERIC_ERROR_EXCEPTIONS, VALIDATION_ERROR_EXCEPTIONS, CLIENT_ERROR_EXCEPTIONS } from './exampleErrors';

describe('marketingAPI', () => {
  const config = new Config('test:infra:incoming');
  const composition = CompositionRoot.Create(config);
  const application = composition.getApplication();

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

  describe('post /marketing/new', () => {
    const schema = AddToEmailListResponseSchema;
    const email = 'email@example.com';

    let addemailToListSpy: jest.SpyInstance;

    beforeEach(() => {
      addemailToListSpy = jest.spyOn(application.marketing, 'addEmailToList');
    });

    it('should be able to successfully retrieve posts', async () => {
      addemailToListSpy.mockResolvedValue(undefined);

      const response = await apiClient.marketing.addEmailToList(email);

      const expectedResponse = buildMockAPIReponse().schema(schema).data(undefined).build();

      expect(addemailToListSpy).toHaveBeenCalledTimes(1);
      expect(response).toEqual(expectedResponse);
    });

    const errorsToCheck = [
      ...Object.entries(GENERIC_ERROR_EXCEPTIONS),
      ...Object.entries(VALIDATION_ERROR_EXCEPTIONS),
      ...Object.entries(CLIENT_ERROR_EXCEPTIONS),
    ] as const;

    it.each(errorsToCheck)('should be able to handle %s error', async (_key, error) => {
      addemailToListSpy.mockRejectedValue(error);

      const expectedErrorResponse = buildMockAPIReponse().schema(schema).error(error).build();

      const response = await apiClient.marketing.addEmailToList(email);

      expect(response).toEqual(expectedErrorResponse);
    });
  });
});
