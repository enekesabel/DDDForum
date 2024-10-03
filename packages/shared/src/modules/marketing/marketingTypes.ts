import { GenericErrors, APIResponse } from '../../shared';

export type AddToEmailListErrors = GenericErrors;
export type AddToEmailListResponse = APIResponse<void, AddToEmailListErrors>;
