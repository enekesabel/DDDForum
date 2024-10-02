import { APIResponse } from './api';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

export abstract class HTTPClient {
  constructor(private baseUrl: string) {}

  private async request<T, U>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    path: string,
    data?: unknown,
    config: AxiosRequestConfig = {}
  ): Promise<APIResponse<T, U>> {
    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${path}`,
        data,
        ...config,
      });

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return error.response?.data;
      } else {
        throw error; // Re-throw non-HTTP errors
      }
    }
  }

  protected get = <T, U>(path: string, config: AxiosRequestConfig = {}) =>
    this.request<T, U>('get', path, undefined, config);
  protected post = <T, U>(path: string, data: unknown, config: AxiosRequestConfig = {}) =>
    this.request<T, U>('post', path, data, config);
  protected put = <T, U>(path: string, data: unknown, config: AxiosRequestConfig = {}) =>
    this.request<T, U>('put', path, data, config);
  protected patch = <T, U>(path: string, data: unknown, config: AxiosRequestConfig = {}) =>
    this.request<T, U>('patch', path, data, config);
  protected delete = <T, U>(path: string, config: AxiosRequestConfig = {}) =>
    this.request<T, U>('delete', path, undefined, config);
}
