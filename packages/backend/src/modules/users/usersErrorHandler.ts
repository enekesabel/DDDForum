import { Request, Response, NextFunction } from 'express';
import { ResponseBuilder } from '../../shared';
import { UserNotFoundException, EmailAlreadyInUseException, UsernameAlreadyTakenException } from './usersExceptions';

export const usersErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    const responseBuilder = new ResponseBuilder(res);
    responseBuilder.error(err.message);

    if (err instanceof UserNotFoundException) {
      return responseBuilder.status(404).build();
    }
    if (err instanceof EmailAlreadyInUseException) {
      return responseBuilder.status(409).build();
    }
    if (err instanceof UsernameAlreadyTakenException) {
      return responseBuilder.status(409).build();
    }
    return next(err);
  } else {
    next();
  }
};
