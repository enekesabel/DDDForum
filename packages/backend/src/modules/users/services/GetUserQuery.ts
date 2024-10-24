import { z } from 'zod';
import { Request } from 'express';
import { RequestValidator, ValidationErrorException } from '../../../shared';

const ResponseQuerySchema = z.object({
  email: z.string().email(),
});

export class GetUserQuery {
  static FromRequest(request: Request) {
    const { email } = RequestValidator.ValidateQueryParams(request, ResponseQuerySchema);
    return new GetUserQuery(email);
  }

  static Create(email: string) {
    try {
      return new GetUserQuery(ResponseQuerySchema.parse({ email }).email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationErrorException(error.message);
      }
      throw error;
    }
  }

  private constructor(public readonly value: string) {
    this.value = value;
  }
}
