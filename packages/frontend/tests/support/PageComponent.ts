import { PageElements, PageElementsConfig } from './PageElements';
import { PuppeteerPageDriver } from './PuppeteerPageDriver';

export abstract class PageComponent<T extends PageElementsConfig> {
  protected get pageElements(): PageElements<T> {
    return new PageElements(this.config, this.driver);
  }
  constructor(
    protected driver: PuppeteerPageDriver,
    private config: T
  ) {}
}
