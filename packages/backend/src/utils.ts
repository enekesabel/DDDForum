import { Response } from 'express';

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
