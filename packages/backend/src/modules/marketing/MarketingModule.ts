import { WebServer } from '../../shared';
import { ContactListAPI } from './ContactListAPI';
import { MarketingController } from './MarketingController';
import { MarketingService } from './MarketingService';

export class MarketingModule {
  private contactListAPI: ContactListAPI;
  private marketingService: MarketingService;
  private marketingController: MarketingController;

  constructor(webServer: WebServer) {
    this.contactListAPI = new ContactListAPI();
    this.marketingService = new MarketingService(this.contactListAPI);
    this.marketingController = new MarketingController(this.marketingService);

    webServer.registerController('/marketing', this.marketingController);
  }
}
