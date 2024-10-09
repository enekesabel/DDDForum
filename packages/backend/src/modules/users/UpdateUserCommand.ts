import { z } from 'zod';
import { CreateUserCommandSchema } from './CreateUserCommand';

export const UpdateUserCommandSchema = CreateUserCommandSchema.partial();

export type UpdateUserCommand = z.infer<typeof UpdateUserCommandSchema>;
