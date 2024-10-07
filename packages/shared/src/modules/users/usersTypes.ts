import { z } from 'zod';
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

export const UserExceptions = z.enum(['EmailAlreadyInUse', 'UsernameAlreadyTaken', 'UserNotFound']);

export const GetUserExceptions = z.enum([...GenericErrors.options, UserExceptions.enum.UserNotFound]);
export type GetUserResponse = APIResponse<User, z.infer<typeof GetUserExceptions>>;

export const UpdateUserExceptions = z.enum([...GenericErrors.options, ...UserExceptions.options]);
export type UpdateUserResponse = APIResponse<User, z.infer<typeof UpdateUserExceptions>>;

export const CreateUserErrors = z.enum([
  ...GenericErrors.options,
  UserExceptions.enum.EmailAlreadyInUse,
  UserExceptions.enum.UsernameAlreadyTaken,
]);
export type CreateUserResponse = APIResponse<User, z.infer<typeof CreateUserErrors>>;
