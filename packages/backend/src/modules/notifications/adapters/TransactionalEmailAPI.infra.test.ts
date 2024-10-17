import { TransactionalEmailAPI } from '../ports/TransactionalEmailAPI';
import { ProductionTransactionalEmailAPI } from './ProductionTransactionalEmailAPI';
import { MockTransactionalEmailAPI } from './MockTransactionalEmailAPI';

const transactionalEmailAPIs: TransactionalEmailAPI[] = [
  new ProductionTransactionalEmailAPI(),
  new MockTransactionalEmailAPI(),
];

describe.each(transactionalEmailAPIs)('TransactionalEmailAPI', (transactionalEmailAPI: TransactionalEmailAPI) => {
  it('should send an email', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const emailData = {
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'This is a test email.',
    };
    await transactionalEmailAPI.sendMail(emailData);
    expect(consoleSpy).toHaveBeenCalledWith(
      `Sending email to ${emailData.to} with subject ${emailData.subject} and text ${emailData.text}`
    );
  });
});
