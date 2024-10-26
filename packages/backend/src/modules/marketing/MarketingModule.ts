import { WebServer, Config } from '../../shared';
import { Application } from '../../core';
import { MarketingController } from './MarketingController';
import { MockContactListAPI, ProductionContactListAPI } from './adapters';
import { MarketingService } from './MarketingService';
import { ContactListAPI } from './ports/ContactListAPI';

export class MarketingModule {
  private contactListAPI: ContactListAPI;
  private marketingService: MarketingService;
  private config: Config;

  constructor(config: Config) {
    this.config = config;
    this.contactListAPI = this.createContactListAPI();
    this.marketingService = new MarketingService(this.contactListAPI);
  }

  private createContactListAPI() {
    switch (this.config.script) {
      case 'test:unit':
      case 'start:dev':
      case 'test:infra:incoming':
        return new MockContactListAPI();
      default:
        return new ProductionContactListAPI();
    }
  }

  setUpRoutes(app: Application, webServer: WebServer) {
    const marketingController = new MarketingController(app);
    webServer.registerController('/marketing', marketingController);
  }

  getMarketingService() {
    return this.marketingService;
  }
}
