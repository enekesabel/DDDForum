import { HeaderComponent, NotificationsComponent } from './components';
import { RegistrationPage } from './pages';
import { PuppeteerPageDriver } from './PuppeteerPageDriver';

export interface App {
  pages: {
    registrationPage: RegistrationPage;
  };
  layout: {
    header: HeaderComponent;
    notifications: NotificationsComponent;
  };
  waitForNavigation(): Promise<void>;
}

export async function createApp(driver: PuppeteerPageDriver): Promise<App> {
  const pages = {
    registrationPage: new RegistrationPage(driver, 'http://localhost:5173/join'),
  };
  const layout = {
    header: new HeaderComponent(driver),
    notifications: new NotificationsComponent(driver),
  };
  return {
    async waitForNavigation() {
      await driver.page.waitForNavigation();
    },
    pages,
    layout,
  };
}
