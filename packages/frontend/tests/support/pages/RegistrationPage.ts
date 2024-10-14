import { UserInput } from '@dddforum/shared/src/modules/users';
import { PageObject } from '../PageObject';
import { PuppeteerPageDriver } from '../PuppeteerPageDriver';
import { createPageElementsConfig } from '../PageElements';

const pageElementsConfig = createPageElementsConfig({
  emailInput: { selector: 'input[type="email"]' },
  usernameInput: { selector: 'input[placeholder="username"]' },
  firstNameInput: { selector: 'input[placeholder="first name"]' },
  lastNameInput: { selector: 'input[placeholder="last name"]' },
  marketingCheckbox: { selector: 'input[type="checkbox"]' },
  submitButton: { selector: 'button.submit-button' },
});

export class RegistrationPage extends PageObject<typeof pageElementsConfig> {
  constructor(driver: PuppeteerPageDriver, url: string) {
    super(driver, url, pageElementsConfig);
  }

  async acceptMarketingEmails() {
    await this.pageElements.get('marketingCheckbox').then((el) => el.click());
  }

  async enterAccountDetails(userInput: UserInput) {
    await this.pageElements.get('emailInput').then((el) => el.type(userInput.email));
    await this.pageElements.get('usernameInput').then((el) => el.type(userInput.username));
    await this.pageElements.get('firstNameInput').then((el) => el.type(userInput.firstName));
    await this.pageElements.get('lastNameInput').then((el) => el.type(userInput.lastName));
  }

  async submitRegistrationForm() {
    await this.pageElements.get('submitButton').then((el) => el.click());
  }
}
