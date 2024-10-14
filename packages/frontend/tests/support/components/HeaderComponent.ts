import { PageComponent } from '../PageComponent';
import { createPageElementsConfig } from '../PageElements';
import { PuppeteerPageDriver } from '../PuppeteerPageDriver';

const pageElementsConfig = createPageElementsConfig({
  userName: {
    selector: '#header-action-button .username',
  },
});

export class HeaderComponent extends PageComponent<typeof pageElementsConfig> {
  constructor(protected driver: PuppeteerPageDriver) {
    super(driver, pageElementsConfig);
  }

  async getLoggedInUserName(): Promise<string | null> {
    const userNameElement = await this.pageElements.get('userName');
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
