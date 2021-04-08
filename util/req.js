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

export const get = (url, data = null) =>
  new Promise((resolve, reject) => {
    if (data) {
      url = `${url}?${qs.stringify(data)}`;
    }

    fetch(url)
      .then(handleFetchResponse)
      .then(data => resolve(data))
      .catch(error => reject(error));
  });

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
      .then(data => resolve(data))
      .catch(error => reject(error));
  });
