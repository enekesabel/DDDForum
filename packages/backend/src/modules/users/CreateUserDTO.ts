import { z } from 'zod';

export const CreateUserDTOSchema = z.object({
  email: z.string().email(),
  username: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export type CreateUserDTO = z.infer<typeof CreateUserDTOSchema>;
