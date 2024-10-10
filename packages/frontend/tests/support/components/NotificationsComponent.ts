import { PageComponent } from '../PageComponent';

export class NotificationsComponent extends PageComponent {
  async getErrorMessage(): Promise<string | null> {
    const toastElement = await this.driver.page.waitForSelector('.Toastify__toast--error');
    if (toastElement) {
      return await toastElement.evaluate((el) => el.textContent);
    }
    return null;
  }

  async getSuccessMessage(): Promise<string | null> {
    const toastElement = await this.driver.page.waitForSelector('.Toastify__toast--default');
    if (toastElement) {
      return await toastElement.evaluate((el) => el.textContent);
    }
    return null;
  }
}
