import { CustomError } from './CustomError';

export abstract class BaseError extends CustomError {}

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
