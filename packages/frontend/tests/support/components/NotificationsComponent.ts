import { PageComponent } from '../PageComponent';
import { PuppeteerPageDriver } from '../PuppeteerPageDriver';

const pageElementsConfig = {
  errorToast: { selector: '.Toastify__toast--error' },
  successToast: { selector: '.Toastify__toast--default' },
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
