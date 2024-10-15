import puppeteer, { Browser, Page } from 'puppeteer';

type CreateOptions = Parameters<typeof puppeteer.launch>[0];

export class PuppeteerPageDriver {
  static async Create(options: CreateOptions) {
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();
    const instance = new PuppeteerPageDriver(browser, page);
    return instance;
  }

  constructor(
    private browser: Browser,
    readonly page: Page
  ) {}

  close() {
    return this.browser.close();
  }
}
