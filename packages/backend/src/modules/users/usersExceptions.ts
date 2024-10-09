import { z } from 'zod';
import { UserExceptions } from '@dddforum/shared/src/modules/users/usersTypes';
import { BaseException } from '../../shared';

export abstract class UsersException extends BaseException<z.infer<typeof UserExceptions>> {}

export class UsernameAlreadyTakenException extends UsersException {
  readonly name = UserExceptions.enum.UsernameAlreadyTaken;
}

export class EmailAlreadyInUseException extends UsersException {
  readonly name = UserExceptions.enum.EmailAlreadyInUse;
}

export class UserNotFoundException extends UsersException {
  readonly name = UserExceptions.enum.UserNotFound;
}
