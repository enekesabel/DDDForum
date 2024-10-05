import assert from 'assert';
import { z } from 'zod';
import { Response } from 'express';
import {
  APISuccessResponse,
  createAPISuccessResponseSchema,
  APIErrorResponse,
  createAPIErrorResponseSchema,
} from '@dddforum/shared/src/shared';

const serialize = (schema: unknown) => JSON.parse(JSON.stringify(schema));
const serializedAPISuccessResponseSchema = serialize(createAPISuccessResponseSchema(z.any()).shape);
const serializedAPIErrorResponseSchema = serialize(createAPIErrorResponseSchema(z.any()).shape);

const throwSuccessSchemaError = () => {
  throw new Error('Schema must be an APISuccessResponseSchema. Use `createAPISuccessResponseSchema` to create one.');
};

const throwErrorSchemaError = () => {
  throw new Error('Schema must be an APIErrorResponseSchema. Use `createAPIErrorResponseSchema` to create one.');
};

export const buildSuccessResponse = (response: Response) => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema: <T extends z.ZodType<APISuccessResponse<any>>>(schema: T) => {
      try {
        // @ts-expect-error: this is a little hacky
        const serializedSchema = serialize(schema.shape);

        assert.deepStrictEqual(Object.keys(serializedSchema), Object.keys(serializedAPISuccessResponseSchema));
        assert.deepStrictEqual(serializedSchema.success, serializedAPISuccessResponseSchema.success);
        assert.deepStrictEqual(serializedSchema.error, serializedAPISuccessResponseSchema.error);
        assert(serializedSchema.data);
      } catch (_e) {
        throwSuccessSchemaError();
      }

      return {
        data: (data: z.infer<T>['data']) => {
          return {
            status: (status: number) => {
              response.status(status);
              return {
                build: () => {
                  const res = {
                    data,
                    success: true,
                  };
                  return response.json(schema.parse(res));
                },
              };
            },
          };
        },
      };
    },
  };
};

export const buildErrorResponse = (response: Response) => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema: <T extends z.ZodType<APIErrorResponse<any>>>(schema: T) => {
      try {
        // @ts-expect-error: this is a little hacky
        const serializedSchema = serialize(schema.shape);
        assert.deepStrictEqual(serializedSchema.success, serializedAPIErrorResponseSchema.success);
        assert.deepStrictEqual(serializedSchema.data, serializedAPIErrorResponseSchema.data);
        assert(serializedSchema.error);
      } catch (_e) {
        throwErrorSchemaError();
      }

      return {
        error: (error: z.infer<T>['error']) => {
          return {
            status: (status: number) => {
              response.status(status);
              return {
                build: () => {
                  const res = {
                    success: false,
                    error,
                  };
                  return response.json(schema.parse(res));
                },
              };
            },
          };
        },
      };
    },
  };
};
