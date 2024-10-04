import { Response } from 'express';
import { APIErrorResponse, APIResponse, APISuccessResponse } from '@dddforum/shared/src/shared';

type DataFromAPIResponse<Type> = Type extends APIResponse<infer X, infer _Y> ? X : never;
type ErrorFromAPIResponse<Type> = Type extends APIResponse<infer _X, infer Y> ? Y : never;

export class ResponseBuilder<T extends APIResponse<unknown, unknown> = never> {
  private errorMessage: string | undefined;

  private dataToSend: DataFromAPIResponse<T> | undefined;
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

  data(data: DataFromAPIResponse<T>) {
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
    return this.response.json(this.buildAPIResponse()) as unknown as T;
  }

  private buildAPIResponse(): T {
    if (this.success) {
      const response: APISuccessResponse<DataFromAPIResponse<T>> = {
        success: true,
        data: this.dataToSend as DataFromAPIResponse<T>,
      };
      return response as T;
    }
    const response: APIErrorResponse<ErrorFromAPIResponse<T>> = {
      success: false,
      error: {
        code: this.errorMessage as ErrorFromAPIResponse<T>,
        message: this.errorMessage || '',
      },
    };
    return response as T;
  }
}
