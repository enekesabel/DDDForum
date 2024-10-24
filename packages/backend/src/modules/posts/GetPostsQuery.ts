import { z } from 'zod';
import { Request } from 'express';
import { RequestValidator, ValidationErrorException } from '../../shared';

const GetPostsQuerySchema = z.object({
  sort: z.enum(['recent']),
});

export class GetPostsQuery {
  static FromRequest(request: Request) {
    const { sort } = RequestValidator.ValidateQueryParams(request, GetPostsQuerySchema);
    return new GetPostsQuery(sort);
  }

  static Create(sort: 'recent') {
    try {
      return new GetPostsQuery(GetPostsQuerySchema.parse({ sort }).sort);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationErrorException(error.message);
      }
      throw error;
    }
  }

  private constructor(public readonly value: 'recent') {
    this.value = value;
  }
}
