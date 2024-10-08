import { Request, Response, NextFunction } from 'express';
import { createAPIErrorResponseSchema, StatusCodes } from '@dddforum/shared/src/shared';
import { UserExceptions } from '@dddforum/shared/src/modules/users';
import { z } from 'zod';
import { buildAPIResponse } from '../../shared';
import { UserNotFoundException, EmailAlreadyInUseException, UsernameAlreadyTakenException } from './usersExceptions';

export const usersErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    const responseBuilder = buildAPIResponse(res)
      .schema(createAPIErrorResponseSchema(UserExceptions))
      .error({
        code: err.message as z.infer<typeof UserExceptions>,
        message: err.message,
      });

    if (err instanceof UserNotFoundException) {
      return responseBuilder.status(StatusCodes.NOT_FOUND).build();
    }
    if (err instanceof EmailAlreadyInUseException || err instanceof UsernameAlreadyTakenException) {
      return responseBuilder.status(StatusCodes.CONFLICT).build();
    }
    return next(err);
  } else {
    next();
  }
};
