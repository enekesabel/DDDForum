import { z } from 'zod';
import { UserExceptions } from '@dddforum/shared/src/modules/users';
import { ApplicationException } from '../../shared';

export abstract class UsersException<T extends z.infer<typeof UserExceptions>> extends ApplicationException<T> {}

export class UsernameAlreadyTakenException extends UsersException<typeof UserExceptions.enum.UsernameAlreadyTaken> {
  constructor() {
    super('Username already taken.', UserExceptions.enum.UsernameAlreadyTaken);
  }
}

export class EmailAlreadyInUseException extends UsersException<typeof UserExceptions.enum.EmailAlreadyInUse> {
  constructor() {
    super('Email already in use.', UserExceptions.enum.EmailAlreadyInUse);
  }
}

export class UserNotFoundException extends UsersException<typeof UserExceptions.enum.UserNotFound> {
  constructor() {
    super('User not found.', UserExceptions.enum.UserNotFound);
  }
}
