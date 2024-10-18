import { z, ZodError } from 'zod';
import { Request } from 'express';
import { InvalidRequestBodyException } from '../../shared';

export const CreateUserCommandSchema = z.object({
  email: z.string().email(),
  username: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

type Props = z.infer<typeof CreateUserCommandSchema>;

export class CreateUserCommand {
  static FromRequest(request: Request) {
    try {
      return this.Create(request.body);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new InvalidRequestBodyException(error.message);
      }

      throw error;
    }
  }

  static Create(value: Props) {
    return new CreateUserCommand(value);
  }

  readonly value: Props;

  private constructor(value: Props) {
    this.value = CreateUserCommandSchema.parse(value);
  }
}
