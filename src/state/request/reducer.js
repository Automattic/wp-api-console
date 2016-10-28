import {
  REQUEST_SET_METHOD,
  REQUEST_SELECT_ENDPOINT,
  REQUEST_UPDATE_URL,
  REQUEST_UPDATE_PATH_PART_VALUE,
  REQUEST_SET_QUERY_PARAM,
  REQUEST_SET_BODY_PARAM
} from '../actions';

const reducer = (state = { method: 'GET', endpoint: false, pathValues: {}, url: '', queryParams: {}, bodyParams: {} }, action) => {
  switch (action.type) {
    case REQUEST_SET_METHOD:
      return {
        ...state,
        method: action.payload
      }
    case REQUEST_SELECT_ENDPOINT:
      return {
        ...state,
        endpoint: action.payload.endpoint,
        pathValues: {},
        queryParams: {},
        bodyParams: {},
        url: ''
      };
    case REQUEST_UPDATE_URL:
      return {
        ...state,
        url: action.payload
      };
    case REQUEST_UPDATE_PATH_PART_VALUE:
      return {
        ...state,
        pathValues: {
          ...state.pathValues,
          [action.payload.pathPart]: action.payload.value
        }
      };
    case REQUEST_SET_BODY_PARAM:
      return {
        ...state,
        bodyParams: {
          ...state.bodyParams,
          [action.payload.param]: action.payload.value
        }
      };
    case REQUEST_SET_QUERY_PARAM:
      return {
        ...state,
        queryParams: {
          ...state.queryParams,
          [action.payload.param]: action.payload.value
        }
      };
    default:
      return state;
  }
};

export default reducer;
