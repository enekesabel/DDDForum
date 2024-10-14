import { PageComponent } from '../PageComponent';
import { PuppeteerPageDriver } from '../PuppeteerPageDriver';
import { AppSelectors } from '../../../src/shared/selectors';

const pageElementsConfig = {
  errorToast: { selector: AppSelectors.notifications.failure.selector },
  successToast: { selector: AppSelectors.notifications.success.selector },
} as const;

export class NotificationsComponent extends PageComponent<typeof pageElementsConfig> {
  constructor(driver: PuppeteerPageDriver) {
    super(driver, pageElementsConfig);
  }

  async getErrorMessage(): Promise<string | null> {
    const toastElement = await this.pageElements.get('errorToast');

    return toastElement.evaluate((el) => el.textContent);
  }

  async getSuccessMessage(): Promise<string | null> {
    const toastElement = await this.pageElements.get('successToast');
    return toastElement.evaluate((el) => el.textContent);
  }
}
