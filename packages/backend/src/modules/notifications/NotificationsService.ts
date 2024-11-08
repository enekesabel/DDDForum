import { TransactionalEmailAPI } from './ports/TransactionalEmailAPI';

export class NotificationsService {
  constructor(private transactionalEmailAPI: TransactionalEmailAPI) {}

  async sendMail(to: string, subject: string, text: string) {
    return this.transactionalEmailAPI.sendMail({ to, subject, text });
  }
}
