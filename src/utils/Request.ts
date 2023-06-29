import 'isomorphic-fetch';
import type { ApiResponse } from '../app';

export default class Request {
  static req<Response>(f): Promise<Response> {
    return new Promise((resolve, reject) => {
      f.then(response => {
        if (response.ok || response.status === 400) {
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

          throw new Error(
            `[Application API request error] API request was not a success: ${data.message}`,
          );
        })
        .catch(error => reject(error));
    });
  }

  static get<Response>(url, _fetch = fetch): Promise<Response> {
    const f = _fetch(url);
    return Request.req<Response>(f);
  }

  static post<Response>(url: string, body: object = {}, _fetch = fetch): Promise<Response> {
    const f = _fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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
