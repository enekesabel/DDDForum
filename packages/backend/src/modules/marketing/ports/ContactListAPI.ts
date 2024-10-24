export interface ContactListAPI {
  addEmailToList(email: string): Promise<void>;
}
