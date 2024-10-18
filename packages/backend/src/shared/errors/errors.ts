import { GenericErrors, ValidationErrorExceptions, ClientErrorExceptions } from '@dddforum/shared/src/shared';
import { z } from 'zod';

// https://stackoverflow.com/questions/41102060/typescript-extending-error-class/48342359#48342359
export abstract class CustomError<Name extends string, Code extends string> extends Error {
  readonly name: Name;
  readonly code: Code;

  constructor(message: string, name: Name, code: Code) {
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

    this.name = name;
    this.code = code;
  }
}

export abstract class ApplicationException<Name extends string> extends CustomError<Name, Name> {
  constructor(message: string, name: Name) {
    super(message, name, name);
  }
}

export abstract class GenericError<Name extends string> extends CustomError<Name, z.infer<typeof GenericErrors>> {}

export abstract class ValidationErrorException<
  Name extends z.infer<typeof ValidationErrorExceptions>,
> extends GenericError<Name> {
  constructor(message: string, name: Name) {
    super(message, name, GenericErrors.enum.ValidationError);
  }
}

export class InvalidRequestBodyException extends ValidationErrorException<
  typeof ValidationErrorExceptions.enum.InvalidRequestBodyException
> {
  constructor(message: string) {
    super(message, ValidationErrorExceptions.enum.InvalidRequestBodyException);
  }
}

export class InvalidRequestParamException extends ValidationErrorException<
  typeof ValidationErrorExceptions.enum.InvalidRequestParamException
> {
  constructor(message: string) {
    super(message, ValidationErrorExceptions.enum.InvalidRequestParamException);
  }
}

export class InvalidRequestQueryException extends ValidationErrorException<
  typeof ValidationErrorExceptions.enum.InvalidRequestQueryException
> {
  constructor(message: string) {
    super(message, ValidationErrorExceptions.enum.InvalidRequestQueryException);
  }
}

export abstract class ClientErrorException<
  Name extends z.infer<typeof ClientErrorExceptions>,
> extends GenericError<Name> {
  constructor(message: string, name: Name) {
    super(message, name, GenericErrors.enum.ClientError);
  }
}

export class MissingRequestParamException extends ClientErrorException<
  typeof ClientErrorExceptions.enum.MissingRequestParamException
> {
  constructor(message: string) {
    super(message, ClientErrorExceptions.enum.MissingRequestParamException);
  }
}

export class MissingRequestQueryException extends ClientErrorException<
  typeof ClientErrorExceptions.enum.MissingRequestQueryException
> {
  constructor(message: string) {
    super(message, ClientErrorExceptions.enum.MissingRequestQueryException);
  }
}

export class ServerErrorException extends GenericError<typeof GenericErrors.enum.ServerError> {
  constructor(message: string = 'Unknown server error occurred.') {
    super(message, GenericErrors.enum.ServerError, GenericErrors.enum.ServerError);
  }
}
