import { Request, Response, NextFunction } from 'express';
import { createAPIErrorResponseSchema, StatusCodes } from '@dddforum/shared/src/shared';
import { UserExceptions } from '@dddforum/shared/src/modules/users';
import { buildAPIResponse } from '../../shared';
import { UsersException } from './usersExceptions';

export const usersErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err && err instanceof UsersException) {
    const responseBuilder = buildAPIResponse(res).schema(createAPIErrorResponseSchema(UserExceptions)).error(err);

    switch (err.code) {
      case UserExceptions.Enum.UserNotFound:
        return responseBuilder.status(StatusCodes.NOT_FOUND).build();
      case UserExceptions.Enum.EmailAlreadyInUse:
        return responseBuilder.status(StatusCodes.CONFLICT).build();
      case UserExceptions.Enum.UsernameAlreadyTaken:
        return responseBuilder.status(StatusCodes.CONFLICT).build();
    }
  } else {
    next(err);
  }
};
