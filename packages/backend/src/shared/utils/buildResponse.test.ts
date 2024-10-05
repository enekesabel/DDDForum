import { z } from 'zod';
import { createAPISuccessResponseSchema } from '@dddforum/shared/src/shared';
import { createResponse, MockResponse } from 'node-mocks-http';
import { buildSuccessResponse } from './buildResponse';

describe('buildResponse', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let response: MockResponse<any>;

  beforeEach(() => {
    response = createResponse();
  });

  describe('Building success response', () => {
    const schema = createAPISuccessResponseSchema(
      z.object({
        name: z.string(),
        age: z.number(),
      })
    );

    it('Should be able to build a success response', () => {
      const data = {
        name: 'John Doe',
        age: 30,
      };

      buildSuccessResponse(response).schema(schema).data(data).status(200).build().send();

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toMatchObject({
        data,
        success: true,
      });
    });

    it('Should remove any properties from data that are not defined on the schema', () => {
      const data = {
        name: 'John Doe',
        age: 30,
        password: 'this_should_not_leak',
      };
      buildSuccessResponse(response).schema(schema).data(data).status(200).build().send();

      expect(response._getJSONData()).toEqual({
        data: {
          name: data.name,
          age: data.age,
        },
        success: true,
      });
    });

    it('Should throw an error if data does not match the schema', () => {
      const data = {};
      // @ts-expect-error: data does not match schema
      expect(() => buildSuccessResponse(response).schema(schema).data(data).status(200).build().send()).toThrow();
    });

    it('Should throw an error if schema is not an APISuccessResponseSchema', () => {
      const schema = z.object({
        error: z.any(),
        success: z.literal(true),
      });
      const data = {};

      // @ts-expect-error: schema is not an APISuccessResponseSchema
      expect(() => buildSuccessResponse(response).schema(schema).data(data).status(200).build().send()).toThrow();
    });
  });
});
