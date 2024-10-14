import { ElementHandle } from 'puppeteer';
import { PageComponent } from './PageComponent';
import { PuppeteerPageDriver } from './PuppeteerPageDriver';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PageElementsSelector = { selector: string } | PageComponent<any>;

export type PageElementsConfig = {
  [key: string]: PageElementsSelector;
};

export const createPageElementsConfig = <T extends PageElementsConfig>(config: T) => {
  return config;
};

type ReturnTypeFromConfig<T extends PageElementsConfig, Name extends keyof T> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T[Name] extends PageComponent<any> ? T[Name] : ElementHandle<Element>;

export class PageElements<T extends PageElementsConfig> {
  constructor(
    private config: T,
    private driver: PuppeteerPageDriver
  ) {}

  async get<Name extends keyof typeof this.config>(
    nameKey: Name,
    timeout = 1000
  ): Promise<ReturnTypeFromConfig<T, Name>> {
    const component = this.config[nameKey];

    if (component instanceof PageComponent) {
      return component as ReturnTypeFromConfig<T, Name>;
    }
    let element: ElementHandle<Element> | null = null;
    try {
      element = await this.driver.page.waitForSelector(component.selector, { timeout });
    } catch (_err) {
      throw new Error(`Element ${nameKey.toString()} not found!`);
    }

    if (!element) {
      throw new Error(`Could not load component's element ${nameKey.toString()}: maybe it's not on the page yet.`);
    }

    return element as ReturnTypeFromConfig<T, Name>;
  }
}
