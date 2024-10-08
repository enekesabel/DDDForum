import { Request, Response, NextFunction } from 'express';
import { createAPIErrorResponseSchema, GenericErrors, StatusCodes } from '@dddforum/shared/src/shared';
import { z } from 'zod';
import { buildAPIResponse } from '../utils';
import { BaseError, ClientError, ValidationError, ServerError } from './errors';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    const responseBuilder = buildAPIResponse(res)
      .schema(createAPIErrorResponseSchema(GenericErrors))
      .error({
        code: err.message as z.infer<typeof GenericErrors>,
        message: err.message,
      });

    if (err instanceof BaseError) {
      if (err instanceof ClientError) {
        return responseBuilder.status(StatusCodes.BAD_REQUEST).build();
      }
      if (err instanceof ValidationError) {
        return responseBuilder.status(StatusCodes.BAD_REQUEST).build();
      }
      if (err instanceof ServerError) {
        return responseBuilder.status(StatusCodes.INTERNAL_SERVER_ERROR).build();
      }
    }

    console.error(err);

    errorHandler(new ServerError(), req, res, next);
  } else {
    next();
  }
};
