import { z } from 'zod';
import { GenericErrors, APIResponse } from '../../shared';

export const AddToEmailListErrors = z.enum(GenericErrors.options);
export type AddToEmailListResponse = APIResponse<void, z.infer<typeof AddToEmailListErrors>>;
