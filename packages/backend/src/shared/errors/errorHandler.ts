import { Request, Response, NextFunction } from 'express';
import { createAPIErrorResponseSchema, GenericErrors, StatusCodes } from '@dddforum/shared/src/shared';
import { buildAPIResponse } from '../utils';
import { ServerError, GenericError } from './errors';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    if (err instanceof GenericError) {
      const responseBuilder = buildAPIResponse(res).schema(createAPIErrorResponseSchema(GenericErrors)).error(err);

      switch (err.name) {
        case GenericErrors.Enum.ClientError:
          return responseBuilder.status(StatusCodes.BAD_REQUEST).build();
        case GenericErrors.Enum.ValidationError:
          return responseBuilder.status(StatusCodes.BAD_REQUEST).build();
        case GenericErrors.Enum.ServerError:
          return responseBuilder.status(StatusCodes.INTERNAL_SERVER_ERROR).build();
      }
    }

    errorHandler(new ServerError(), req, res, next);
  } else {
    next();
  }
};
