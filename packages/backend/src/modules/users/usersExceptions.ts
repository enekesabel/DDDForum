import { BaseException } from '../../shared';

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
