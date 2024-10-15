import { PageComponent } from '../PageComponent';
import { PuppeteerPageDriver } from '../PuppeteerPageDriver';
import { AppSelectors } from '../../../src/shared/selectors';

export class HeaderComponent extends PageComponent<typeof AppSelectors.header> {
  constructor(protected driver: PuppeteerPageDriver) {
    super(driver, AppSelectors.header);
  }

  async getLoggedInUserName(): Promise<string | null> {
    const userNameElement = await this.pageElements.get('username');
    return userNameElement.evaluate((el) => el.textContent);
  }

  async isUserLoggedIn(): Promise<boolean> {
    try {
      const userName = await this.getLoggedInUserName();
      return userName !== null;
    } catch (_err) {
      return false;
    }
  }
}
