import 'isomorphic-fetch';

export default class Request {
  static get<T>(url): Promise<T> {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}. ${response.statusText}`);
          }
          return response.json();
        })
        .then(data => resolve(data))
        .catch(error => reject(error));
    });
  }
}
