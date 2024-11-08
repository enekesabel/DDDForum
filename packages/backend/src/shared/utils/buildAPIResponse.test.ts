import { z } from 'zod';
import {
  createAPISuccessResponseSchema,
  createAPIErrorResponseSchema,
  GenericErrors,
  createAPIResponseSchema,
} from '@dddforum/shared/src/shared';
import { createResponse, MockResponse } from 'node-mocks-http';
import { CustomError, ServerErrorException } from '../errors';
import { buildAPIResponse } from './buildAPIResponse';

describe('buildAPIResponse', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let response: MockResponse<any>;

  beforeEach(() => {
    response = createResponse();
  });

  describe('Building APIResponse', () => {
    const dataSchema = z.object({
      name: z.string(),
      age: z.number(),
    });

    const responseSchema = createAPIResponseSchema(dataSchema, GenericErrors);

    it('Should be able to build an APISuccessResponse from an APIResponseSchema', () => {
      const data = {
        name: 'John Doe',
        age: 30,
      };

      buildAPIResponse(response).schema(responseSchema).data(data).status(200).build().send();

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toMatchObject({
        data,
        success: true,
      });
    });

    it('Should be able to build an APIErrorResponse from an APIResponseSchema', () => {
      const error = new ServerErrorException('Something went wrong');

      buildAPIResponse(response).schema(responseSchema).error(error).status(500).build().send();

      expect(response.statusCode).toBe(500);
      expect(response._getJSONData()).toMatchObject({
        error: { message: 'Something went wrong', code: GenericErrors.Enum.ServerError },
        success: false,
      });
    });

    it('Should throw an error if an invalid status code is used for success response', () => {
      const data = {
        name: 'John Doe',
        age: 30,
      };
      expect(() => buildAPIResponse(response).schema(responseSchema).data(data).status(500).build().send()).toThrow();
    });

    it('Should throw an error if an invalid status code is used for error response', () => {
      const error = new ServerErrorException('Something went wrong');

      expect(() => buildAPIResponse(response).schema(responseSchema).error(error).status(200).build().send()).toThrow();
    });
  });

  describe('Building APISuccessResponse', () => {
    const schema = createAPISuccessResponseSchema(
      z.object({
        name: z.string(),
        age: z.number(),
      })
    );

    it('Should be able to build an APISuccessResponse', () => {
      const data = {
        name: 'John Doe',
        age: 30,
      };

      buildAPIResponse(response).schema(schema).data(data).status(200).build().send();

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
      buildAPIResponse(response).schema(schema).data(data).status(200).build().send();

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
      expect(() => buildAPIResponse(response).schema(schema).data(data).status(200).build().send()).toThrow();
    });

    it('Should throw an error if schema is not an APISuccessResponseSchema', () => {
      const schema = z.object({
        error: z.any(),
        success: z.literal(true),
        data: z.any(),
      });
      const data = {
        error: 'Something went wrong',
        success: true,
      };

      // @ts-expect-error: schema is not an APISuccessResponseSchema
      expect(() => buildAPIResponse(response).schema(schema).data(data).status(200).build().send()).toThrow();
    });

    it('Should throw an error if one tries to build an error response', () => {
      const error = new ServerErrorException('Something went wrong');

      // @ts-expect-error: cannot pass error when building an APISuccessResponse
      expect(() => buildAPIResponse(response).schema(schema).error(error).status(200).build().send()).toThrow();
    });
  });

  describe('Building APIErrorResponse', () => {
    const schema = createAPIErrorResponseSchema(GenericErrors);

    it('Should be able to build an APIErrorResponse', () => {
      const error = new ServerErrorException('Something went wrong');

      buildAPIResponse(response).schema(schema).error(error).status(500).build().send();

      expect(response.statusCode).toBe(500);
      expect(response._getJSONData()).toMatchObject({
        success: false,
        error: {
          message: 'Something went wrong',
          code: GenericErrors.Enum.ServerError,
        },
      });
    });

    it('Should throw an error if error does not match the schema', () => {
      class InvalidError extends CustomError<'InvalidError', 'InvalidError'> {
        readonly name = 'InvalidError';

        constructor(public message: string) {
          super(message, 'InvalidError', 'InvalidError');
        }
      }
      const error = new InvalidError('Invalid error');

      expect(() => buildAPIResponse(response).schema(schema).error(error).status(500).build().send()).toThrow();
    });

    it('Should throw an error if schema is not an APIErrorResponseSchema', () => {
      const schema = z.object({
        error: z.any(),
        success: z.literal(false),
      });
      const error = new ServerErrorException('Something went wrong');

      // @ts-expect-error: schema is not an APIErrorResponseSchema
      expect(() => buildAPIResponse(response).schema(schema).error(error).status(500).build().send()).toThrow();
    });

    it('Should throw an error if one tries to build a success response', () => {
      const data = {
        name: 'John Doe',
        age: 30,
      };
      // @ts-expect-error: cannot pass data when building an APIErrorResponse
      expect(() => buildAPIResponse(response).schema(schema).data(data).status(200).build().send()).toThrow();
    });
  });
});
