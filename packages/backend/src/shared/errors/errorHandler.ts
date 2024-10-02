import { Request, Response, NextFunction } from 'express';
import { ResponseBuilder } from '../utils';
import { BaseError, ClientError, ValidationError, ServerError } from './errors';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    const responseBuilder = new ResponseBuilder(res);
    responseBuilder.error(err.message);

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
