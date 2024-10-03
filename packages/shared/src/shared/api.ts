export type APIError<U> = {
  message: string;
  code: U;
};

export type APISuccessResponse<T> = {
  success: true;
  data: T;
  error?: undefined;
};

export type APIErrorResponse<U> = {
  success: false;
  error: APIError<U>;
  data?: undefined;
};

export type APIResponse<T, U> = APISuccessResponse<T> | APIErrorResponse<U>;

export enum GenericErrors {
  ValidationError = 'ValidationError',
  ServerError = 'ServerError',
  ClientError = 'ClientError',
}
