import { z } from 'zod';
import { Request } from 'express';
import { RequestValidator, ValidationErrorException } from '../../../shared';

export const AddToEmailListCommandSchema = z.object({
  email: z.string().email(),
});

type Props = z.infer<typeof AddToEmailListCommandSchema>;

export class AddToEmailListCommand {
  static FromRequest(request: Request) {
    return this.Create(RequestValidator.ValidateRequestBody(request, AddToEmailListCommandSchema).email);
  }

  static Create(email: string) {
    try {
      return new AddToEmailListCommand({ email: AddToEmailListCommandSchema.parse({ email }).email });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationErrorException(error.message);
      }

      throw error;
    }
  }

  private constructor(readonly value: Props) {}
}
