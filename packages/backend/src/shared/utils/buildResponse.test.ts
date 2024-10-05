import { z } from 'zod';
import {
  createAPISuccessResponseSchema,
  createAPIErrorResponseSchema,
  GenericErrors,
} from '@dddforum/shared/src/shared';
import { createResponse, MockResponse } from 'node-mocks-http';
import { buildSuccessResponse, buildErrorResponse } from './buildResponse';

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
      const data = {
        error: 'Something went wrong',
        success: true,
      };

      // @ts-expect-error: schema is not an APISuccessResponseSchema
      expect(() => buildSuccessResponse(response).schema(schema).data(data).status(200).build().send()).toThrow();
    });
  });

  describe('Building error response', () => {
    const schema = createAPIErrorResponseSchema(
      z.object({
        message: z.nativeEnum(GenericErrors),
        code: z.number(),
      })
    );

    it('Should be able to build an error response', () => {
      const error = {
        message: GenericErrors.ServerError,
        code: 500,
      };

      buildErrorResponse(response).schema(schema).error(error).status(500).build().send();

      expect(response.statusCode).toBe(500);
      expect(response._getJSONData()).toMatchObject({
        success: false,
        error,
      });
    });

    it('Should throw an error if error does not match the schema', () => {
      const error = {
        message: 'CustomError',
        code: 500,
      };
      // @ts-expect-error: error does not match schema
      expect(() => buildErrorResponse(response).schema(schema).error(error).status(500).build().send()).toThrow();
    });

    it('Should throw an error if schema is not an APIErrorResponseSchema', () => {
      const schema = z.object({
        error: z.any(),
        success: z.literal(false),
      });
      const error = {
        message: 'Something went wrong',
        code: 500,
      };

      // @ts-expect-error: schema is not an APIErrorResponseSchema
      expect(() => buildErrorResponse(response).schema(schema).error(error).status(500).build().send()).toThrow();
    });
  });
});
