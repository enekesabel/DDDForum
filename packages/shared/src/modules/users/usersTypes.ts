import { APIResponse, GenericErrors } from '../../shared';

export type UserInput = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
};

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
};

export enum UserExceptions {
  EmailAlreadyInUse = 'EmailAlreadyInUse',
  UsernameAlreadyTaken = 'UsernameAlreadyTaken',
  UserNotFound = 'UserNotFound',
}

export type GetUserExceptions = GenericErrors | UserExceptions.UserNotFound;
export type GetUserResponse = APIResponse<User, GetUserExceptions>;

export type UpdateUserExceptions = GenericErrors | UserExceptions;
export type UpdateUserResponse = APIResponse<User, UpdateUserExceptions>;

export type CreateUserErrors = GenericErrors | UserExceptions.EmailAlreadyInUse | UserExceptions.UsernameAlreadyTaken;
export type CreateUserResponse = APIResponse<User, CreateUserErrors>;
