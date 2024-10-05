import { z } from 'zod';

export const CreateUserCommandSchema = z.object({
  email: z.string().email(),
  username: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export type CreateUserCommand = z.infer<typeof CreateUserCommandSchema>;
