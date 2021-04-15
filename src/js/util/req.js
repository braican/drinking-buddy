import fetch from 'node-fetch';
import qs from 'qs';

const handleFetchResponse = res => {
  if (res.ok) {
    return res.json();
  }

  return new Promise((resolve, reject) => {
    res.text().then(reject);
  });
};

/**
 * Perform a GET request.
 *
 * @param {string} url Url to get from.
 * @param {object} data Data object.
 *
 * @returns Promise
 */
export const get = (url, data = null) =>
  new Promise((resolve, reject) => {
    if (data) {
      url = `${url}?${qs.stringify(data)}`;
    }

    fetch(url)
      .then(handleFetchResponse)
      .then(({ success, data }) => {
        if (!success) {
          return reject('Error in GET');
        }
        return resolve(data);
      })
      .catch(error => reject(error));
  });

/**
 * Perform a POST request.
 *
 * @param {string} url Url to get from.
 * @param {object} data Data object.
 *
 * @returns Promise
 */
export const post = (url, data = {}) =>
  new Promise((resolve, reject) => {
    fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(handleFetchResponse)
      .then(({ success, data }) => {
        if (!success) {
          return reject('Error in POST');
        }
        return resolve(data);
      })
      .catch(error => reject(error));
  });
