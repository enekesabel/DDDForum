import { createResponse } from 'node-mocks-http';
import { APIErrorResponse, APISuccessResponse } from '@dddforum/shared/src/shared';
import { buildAPIResponse } from '../../../src/shared';

export const buildMockAPIReponse = () => {
  const mockResponse = createResponse();

  const schemaBuilder = buildAPIResponse(mockResponse);

  return {
    schema: <S extends Parameters<(typeof schemaBuilder)['schema']>[0]>(schema: S) => {
      const dataOrErrorBuilder = schemaBuilder.schema(schema);

      return {
        data: <D extends Parameters<(typeof dataOrErrorBuilder)['data']>[0]>(data: D) => {
          dataOrErrorBuilder.data(data).status(200).build();
          return {
            build: () => mockResponse._getJSONData() as APISuccessResponse<D>,
          };
        },

        error: <E extends Parameters<(typeof dataOrErrorBuilder)['error']>[0]>(error: E) => {
          // @ts-expect-error: good enough typecheck
          dataOrErrorBuilder.error(error).status(500).build();
          return {
            build: () => mockResponse._getJSONData() as APIErrorResponse<E['code']>,
          };
        },
      };
    },
  };
};
