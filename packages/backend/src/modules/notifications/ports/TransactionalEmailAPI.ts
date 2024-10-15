export interface TransactionalEmailAPI {
  sendMail(input: { to: string; subject: string; text: string }): Promise<void>;
}
