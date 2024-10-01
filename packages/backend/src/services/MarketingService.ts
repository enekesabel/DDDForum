import { ContactListAPI } from '../external/ContactListAPI';

export class MarketingService {
  constructor(private contactListAPI: ContactListAPI) {}

  async addEmailToList(email: string) {
    return this.contactListAPI.addEmailToList(email);
  }
}
