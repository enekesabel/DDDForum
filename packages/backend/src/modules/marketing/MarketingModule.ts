import { WebServer, Config } from '../../shared';
import { MarketingController } from './MarketingController';
import { ProductionContactListAPI } from './adapters/ProductionContactListAPI';
import { MarketingService } from './MarketingService';
import { ContactListAPI } from './ports/ContactListAPI';

export class MarketingModule {
  private contactListAPI: ContactListAPI;
  private marketingService: MarketingService;
  private marketingController: MarketingController;
  private config: Config;

  constructor(config: Config, webServer: WebServer) {
    this.config = config;
    this.contactListAPI = this.createContactListAPI();
    this.marketingService = new MarketingService(this.contactListAPI);
    this.marketingController = new MarketingController(this.marketingService);

    webServer.registerController('/marketing', this.marketingController);
  }

  private createContactListAPI() {
    if (this.config.env === 'production') return new ProductionContactListAPI();

    return new ProductionContactListAPI();
  }

  getMarketingService() {
    return this.marketingService;
  }
}
