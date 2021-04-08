const fetch = require('node-fetch');
const qs = require('qs');

const handleFetchResponse = res => {
  if (res.ok) {
    return res.json();
  }

  return new Promise((resolve, reject) => {
    res.text().then(reject);
  });
};

class Req {
  /**
   * Get request.
   *
   * @param {string} url URL to get.
   * @param {object} data Params to pass to the GET request.
   *
   * @return promise
   */
  static get(url, data = null) {
    return new Promise((resolve, reject) => {
      if (data) {
        url = `${url}?${qs.stringify(data)}`;
      }

      fetch(url)
        .then(handleFetchResponse)
        .then(data => resolve(data))
        .catch(error => reject(error));
    });
  }

  /**
   * Post request.
   *
   * @param {string} url URL to post to.
   * @param {object} data Params to pass with the post request.
   *
   * @return promise
   */
  static post(url, data = {}) {
    return new Promise((resolve, reject) => {
      fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(handleFetchResponse)
        .then(data => resolve(data))
        .catch(error => reject(error));
    });
  }
}

module.exports = Req;
