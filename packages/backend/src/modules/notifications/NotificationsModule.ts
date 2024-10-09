import { TransactionalEmailAPI } from './TransactionalEmailAPI';

export class NotificationsModule {
  private transactionalEmailAPI = new TransactionalEmailAPI();

  getTransactionalEmailAPI() {
    return this.transactionalEmailAPI;
  }
}
