import { get } from '../../api';
import { SECURITY_RECEIVE_USER, SECURITY_CHECK_FAILED, SECURITY_LOGOUT } from '../actions';
import { isReady } from './selectors';

const receiveUser = (apiName, user) => {
  return {
    type: SECURITY_RECEIVE_USER,
    payload: { user, apiName }
  };
};

const secyrityCheckFailed = apiName => {
  return {
    type: SECURITY_CHECK_FAILED,
    payload: { apiName }
  };
};

export const boot = apiName => (dispatch, getState) => {
  if (isReady(getState(), apiName)) {
    return;
  }
  const api = get(apiName);
  api.authProvider
    .boot()
    .then(user => dispatch(receiveUser(apiName, user)))
    .catch(() => dispatch(secyrityCheckFailed(apiName)));
};

export const login = apiName => {
  const api = get(apiName);
  api.authProvider.login();
}

export const logout = apiName => dispatch => {
  const api = get(apiName);
  api.authProvider.logout();
  dispatch({
    type: SECURITY_LOGOUT,
    payload: { apiName }
  });
}
