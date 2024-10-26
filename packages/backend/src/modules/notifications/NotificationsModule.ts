import { Config } from '../../shared';
import { TransactionalEmailAPI } from './ports/TransactionalEmailAPI';
import { NotificationsService } from './NotificationsService';
import { MockTransactionalEmailAPI, ProductionTransactionalEmailAPI } from './adapters';

export class NotificationsModule {
  private transactionalEmailAPI: TransactionalEmailAPI;
  private notificationsService: NotificationsService;

  constructor(private config: Config) {
    this.transactionalEmailAPI = this.createTransactionalEmailAPI();
    this.notificationsService = new NotificationsService(this.transactionalEmailAPI);
  }

  createTransactionalEmailAPI() {
    switch (this.config.script) {
      case 'test:unit':
      case 'start:dev':
      case 'test:infra:incoming':
        return new MockTransactionalEmailAPI();
      default:
        return new ProductionTransactionalEmailAPI();
    }
  }

  getNotificationsService() {
    return this.notificationsService;
  }
}
