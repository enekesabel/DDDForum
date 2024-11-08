import { PageComponent } from './PageComponent';
import { PageElementsConfig } from './PageElements';
import { PuppeteerPageDriver } from './PuppeteerPageDriver';

export abstract class PageObject<T extends PageElementsConfig> extends PageComponent<T> {
  readonly url: string;

  constructor(driver: PuppeteerPageDriver, url: string, config: T) {
    super(driver, config);
    this.url = url;
  }

  async open() {
    await this.driver.page.goto(this.url);
  }
}
