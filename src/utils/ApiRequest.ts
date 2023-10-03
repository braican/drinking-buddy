export default class ApiRequest {
  fetchFn;
  base = '/api';

  constructor(fetchFn = fetch) {
    this.fetchFn = fetchFn;
  }

  private request<Response>(f): Promise<Response> {
    return new Promise((resolve, reject) => {
      f.then(response => {
        if (response.ok) {
          return response.json();
        }

        throw new Error(response.statusText);
      })
        .then(data => {
          if (data && data.success) {
            return resolve(data.data);
          }

          throw new Error(data.message);
        })
        .catch(error => reject(error));
    });
  }

  get<Response>(route: string, options: object = {}): Promise<Response> {
    const f = this.fetchFn(`${this.base}/${route}`, options);
    return this.request(f).catch(error => {
      console.error(`[Error GET ${this.base}/${route}]`, error);
    }) as Promise<Response>;
  }

  post<Response>(route: string, body: object = {}, options: object = {}): Promise<Response> {
    const f = this.fetchFn(`${this.base}/${route}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      ...options,
    });

    return this.request(f).catch(error => {
      console.error(`[Error POST ${this.base}/${route}]`, error);
    }) as Promise<Response>;
  }
}
