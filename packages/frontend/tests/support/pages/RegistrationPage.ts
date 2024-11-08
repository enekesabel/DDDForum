import { UserInput } from '@dddforum/shared/src/modules/users';
import { PageObject } from '../PageObject';
import { PuppeteerPageDriver } from '../PuppeteerPageDriver';
import { AppSelectors } from '../../../src/shared/selectors';

export class RegistrationPage extends PageObject<typeof AppSelectors.registration.registrationForm> {
  constructor(driver: PuppeteerPageDriver, url: string) {
    super(driver, url, AppSelectors.registration.registrationForm);
  }

  async acceptMarketingEmails() {
    await this.pageElements.get('marketingCheckbox').then((el) => el.click());
  }

  async enterAccountDetails(userInput: UserInput) {
    await this.pageElements.get('email').then((el) => el.type(userInput.email));
    await this.pageElements.get('username').then((el) => el.type(userInput.username));
    await this.pageElements.get('firstname').then((el) => el.type(userInput.firstName));
    await this.pageElements.get('lastname').then((el) => el.type(userInput.lastName));
  }

  async submitRegistrationForm() {
    await this.pageElements.get('submit').then((el) => el.click());
  }
}
