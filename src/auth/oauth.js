import superagent from 'superagent';
import querystring from 'querystring';

import config from '../config';
import api from '../api/com';

const TOKEN_STORAGE_KEY = 'OAUTH2ACCESSTOKEN';

let accessToken = false;

const extractTokenFromUrl = () => {
  const url = window.location.toString(),
    index = url.indexOf('#access_token');
  if (index === -1) {
    return false;
  }
  const hash = url.slice(index + 1);
  const authParams = querystring.parse(hash);
  const token = authParams.access_token;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  window.history.replaceState({}, null, window.location.pathname);

  return token;
}

export const boot = () => {
  accessToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  accessToken = accessToken ? accessToken : extractTokenFromUrl();
  if (! accessToken) {
    return Promise.reject();
  }

  return superagent
    .get(`${api.baseUrl}v1.1/me`)
    .set('accept', 'application/json')
    .set('Authorization', `BEARER ${accessToken}`)
    .then(res => res.body);
};

export const logout = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  accessToken = false;
};

export const login = () => {
  window.location = `https://public-api.wordpress.com/oauth2/authorize?redirect_uri=${config.redirect_uri}&client_id=${config.client_id}&response_type=token`;
};

export const request = ({ method, url, body }) => {
  const req = superagent(method, url)
    .send(body)
    .set('accept', 'application/json');

  if (accessToken) {
    req.set('Authorization', `BEARER ${accessToken}`);
  }

  return new Promise(resolve =>
    req.end((err, response) => {
      let error = err;
      if (err && response.body && response.body.error) {
        error = response.body.error;
      } else if (err && response.error) {
        error = response.error.message;
      }

      resolve({
        status: response.status,
        body: response.body,
        error
      });
    })
  );
}
