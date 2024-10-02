// https://stackoverflow.com/questions/41102060/typescript-extending-error-class/48342359#48342359
export abstract class CustomError extends Error {
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

export abstract class BaseError extends CustomError {}

export abstract class BaseException extends CustomError {}

export class ValidationError extends BaseError {
  constructor() {
    super('ValidationError');
  }
}

export class ServerError extends BaseError {
  constructor() {
    super('ServerError');
  }
}

export class ClientError extends BaseError {
  constructor() {
    super('ClientError');
  }
}
