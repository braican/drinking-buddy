import 'isomorphic-fetch';

export default class Request {
  static getExternal<Response>(url): Promise<Response> {
    return new Promise((resolve, reject) => {
      fetch(url)
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
