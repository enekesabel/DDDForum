import { ProductionTransactionalEmailAPI } from './adapters/ProductionTransactionalEmailAPI';
import { TransactionalEmailAPI } from './ports/TransactionalEmailAPI';
import { NotificationsService } from './NotificationsService';

export class NotificationsModule {
  private transactionalEmailAPI: TransactionalEmailAPI = new ProductionTransactionalEmailAPI();
  private notificationsService: NotificationsService = new NotificationsService(this.transactionalEmailAPI);

  getNotificationsService() {
    return this.notificationsService;
  }
}
