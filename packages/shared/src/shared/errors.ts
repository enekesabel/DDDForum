import { z } from 'zod';

export const GenericErrors = z.enum(['ValidationError', 'ServerError', 'ClientError']);

export const ValidationErrorExceptions = z.enum([
  'InvalidRequestBodyException',
  'InvalidRequestParamException',
  'InvalidRequestQueryException',
]);

export const ClientErrorExceptions = z.enum(['MissingRequestParamException', 'MissingRequestQueryException']);
