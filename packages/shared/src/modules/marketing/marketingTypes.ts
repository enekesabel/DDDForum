import { z } from 'zod';
import { GenericErrors, createAPIResponseSchema } from '../../shared';

export const AddToEmailListErrors = z.enum(GenericErrors.options);
export const AddToEmailListResponseSchema = createAPIResponseSchema(z.void(), AddToEmailListErrors);
export type AddToEmailListResponse = z.infer<typeof AddToEmailListResponseSchema>;
