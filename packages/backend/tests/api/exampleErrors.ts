import { UserExceptions } from '@dddforum/shared/src/modules/users';
import { GenericErrors, ValidationErrorExceptions, ClientErrorExceptions } from '@dddforum/shared/src/shared';
import { z } from 'zod';
import {
  UsersException,
  UserNotFoundException,
  EmailAlreadyInUseException,
  UsernameAlreadyTakenException,
} from '../../src/modules/users';
import {
  GenericError,
  ClientErrorException,
  ValidationErrorException,
  ServerErrorException,
  BaseValidationErrorException,
  InvalidRequestBodyException,
  InvalidRequestParamException,
  InvalidRequestQueryException,
  BaseClientErrorException,
  MissingRequestParamException,
  MissingRequestQueryException,
} from '../../src/shared';

export const GENERIC_ERROR_EXCEPTIONS: {
  [key in z.infer<typeof GenericErrors>]: GenericError<string, key>;
} = {
  [GenericErrors.Enum.ClientError]: new ClientErrorException('client error'),
  [GenericErrors.Enum.ValidationError]: new ValidationErrorException('validation error'),
  [GenericErrors.Enum.ServerError]: new ServerErrorException(),
} as const;

export const VALIDATION_ERROR_EXCEPTIONS: {
  [key in z.infer<typeof ValidationErrorExceptions>]: BaseValidationErrorException<key>;
} = {
  [ValidationErrorExceptions.Enum.InvalidRequestBodyException]: new InvalidRequestBodyException('invalid request body'),
  [ValidationErrorExceptions.Enum.InvalidRequestParamException]: new InvalidRequestParamException(
    'invalid request param'
  ),
  [ValidationErrorExceptions.Enum.InvalidRequestQueryException]: new InvalidRequestQueryException(
    'invalid request query'
  ),
  ValidationErrorException: new ValidationErrorException('validation error'),
} as const;

export const CLIENT_ERROR_EXCEPTIONS: {
  [key in z.infer<typeof ClientErrorExceptions>]: BaseClientErrorException<key>;
} = {
  [ClientErrorExceptions.Enum.MissingRequestParamException]: new MissingRequestParamException('missing request param'),
  [ClientErrorExceptions.Enum.MissingRequestQueryException]: new MissingRequestQueryException('missing request query'),
  ClientErrorException: new ClientErrorException('client error'),
} as const;

export const USERS_EXCEPTIONS: {
  [key in z.infer<typeof UserExceptions>]: UsersException<key>;
} = {
  [UserExceptions.Enum.UserNotFound]: new UserNotFoundException(),
  [UserExceptions.Enum.EmailAlreadyInUse]: new EmailAlreadyInUseException(),
  [UserExceptions.Enum.UsernameAlreadyTaken]: new UsernameAlreadyTakenException(),
} as const;
