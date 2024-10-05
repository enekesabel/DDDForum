import { z } from 'zod';
import { CreateUserDTOSchema } from './CreateUserDTO';

export const UpdateUserDTOSchema = CreateUserDTOSchema.partial();

export type UpdateUserDTO = z.infer<typeof UpdateUserDTOSchema>;
