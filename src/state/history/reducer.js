import { REQUEST_SELECT_ENDPOINT } from '../actions';

const MAX_HISTORY_ENDPOINTS = 10;

const reducer = (state = {}, action) => {
  switch (action.type) {
    case REQUEST_SELECT_ENDPOINT:
      const { apiName, version, endpoint } = action.payload;
      if (! endpoint) {
        return state;
      }

      return {
        ...state,
        [apiName]: {
          ...(state[apiName] ? state[apiName] : {}),
          [version]: [
            endpoint,
            ...(state[apiName] && state[apiName][version] ? state[apiName][version] : [])
          ].slice(0, MAX_HISTORY_ENDPOINTS)
        }
      };
    default:
      return state;
  }
};

export default reducer;
