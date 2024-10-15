import { ProductionTransactionalEmailAPI } from './adapters/ProductionTransactionalEmailAPI';
import { TransactionalEmailAPI } from './ports/TransactionalEmailAPI';

export class NotificationsModule {
  private transactionalEmailAPI: TransactionalEmailAPI = new ProductionTransactionalEmailAPI();

  getTransactionalEmailAPI() {
    return this.transactionalEmailAPI;
  }
}
