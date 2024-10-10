import { UserInput } from '@dddforum/shared/src/modules/users';
import { PageObject } from '../PageObject';

export class RegistrationPage extends PageObject {
  async acceptMarketingEmails() {
    await this.driver.page.click('input[type="checkbox"]');
  }

  async enterAccountDetails(userInput: UserInput) {
    await this.driver.page.type('input[type="email"]', userInput.email);
    await this.driver.page.type('input[placeholder="username"]', userInput.username);
    await this.driver.page.type('input[placeholder="first name"]', userInput.firstName);
    await this.driver.page.type('input[placeholder="last name"]', userInput.lastName);
  }

  async submitRegistrationForm() {
    await this.driver.page.click('button.submit-button');
  }
}
