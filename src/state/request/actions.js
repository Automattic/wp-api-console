import { REQUEST_SET_METHOD,
  REQUEST_SELECT_ENDPOINT,
  REQUEST_UPDATE_URL,
  REQUEST_UPDATE_PATH_PART_VALUE,
  REQUEST_SET_QUERY_PARAM,
  REQUEST_SET_BODY_PARAM } from '../actions';

export const selectEndpoint = (apiName, version, endpoint) => {
  return {
    type: REQUEST_SELECT_ENDPOINT,
    payload: { apiName, version, endpoint }
  };
};

export const updateUrl = url => {
  return {
    type: REQUEST_UPDATE_URL,
    payload: url
  };
};

export const updatePathValue = (pathPart, value) => {
  return {
    type: REQUEST_UPDATE_PATH_PART_VALUE,
    payload: {
      pathPart,
      value
    }
  };
};

export const updateMethod = method => {
  return {
    type: REQUEST_SET_METHOD,
    payload: method
  };
};

export const setQueryParam = (param, value) => {
  return {
    type: REQUEST_SET_QUERY_PARAM,
    payload: { param, value }
  };
};

export const setBodyParam = (param, value) => {
  return {
    type: REQUEST_SET_BODY_PARAM,
    payload: { param, value }
  };
};
