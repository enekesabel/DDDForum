import { APIClient } from '@dddforum/shared/src/core';
import { appConfig } from './config';

export const api = new APIClient(appConfig.apiURL);
