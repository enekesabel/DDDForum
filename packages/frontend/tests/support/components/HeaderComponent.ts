import { PageComponent } from '../PageComponent';

export class HeaderComponent extends PageComponent {
  async getLoggedInUserName(): Promise<string | null> {
    const userNameElement = await this.driver.page.$('#header-action-button > div > div:first-child');
    if (userNameElement) {
      return await userNameElement.evaluate((el) => el.textContent);
    }
    return null;
  }

  async isUserLoggedIn(): Promise<boolean> {
    const userName = await this.getLoggedInUserName();
    return userName !== null;
  }
}
