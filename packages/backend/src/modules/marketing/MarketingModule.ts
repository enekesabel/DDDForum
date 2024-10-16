import { WebServer } from '../../shared';
import { MarketingController } from './MarketingController';
import { ProductionContactListAPI } from './adapters/ProductionContactListAPI';
import { MarketingService } from './MarketingService';
import { ContactListAPI } from './ports/ContactListAPI';

export class MarketingModule {
  private contactListAPI: ContactListAPI;
  private marketingService: MarketingService;
  private marketingController: MarketingController;

  constructor(webServer: WebServer) {
    this.contactListAPI = new ProductionContactListAPI();
    this.marketingService = new MarketingService(this.contactListAPI);
    this.marketingController = new MarketingController(this.marketingService);

    webServer.registerController('/marketing', this.marketingController);
  }

  getMarketingService() {
    return this.marketingService;
  }
}
