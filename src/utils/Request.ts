import 'isomorphic-fetch';

export default class Request {
  static get<Response>(url): Promise<Response> {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(response => {
          if (response.ok || response.status === 400) {
            return response.json();
          }
          throw new Error(`HTTP error ${response.status}. ${response.statusText}`);
        })
        .then(data => resolve(data))
        .catch(error => reject(error));
    });
  }

  static post<Response>(url: string, body: object = {}): Promise<Response> {
    return new Promise((resolve, reject) => {
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
        .then(response => {
          if (response.ok || response.status === 400) {
            return response.json();
          }
          throw new Error(`HTTP error ${response.status}. ${response.statusText}`);
        })
        .then(data => resolve(data))
        .catch(error => reject(error));
    });
  }
}
