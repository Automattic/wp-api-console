import { API_ENDPOINTS_RECEIVE } from '../actions';

const endpoints = (state = {}, action) => {
  switch (action.type) {
    case API_ENDPOINTS_RECEIVE:
      const { apiName, version, endpoints } = action.payload;
      return {
        ...state,
        [apiName]: {
          ...(state[apiName] || {}),
          [version]: endpoints
        }
      };
    default:
      return state;
  }
};

export default endpoints;
