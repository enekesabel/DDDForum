import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { APIResponse } from './api';

export abstract class HTTPClient {
  constructor(private baseUrl: string) {}

  private async request(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    path: string,
    data?: unknown,
    config: AxiosRequestConfig = {}
  ): Promise<APIResponse<unknown, unknown>> {
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

  protected get = (path: string, config: AxiosRequestConfig = {}) => this.request('get', path, undefined, config);
  protected post = (path: string, data: unknown, config: AxiosRequestConfig = {}) =>
    this.request('post', path, data, config);
  protected put = (path: string, data: unknown, config: AxiosRequestConfig = {}) =>
    this.request('put', path, data, config);
  protected patch = (path: string, data: unknown, config: AxiosRequestConfig = {}) =>
    this.request('patch', path, data, config);
  protected delete = (path: string, config: AxiosRequestConfig = {}) => this.request('delete', path, undefined, config);
}
