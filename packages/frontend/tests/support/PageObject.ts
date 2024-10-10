import { PageComponent } from './PageComponent';
import { PuppeteerPageDriver } from './PuppeteerPageDriver';

export abstract class PageObject extends PageComponent {
  public url: string;

  constructor(driver: PuppeteerPageDriver, url: string) {
    super(driver);
    this.url = url;
  }

  public async open() {
    await this.driver.page.goto(this.url);
  }
}
