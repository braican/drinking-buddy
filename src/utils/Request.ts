import 'isomorphic-fetch';
import { error } from '@sveltejs/kit';
import type { ApiResponse } from '../app';

export default class Request {
  static req<Response>(f): Promise<Response> {
    return new Promise((resolve, reject) => {
      f.then(response => {
        if (response.status === 404) {
          throw error(404);
        }

        if (response.ok) {
          return response.json();
        }
        throw new Error(
          `[Application API request error] HTTP error ${response.status}. ${response.statusText}`,
        );
      })
        .then((data: ApiResponse<Response>) => {
          if (data.success) {
            return resolve(data.data);
          }

          if (data.status === 404) {
            throw error(404);
          }

          throw new Error(
            `[Application API request error] API request was not a success: ${data.message}`,
          );
        })
        .catch(error => reject(error));
    });
  }

  static get<Response>(url: string, _fetch = fetch, options: object = {}): Promise<Response> {
    const f = _fetch(url, options);
    return Request.req<Response>(f);
  }

  static post<Response>(
    url: string,
    body: object = {},
    _fetch = fetch,
    options: object = {},
  ): Promise<Response> {
    const data = JSON.stringify(body);

    const f = _fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data,
      ...options,
    });

    return Request.req<Response>(f);
  }

  static getExternal<Response>(url, _fetch = fetch): Promise<Response> {
    return new Promise((resolve, reject) => {
      _fetch(url)
        .then(response => {
          if (response.ok || response.status === 400) {
            return response.json();
          }
          throw new Error(
            `[External request error] HTTP error ${response.status}. ${response.statusText}`,
          );
        })
        .then(data => resolve(data))
        .catch(error => reject(error));
    });
  }
}
