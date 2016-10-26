import { SECURITY_RECEIVE_USER, SECURITY_CHECK_FAILED, SECURITY_LOGOUT } from '../actions';

export const reducer = (state = {}, action) => {
  switch (action.type) {
    case SECURITY_RECEIVE_USER:
      return {
        ...state,
        [action.payload.apiName]: {
          ready: true,
          isLoggedin: true,
          user: action.payload.user
        }
      }
    case SECURITY_CHECK_FAILED:
    case SECURITY_LOGOUT:
      return {
        ...state,
        [action.payload.apiName]: {
          isLoggedin: false,
          ready: true,
          user: false
        }
      };
    default:
      return state;
  }
};

export default reducer;
