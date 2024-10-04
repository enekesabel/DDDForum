import { z } from 'zod';
import { ValidationError } from '../errors';

export const createDTO = <T extends z.ZodTypeAny>(zodSchema: T, data: z.infer<T>): z.infer<T> => {
  try {
    return zodSchema.parse(data);
  } catch (_error) {
    throw new ValidationError();
  }
};
