import { z } from 'zod';
import { createAPIResponseSchema, GenericErrors } from '../../shared';

export type UserInput = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
};

export const UserSchema = z.object({
  id: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  username: z.string(),
});
export type User = z.infer<typeof UserSchema>;

export const UserExceptions = z.enum(['EmailAlreadyInUse', 'UsernameAlreadyTaken', 'UserNotFound']);

export const GetUserExceptions = z.enum([...GenericErrors.options, UserExceptions.enum.UserNotFound]);
export const GetUserResponseSchema = createAPIResponseSchema(UserSchema, GetUserExceptions);
export type GetUserResponse = z.infer<typeof GetUserResponseSchema>;

export const UpdateUserExceptions = z.enum([...GenericErrors.options, ...UserExceptions.options]);
export const UpdateUserResponseSchema = createAPIResponseSchema(UserSchema, UpdateUserExceptions);
export type UpdateUserResponse = z.infer<typeof UpdateUserResponseSchema>;

export const CreateUserErrors = z.enum([
  ...GenericErrors.options,
  UserExceptions.enum.EmailAlreadyInUse,
  UserExceptions.enum.UsernameAlreadyTaken,
]);

export const CreateUserResponseSchema = createAPIResponseSchema(UserSchema, CreateUserErrors);
export type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>;
