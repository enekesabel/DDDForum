import assert from 'assert';
import { z } from 'zod';
import { Response } from 'express';
import {
  createAPISuccessResponseSchema,
  createAPIErrorResponseSchema,
  createAPIResponseSchema,
  StatusCodes,
} from '@dddforum/shared/src/shared';
import { CustomError } from '../errors';

type APISuccessResponseSchema = ReturnType<typeof createAPISuccessResponseSchema>;
type APIErrorResponseSchema = ReturnType<typeof createAPIErrorResponseSchema>;
type APIResponseSchema = ReturnType<typeof createAPIResponseSchema>;

const serialize = (schema: unknown) => JSON.parse(JSON.stringify(schema));
const serializedAPISuccessResponseSchema = serialize(createAPISuccessResponseSchema(z.any()).shape);
const serializedAPIErrorResponseSchema = serialize(createAPIErrorResponseSchema(z.enum(['error'])).shape);

// @ts-expect-error: good enough typecheck
function isAPIResponseSchema<T extends z.ZodTypeAny>(schema: T): schema is APIResponseSchema {
  try {
    return (
      schema._def.discriminator === 'success' ||
      schema._def.options.length === 2 ||
      isAPISuccessResponseSchema(schema._def.options[0]) ||
      isAPIErrorResponseSchema(schema._def.options[1])
    );
  } catch (_e) {
    return false;
  }
}

function isAPISuccessResponseSchema<T extends APISuccessResponseSchema | APIErrorResponseSchema>(
  schema: T
  // @ts-expect-error: good enough typecheck
): schema is APISuccessResponseSchema {
  try {
    const serializedSchema = serialize(schema.shape);

    assert.deepStrictEqual(Object.keys(serializedSchema), Object.keys(serializedAPISuccessResponseSchema));
    assert.deepStrictEqual(serializedSchema.success, serializedAPISuccessResponseSchema.success);
    assert.deepStrictEqual(serializedSchema.error, serializedAPISuccessResponseSchema.error);
    assert(serializedSchema.data);

    return true;
  } catch (_e) {
    return false;
  }
}

function isAPIErrorResponseSchema<T extends APIErrorResponseSchema | APISuccessResponseSchema>(
  schema: T
  // @ts-expect-error: good enough typecheck
): schema is APIErrorResponseSchema {
  try {
    const serializedSchema = serialize(schema.shape);
    assert.deepStrictEqual(serializedSchema.success, serializedAPIErrorResponseSchema.success);
    assert.deepStrictEqual(serializedSchema.data, serializedAPIErrorResponseSchema.data);
    assert(serializedSchema.error);
    return true;
  } catch (_e) {
    return false;
  }
}

export const buildAPIResponse = (response: Response) => {
  return {
    schema: <T extends APIResponseSchema | APISuccessResponseSchema | APIErrorResponseSchema>(schema: T) => {
      if (isAPIResponseSchema(schema)) {
        return {
          error: buildErrorResponse(response).schema(schema._def.options[1]).error,
          data: buildSuccessResponse(response).schema(schema._def.options[0]).data,
        };
      }
      if (isAPIErrorResponseSchema(schema)) {
        return {
          error: buildErrorResponse(response).schema(schema).error,
          data: (_: z.infer<T>['data']) => {
            throw new Error('Data function is not supported for error responses');
          },
        };
      }
      if (isAPISuccessResponseSchema(schema)) {
        return {
          error: (_: CustomError<string>) => {
            throw new Error('Error function is not supported for success responses');
          },
          data: buildSuccessResponse(response).schema(schema).data,
        };
      }
      throw new Error('Schema must be an APIResponseSchema, APISuccessResponseSchema or an APIErrorResponseSchema.');
    },
  };
};

const buildSuccessResponse = (response: Response) => {
  return {
    schema: <T extends APISuccessResponseSchema>(schema: T) => {
      if (!isAPISuccessResponseSchema(schema)) {
        throw new Error(
          'Schema must be an APISuccessResponseSchema. Use `createAPISuccessResponseSchema` to create one.'
        );
      }

      return {
        data: (data: z.infer<T>['data']) => {
          return {
            status: (status: StatusCodes) => {
              // Validate status code
              if (!Object.values(StatusCodes).includes(status) || status > 299 || status < 200) {
                throw new Error(`Invalid status code: ${status}`);
              }
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

const buildErrorResponse = (response: Response) => {
  return {
    schema: <T extends APIErrorResponseSchema>(schema: T) => {
      if (!isAPIErrorResponseSchema(schema)) {
        throw new Error('Schema must be an APIErrorResponseSchema. Use `createAPIErrorResponseSchema` to create one.');
      }

      return {
        error: (error: CustomError<z.infer<T>['error']['code']>) => {
          return {
            status: (status: StatusCodes) => {
              if (!Object.values(StatusCodes).includes(status) || status > 599 || status < 400) {
                throw new Error(`Invalid status code: ${status}`);
              }
              response.status(status);
              return {
                build: () => {
                  const res: z.infer<T> = {
                    success: false,
                    error: {
                      code: error.name,
                      message: error.message,
                    },
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
