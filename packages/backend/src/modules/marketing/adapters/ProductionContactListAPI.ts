import { ContactListAPI } from '../ports/ContactListAPI';

export class ProductionContactListAPI implements ContactListAPI {
  async addEmailToList(email: string): Promise<void> {
    // Implement actual API interaction here.  For now, it's a placeholder.
    console.log(`Adding email ${email} to contact list`);
    return;
  }
}
