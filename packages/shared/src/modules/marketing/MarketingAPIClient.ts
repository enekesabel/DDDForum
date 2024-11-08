import { HTTPClient } from '../../shared';
import { AddToEmailListResponse } from './marketingTypes';

export class MarketingAPIClient extends HTTPClient {
  constructor(baseUrl: string) {
    super(`${baseUrl}/marketing`);
  }

  async addEmailToList(email: string) {
    return (await this.post('/new', { email })) as AddToEmailListResponse;
  }
}
