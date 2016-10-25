import { SECURITY_RECEIVE_USER, SECURITY_CHECK_FAILED, SECURITY_LOGOUT } from '../actions';

export const reducer = (state = { ready: false, isLoggedin: false, user: false }, action) => {
  switch (action.type) {
    case SECURITY_RECEIVE_USER:
      return {
        ready: true,
        isLoggedin: true,
        user: action.payload
      };
    case SECURITY_CHECK_FAILED:
    case SECURITY_LOGOUT:
      return {
        isLoggedin: false,
        ready: true,
        user: false
      };
    default:
      return state;
  }
};

export default reducer;
