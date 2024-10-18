import { z, ZodError } from 'zod';
import { InvalidRequestBodyException, ServerErrorException } from '../errors';

export const createCommand = <T extends z.ZodTypeAny>(zodSchema: T, data: z.infer<T>): z.infer<T> => {
  try {
    return zodSchema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new InvalidRequestBodyException(error.message);
    }
    throw new ServerErrorException();
  }
};
