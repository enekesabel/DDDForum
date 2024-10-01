import { Request, Response, NextFunction } from 'express';
import { BaseError, ClientError, ServerError, ValidationError } from '@dddforum/shared/src/errors/errors';
import {
  BaseException,
  EmailAlreadyInUseException,
  UsernameAlreadyTakenException,
  UserNotFoundException,
} from '@dddforum/shared/src/errors/exceptions';
import { ResponseBuilder } from './utils';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    const responseBuilder = new ResponseBuilder(res);
    responseBuilder.error(err.message);

    if (err instanceof BaseException) {
      if (err instanceof UserNotFoundException) {
        return responseBuilder.status(404).build();
      }
      if (err instanceof EmailAlreadyInUseException) {
        return responseBuilder.status(409).build();
      }
      if (err instanceof UsernameAlreadyTakenException) {
        return responseBuilder.status(409).build();
      }
    }

    if (err instanceof BaseError) {
      if (err instanceof ClientError) {
        return responseBuilder.status(400).build();
      }
      if (err instanceof ValidationError) {
        return responseBuilder.status(400).build();
      }
      if (err instanceof ServerError) {
        return responseBuilder.status(500).build();
      }
    }

    return responseBuilder.status(500).error(new ServerError().message).build();
  } else {
    next();
  }
};
