import { Request } from 'express';
import { z } from 'zod';
import {
  InvalidRequestBodyException,
  InvalidRequestParamException,
  InvalidRequestQueryException,
  MissingRequestParamException,
  MissingRequestQueryException,
} from '../errors';

export class RequestValidator {
  static ValidateRequestBody<T extends z.ZodTypeAny>(request: Request, schema: T): z.infer<T> {
    try {
      return schema.parse(request.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new InvalidRequestBodyException(error.message);
      }
      throw error;
    }
  }
  private static FindMissingFields(error: z.ZodError): string[] {
    if (error.issues.length == 1 && error.issues[0].code == 'invalid_union') {
      return this.FindMissingFields(error.issues[0].unionErrors[0]);
    }
    const missingFields = error.issues
      .filter((issue) => {
        return issue.code === 'invalid_type' && issue.received === 'undefined';
      })
      .map((issue) => {
        return issue.path.join('.');
      });
    return missingFields;
  }

  static ValidateQueryParams<T extends z.ZodTypeAny>(request: Request, schema: T): z.infer<T> {
    try {
      return schema.parse(request.query);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const missingQueryParams = this.FindMissingFields(error);
        if (missingQueryParams.length > 0) {
          throw new MissingRequestQueryException(`Missing query params: ${missingQueryParams.join(', ')}`);
        }
        throw new InvalidRequestQueryException(error.message);
      }
      throw error;
    }
  }

  static ValidateParams<T extends z.ZodTypeAny>(request: Request, schema: T): z.infer<T> {
    try {
      return schema.parse(request.params);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const missingRequestParams = this.FindMissingFields(error);
        if (missingRequestParams.length > 0) {
          throw new MissingRequestParamException(`Missing request params: ${missingRequestParams.join(', ')}`);
        }
        throw new InvalidRequestParamException(error.message);
      }

      throw error;
    }
  }
}
