import superagent from 'superagent';
import querystring from 'querystring';

import api from '../../api/com';
import config from '../../config';
import { SECURITY_RECEIVE_USER, SECURITY_CHECK_FAILED, SECURITY_LOGOUT } from '../actions';

const TOKEN_STORAGE_KEY = 'WPACCESSTOKEN';

const receiveUser = (token, user) => {
  return {
    type: SECURITY_RECEIVE_USER,
    payload: {
      token,
      user
    }
  };
};

const secyrityCheckFailed = () => {
  return {
    type: SECURITY_CHECK_FAILED
  };
};

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

export const boot = () => dispatch => {
  let token = localStorage.getItem(TOKEN_STORAGE_KEY);
  token = token ? token : extractTokenFromUrl();
  if (! token) {
    return dispatch(secyrityCheckFailed());
  }

  return superagent
    .get(`${api.baseUrl}v1.1/me`)
    .set('accept', 'application/json')
    .set('Authorization', `BEARER ${token}`)
    .then(res => {
      return dispatch(receiveUser(token, res.body));
    } )
    .catch(() => {
      return dispatch(secyrityCheckFailed());
    });

}

export const login = () => () => {
  window.location = `https://public-api.wordpress.com/oauth2/authorize?redirect_uri=${config.redirect_uri}&client_id=${config.client_id}&response_type=token`;
}

export const logout = () => dispatch => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  dispatch({
    type: SECURITY_LOGOUT
  });
}
