import { CustomError } from './CustomError';

export abstract class BaseException extends CustomError {}

export class UsernameAlreadyTakenException extends BaseException {
  constructor() {
    super('UsernameAlreadyTaken');
  }
}

export class EmailAlreadyInUseException extends BaseException {
  constructor() {
    super('EmailAlreadyInUse');
  }
}

export class UserNotFoundException extends BaseException {
  constructor() {
    super('UserNotFound');
  }
}
