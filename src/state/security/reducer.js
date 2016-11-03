import { createReducer } from '../../lib/redux/create-reducer';
import { SECURITY_RECEIVE_USER, SECURITY_CHECK_FAILED, SECURITY_LOGOUT } from '../actions';

export const reducer = createReducer({}, {
  [SECURITY_RECEIVE_USER]: (state, { payload: { apiName, user } }) => ({
    ...state,
    [apiName]: {
      ready: true,
      isLoggedin: true,
      user
    }
  }),
  [SECURITY_CHECK_FAILED]: (state, { payload: { apiName }}) => ({
    ...state,
    [apiName]: {
      isLoggedin: false,
      ready: true,
      user: false
    }
  }),
  [SECURITY_LOGOUT]: (state, { payload: { apiName }}) => ({
    ...state,
    [apiName]: {
      isLoggedin: false,
      ready: true,
      user: false
    }
  })
});

export default reducer;
