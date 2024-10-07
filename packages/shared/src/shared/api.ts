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
export const createAPISuccessResponseSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    success: z.literal(true),
    data: data,
    error: z.undefined(),
  });

export type APISuccessResponseSchema = ReturnType<typeof createAPISuccessResponseSchema>;

export type APIErrorResponse<U> = {
  success: false;
  error: APIError<U>;
  data?: undefined;
};
export const createAPIErrorResponseSchema = <U extends z.ZodTypeAny>(error: U) =>
  z.object({
    success: z.literal(false),
    error: error,
    data: z.undefined(),
  });
export type APIErrorResponseSchema = ReturnType<typeof createAPIErrorResponseSchema>;

export const createAPIResponseSchema = <D extends z.ZodTypeAny, E extends z.ZodTypeAny>(data: D, error: E) =>
  z.discriminatedUnion('success', [createAPISuccessResponseSchema(data), createAPIErrorResponseSchema(error)]);
export type APIResponseSchema = ReturnType<typeof createAPIResponseSchema>;

export type APIResponse<T, U> = APISuccessResponse<T> | APIErrorResponse<U>;

export const GenericErrors = z.enum(['ValidationError', 'ServerError', 'ClientError']);
