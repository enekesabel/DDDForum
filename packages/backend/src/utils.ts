import { User } from './database';
import { Response } from 'express';

// We don't want to return the password within the request
export function parseUserForResponse(user: User) {
  const returnData = JSON.parse(JSON.stringify(user));
  delete returnData.password;
  return returnData;
}

export function generateRandomPassword(length: number): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  const passwordArray = [];

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    passwordArray.push(charset[randomIndex]);
  }

  return passwordArray.join('');
}

export class ResponseBuilder<T> {
  private errorMessage: string | undefined;
  private dataToSend: T | undefined;
  private response: Response;
  private success: boolean | undefined;
  constructor(response: Response) {
    this.response = response;
  }

  error(error: string) {
    this.errorMessage = error;
    this.success = false;
    return this;
  }

  data(data: T) {
    this.dataToSend = data;
    this.success = true;
    this.errorMessage = undefined;
    return this;
  }

  status(status: number) {
    this.response.status(status);
    return this;
  }

  build() {
    return this.response.json({
      error: this.errorMessage,
      data: this.success ? this.dataToSend : undefined,
      success: this.success,
    });
  }
}
