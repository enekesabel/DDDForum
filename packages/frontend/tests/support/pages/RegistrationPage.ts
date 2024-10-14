import { UserInput } from '@dddforum/shared/src/modules/users';
import { PageObject } from '../PageObject';
import { PuppeteerPageDriver } from '../PuppeteerPageDriver';
import { createPageElementsConfig } from '../PageElements';
import { AppSelectors } from '../../../src/shared/selectors';

const pageElementsConfig = createPageElementsConfig({
  emailInput: { selector: AppSelectors.registration.registrationForm.email.selector },
  usernameInput: { selector: AppSelectors.registration.registrationForm.username.selector },
  firstNameInput: { selector: AppSelectors.registration.registrationForm.firstname.selector },
  lastNameInput: { selector: AppSelectors.registration.registrationForm.lastname.selector },
  marketingCheckbox: { selector: AppSelectors.registration.registrationForm.marketingCheckbox.selector },
  submitButton: { selector: AppSelectors.registration.registrationForm.submit.selector },
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
