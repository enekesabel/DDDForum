import { ContactListAPI } from '../ports/ContactListAPI';
import { MockContactListAPI } from './MockContactListAPI';
import { ProductionContactListAPI } from './ProductionContactListAPI';

const contactListAPIs: ContactListAPI[] = [new ProductionContactListAPI(), new MockContactListAPI()];

describe.each(contactListAPIs)('ContactListAPI', (contactListApi: ContactListAPI) => {
  it('should add an email to the list', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log');
    const email = 'test@example.com';
    await contactListApi.addEmailToList(email);

    expect(consoleLogSpy).toHaveBeenCalledWith(`Adding email ${email} to contact list`);
  });
});
