import { TransactionalEmailAPI } from '../ports/TransactionalEmailAPI';

export class MockTransactionalEmailAPI implements TransactionalEmailAPI {
  async sendMail(input: { to: string; subject: string; text: string }): Promise<void> {
    console.log(`Sending email to ${input.to} with subject ${input.subject} and text ${input.text}`);
    return Promise.resolve();
  }
}
