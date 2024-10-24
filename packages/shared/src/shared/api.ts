import { z } from 'zod';

export type APIError<U> = {
  message: string;
  code: U;
  name: string;
};

export type APISuccessResponse<T> = {
  success: true;
  data: T;
  error?: undefined;
};

export type APIErrorResponse<U> = {
  success: false;
  error: APIError<U>;
  data?: undefined;
};

export type APIResponse<T, U> = APISuccessResponse<T> | APIErrorResponse<U>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createAPIErrorSchema = <T extends z.ZodEnum<any>>(error: T) =>
  z.object({
    message: z.string(),
    code: error,
    name: z.string(),
  });

export const createAPISuccessResponseSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    success: z.literal(true),
    data: data,
    error: z.undefined(),
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createAPIErrorResponseSchema = <T extends z.ZodEnum<any>>(error: T) =>
  z.object({
    success: z.literal(false),
    error: createAPIErrorSchema(error),
    data: z.undefined(),
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createAPIResponseSchema = <D extends z.ZodTypeAny, E extends z.ZodEnum<any>>(data: D, error: E) =>
  z.discriminatedUnion('success', [createAPISuccessResponseSchema(data), createAPIErrorResponseSchema(error)]);
