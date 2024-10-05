import { z } from 'zod';
import {
  createAPISuccessResponseSchema,
  createAPIErrorResponseSchema,
  GenericErrors,
  createAPIResponseSchema,
} from '@dddforum/shared/src/shared';
import { createResponse, MockResponse } from 'node-mocks-http';
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
    const errorSchema = z.object({
      code: z.nativeEnum(GenericErrors),
      message: z.string(),
    });
    const responseSchema = createAPIResponseSchema(dataSchema, errorSchema);

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
      buildAPIResponse(response)
        .schema(responseSchema)
        .error({ message: 'Something went wrong', code: GenericErrors.ServerError })
        .status(500)
        .build()
        .send();

      expect(response.statusCode).toBe(500);
      expect(response._getJSONData()).toMatchObject({
        error: { message: 'Something went wrong', code: GenericErrors.ServerError },
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
      expect(() =>
        buildAPIResponse(response)
          .schema(responseSchema)
          .error({ message: 'Something went wrong', code: GenericErrors.ServerError })
          .status(200)
          .build()
          .send()
      ).toThrow();
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
      const error = {
        message: 'Something went wrong',
        code: GenericErrors.ServerError,
      };
      // @ts-expect-error: cannot pass error when building an APISuccessResponse
      expect(() => buildAPIResponse(response).schema(schema).error(error).status(200).build().send()).toThrow();
    });
  });

  describe('Building APIErrorResponse', () => {
    const schema = createAPIErrorResponseSchema(
      z.object({
        message: z.nativeEnum(GenericErrors),
        code: z.number(),
      })
    );

    it('Should be able to build an APIErrorResponse', () => {
      const error = {
        message: GenericErrors.ServerError,
        code: 500,
      };

      buildAPIResponse(response).schema(schema).error(error).status(500).build().send();

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
      expect(() => buildAPIResponse(response).schema(schema).error(error).status(500).build().send()).toThrow();
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
