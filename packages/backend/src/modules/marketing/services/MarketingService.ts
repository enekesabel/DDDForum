import { ContactListAPI } from '../ports/ContactListAPI';
import { AddToEmailListCommand } from './AddToEmailListCommand';

export class MarketingService {
  constructor(private contactListAPI: ContactListAPI) {}

  async addEmailToList(command: AddToEmailListCommand) {
    return this.contactListAPI.addEmailToList(command.value.email);
  }
}
