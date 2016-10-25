import authProvider from '../../auth';
import { SECURITY_RECEIVE_USER, SECURITY_CHECK_FAILED, SECURITY_LOGOUT } from '../actions';

const receiveUser = user => {
  return {
    type: SECURITY_RECEIVE_USER,
    payload: user
  };
};

const secyrityCheckFailed = () => {
  return {
    type: SECURITY_CHECK_FAILED
  };
};

export const boot = () => dispatch => {
  authProvider
    .boot()
    .then(user => dispatch(receiveUser(user)))
    .catch(() => dispatch(secyrityCheckFailed()));
};

export const login = () => authProvider.login();

export const logout = () => dispatch => {
  authProvider.logout();
  dispatch({
    type: SECURITY_LOGOUT
  });
}
