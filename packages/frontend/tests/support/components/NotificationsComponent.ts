import { PageComponent } from '../PageComponent';
import { PuppeteerPageDriver } from '../PuppeteerPageDriver';
import { AppSelectors } from '../../../src/shared/selectors';

export class NotificationsComponent extends PageComponent<typeof AppSelectors.notifications> {
  constructor(driver: PuppeteerPageDriver) {
    super(driver, AppSelectors.notifications);
  }

  async getErrorMessage(): Promise<string | null> {
    const toastElement = await this.pageElements.get('failure');

    return toastElement.evaluate((el) => el.textContent);
  }

  async getSuccessMessage(): Promise<string | null> {
    const toastElement = await this.pageElements.get('success');
    return toastElement.evaluate((el) => el.textContent);
  }
}
