import { GenericErrors } from '@dddforum/shared/src/shared';
import { z } from 'zod';

// https://stackoverflow.com/questions/41102060/typescript-extending-error-class/48342359#48342359
export abstract class CustomError<T extends string> extends Error {
  abstract readonly name: T;

  constructor(message?: string) {
    // 'Error' breaks prototype chain here
    super(message);

    // restore prototype chain
    const actualProto = new.target.prototype;

    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.__proto__ = actualProto;
    }
  }
}

export abstract class BaseError<T extends string> extends CustomError<T> {}

export abstract class BaseException<T extends string> extends CustomError<T> {}

export abstract class GenericError extends BaseError<z.infer<typeof GenericErrors>> {}

export class ValidationError extends GenericError {
  readonly name = GenericErrors.Enum.ValidationError;
}

export class ServerError extends GenericError {
  readonly name = GenericErrors.Enum.ServerError;
}

export class ClientError extends GenericError {
  readonly name = GenericErrors.Enum.ClientError;
}
