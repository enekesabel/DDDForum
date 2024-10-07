import { z } from 'zod';

export type APIError<U> = {
  message: string;
  code: U;
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

export const createAPISuccessResponseSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    success: z.literal(true),
    data: data,
    error: z.undefined(),
  });

export const createAPIErrorResponseSchema = <U extends z.ZodTypeAny>(error: U) =>
  z.object({
    success: z.literal(false),
    error: error,
    data: z.undefined(),
  });

export const createAPIResponseSchema = <D extends z.ZodTypeAny, E extends z.ZodTypeAny>(data: D, error: E) =>
  z.discriminatedUnion('success', [createAPISuccessResponseSchema(data), createAPIErrorResponseSchema(error)]);

export const GenericErrors = z.enum(['ValidationError', 'ServerError', 'ClientError']);
