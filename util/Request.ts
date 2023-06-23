import 'isomorphic-fetch';

export default class Request {
  static get<T>(url): Promise<T> {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(response => {
          if (response.ok || response.status === 400) {
            return response.json();
          }
          throw new Error(`HTTP error ${response.status}. ${response.statusText}`);
        })
        .then(data => {
          const status = data?.meta?.code || 500;

          if (status !== 200) {
            throw new Error(
              `Untappd request error: ${data?.meta?.error_detail || 'Something went wrong.'}`,
            );
          }
          return resolve(data);
        })
        .catch(error => reject(error));
    });
  }
}
