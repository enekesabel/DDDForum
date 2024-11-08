import { z } from 'zod';
import { UserExceptions } from '@dddforum/shared/src/modules/users';
import { ApplicationException } from '../../shared';

export abstract class UsersException extends ApplicationException<z.infer<typeof UserExceptions>> {}

export class UsernameAlreadyTakenException extends UsersException {
  constructor() {
    super('Username already taken.', UserExceptions.enum.UsernameAlreadyTaken);
  }
}

export class EmailAlreadyInUseException extends UsersException {
  constructor() {
    super('Email already in use.', UserExceptions.enum.EmailAlreadyInUse);
  }
}

export class UserNotFoundException extends UsersException {
  constructor() {
    super('User not found.', UserExceptions.enum.UserNotFound);
  }
}
